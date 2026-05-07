import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { PaymentType, SelectType, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { EditPaymentFormValues, EditPaymentInitData, UserAndCompaniesEmploymentStatus, CreditCardData } from './types';
import { saveGmoMember, saveGmoCard, searchGmoCards } from './gmoApi';

/* 支払い情報の更新
------------------------------------------------------------------ */

/**
 * getUserProfileInitData
 * 「会員情報の変更」の初期表示情報を取得する。
 *
 * @returns {Promise<EditPaymentInitData>} 初期表示情報
 */
export const getEditPaymentTypeInitData = async (): Promise<ApiResponse<EditPaymentInitData>> => {
  const supabase = await createClient();

  try {
    /* 1. ユーザー情報の取得
    ------------------------------------------------------------------ */
    const user = (await supabase.auth.getUser()).data.user;
    if (!user?.email) throw new CustomError(ErrorCodes.LOGGED_OUT);

    const query = supabase
      .from('t_user')
      .select(
        `
        payment_type,
        credit_member_id,
        credit_seq_choice,
        t_companies_employment_status!inner(
          deduction_flag,
          credit_flag,
          paypay_flag
        )
        `
      )
      .eq('user_email', user.email)
      // ユーザーの状態に関するフィルタを追加
      .eq('usage_status', UsageStatus.AVAILABLE)
      .eq('user_registration_status', UserRegistrationStatus.REGISTERED)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserAndCompaniesEmploymentStatus>;

    if (error || !data) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '支払い情報の取得に失敗しました',
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 2. GMOからカード一覧を取得
    ------------------------------------------------------------------ */
    let cards: CreditCardData[] = [];
    if (data.credit_member_id) {
      // 前回追加した SearchCard API を呼び出す
      cards = await searchGmoCards(data.credit_member_id);
    }

    return {
      success: true,
      data: {
        currentPaymentType: data.payment_type as PaymentType,
        // 現在選択されているカード連番 (credit_seq_choice)
        currentCardDataId: data.credit_seq_choice ?? '',
        creditCardDatas: cards,
        credit_flag: data.t_companies_employment_status.credit_flag as SelectType,
        deduction_flag: data.t_companies_employment_status.deduction_flag as SelectType,
        paypay_flag: data.t_companies_employment_status.paypay_flag as SelectType,
      },
    };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return { success: false, error: e };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * registerPaymentType
 * 支払い情報を更新する。
 *
 * @param { ApiRequest<EditPaymentFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const updatePaymentType = async (values: ApiRequest<EditPaymentFormValues>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const supabase = await createClient();
  const pgClient = await createPgClient();

  try {
    await pgClient.query('BEGIN');
    const { data: authData } = await supabase.auth.getUser();
    const email = authData.user?.email;
    if (!email) throw new Error('セッションが切れました');

    // ユーザー情報の取得（credit_member_id を確認）
    const { data: userData, error: fetchError } = await supabase
      .from('t_user')
      .select('id, credit_member_id')
      .eq('user_email', email)
      .single();

    if (fetchError || !userData) throw new Error('ユーザー情報の取得に失敗しました');

    // 現在使用している MemberID (DBから取得、なければ生成)
    const memberId = userData?.credit_member_id || `USER-${email.replace(/[@.]/g, '')}`;

    let finalCardSeq = req.creditcard; // 通常はラジオボタンで選んだ ID

    /* 新規カード登録のフロー
    ------------------------------------------------------------------ */
    if (req.paymentType === PaymentType.CREDITCARD && req.creditcard === 'new' && req.token) {
      
      // 1. GMO会員登録 (既に登録済みでも、内部でエラーを無視する設計にしています)
      const memberRes = await saveGmoMember(memberId);
      if (!memberRes.success) throw new Error(`GMO会員登録失敗: ${memberRes.errInfo}`);

      // 2. GMOカード登録 (ここでトークンを使用)
      const cardRes = await saveGmoCard(memberId, req.token);
      
      // ★ エラーが出た場合はここでストップ
      if (cardRes.ErrCode) {
         throw new Error(`GMOカード登録失敗: ${cardRes.ErrInfo}`);
      }

      // 3. GMOから返ってきた CardSeq (0, 1, 2...) を取得
      // これを保存することで「今登録したカード」が選択状態になります。
      finalCardSeq = cardRes.CardSeq || '0';
    }

    /* DBの更新 (t_user)
    ------------------------------------------------------------------ */
    const updateSql = `
      UPDATE t_user 
      SET 
        payment_type = $1, 
        credit_member_id = $2, 
        credit_seq_choice = $3, 
        updated_at = NOW() 
      WHERE user_email = $4
    `;
    
    await pgClient.query(updateSql, [
      req.paymentType, 
      memberId, 
      finalCardSeq, // 新規登録なら新しいSeq、既存なら選択されたSeq
      email
    ]);

    await pgClient.query('COMMIT');
    return { success: true, data: null };

  } catch (e: any) {
    await pgClient.query('ROLLBACK');
    console.error('[updatePaymentType] Error:', e.message);
    return { success: false, error: { code: 'UPDATE_ERROR', message: e.message } };
  } finally {
    await pgClient.end();
  }
};
