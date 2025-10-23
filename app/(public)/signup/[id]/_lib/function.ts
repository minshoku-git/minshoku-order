import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { decrypt, encrypt } from '@/app/_lib/encryption/crypto';
import { sendMail } from '@/app/_lib/mailer/mailer';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import {
  t_companies,
  t_companies_department,
  t_companies_employment_status,
  t_user,
} from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { formatJstDateTime, getNow } from '@/app/_lib/utils/getDateTime';
import { isEmailDuplicate } from '@/app/_lib/utils/isEmailDuplicate';
import { getDomain, getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import {
  ApprovalRequestMessageDetails,
  SignUpDecrypt,
  SignUpEncrypt,
  SignUpInitData,
  SignUpInitRequest,
  SignUpRequest,
  SignUpResponse,
} from './types';

/**
 * getInitData
 * 初期表示情報を取得する。
 * @param {ApiRequest<SignUpInitRequest>} values - 取得条件
 * @returns {Promise<ApiResponse<SignUpInitData>>} 初期表示情報
 */
export const getSignUpInitData = async (
  values: ApiRequest<SignUpInitRequest>
): Promise<ApiResponse<SignUpInitData>> => {
  const supabase = await createClient();
  const token = values.request;

  try {
    /* 復号化
    ------------------------------------------------------------------ */
    const decryptToken: string = decrypt(token.token);
    const req: SignUpDecrypt = JSON.parse(decryptToken);
    console.log('復号化結果:' + req.t_companies_id);

    /* 会社情報取得
    ------------------------------------------------------------------ */
    const query = supabase
      .from('t_companies')
      .select(
        `company_name,
         branch_name,
         optional_item_title_1,
         optional_item_notes_1,
         optional_item_title_2,
         optional_item_notes_2`
      )
      .eq('id', req.t_companies_id)
      // .eq('delete_flag', 0) // TASK: 取得条件の確認
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<t_companies>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '会社情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 部署の選択肢取得
    ------------------------------------------------------------------ */
    const queryDep = supabase
      .from('t_companies_department')
      .select('id, department_name')
      .eq('t_companies_id', req.t_companies_id)
      .eq('delete_flag', 0)
      .order('id', { ascending: true });

    const { data: dataDep, error: errorDep } = (await queryDep) as PostgrestSingleResponse<t_companies_department[]>;

    if (errorDep || !dataDep) {
      console.error(dataDep);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '部署情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const depOpt: SelectOption[] = dataDep?.map((m) => {
      return { id: m.id!.toString(), label: m.department_name! };
    });
    /* 雇用形態の選択肢取得
    ------------------------------------------------------------------ */
    const queryEmp = supabase
      .from('t_companies_employment_status')
      .select('id, employment_status_name')
      .eq('t_companies_id', req.t_companies_id)
      .eq('delete_flag', 0)
      .order('id', { ascending: true });

    const { data: dataEmp, error: errorEmp } = (await queryEmp) as PostgrestSingleResponse<
      t_companies_employment_status[]
    >;

    if (errorEmp || !dataEmp) {
      console.error(errorEmp);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '雇用種別情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const empOpt: SelectOption[] = dataEmp?.map((m) => {
      return { id: m.id!.toString(), label: m.employment_status_name! };
    });

    /* 返却
    ------------------------------------------------------------------ */
    const res: SignUpInitData = {
      company_name: data.company_name!,
      branch_name: data.branch_name!,
      departmentOptions: depOpt,
      employmentStatusOptions: empOpt,
      optional_item_notes_1: data.optional_item_notes_1 ?? '',
      optional_item_notes_2: data.optional_item_notes_2 ?? '',
      optional_item_title_1: data.optional_item_title_1 ?? '',
      optional_item_title_2: data.optional_item_title_2 ?? '',
    };
    console.log(res);
    return {
      success: true,
      data: res,
    };
  } catch (e: unknown) {
    console.error(e);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  }
};

/**
 * insertUserProfile
 * ユーザー情報を新規登録する。
 *
 * @param {SignUpRequest} values - 入力情報
 * @returns {Promise<ApiResponse<SignUpResponse>>} 結果
 */
export const insertUserProfile = async (values: ApiRequest<SignUpRequest>): Promise<ApiResponse<SignUpResponse>> => {
  const req = values.request;
  const now = formatJstDateTime(getNow());
  const supabase = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* 復号化
    ------------------------------------------------------------------ */
    const decryptToken: string = decrypt(req.token);
    const decryptRes: SignUpDecrypt = JSON.parse(decryptToken);
    console.log('復号化結果:' + decryptRes.t_companies_id);

    /* 暗号化
    ------------------------------------------------------------------ */
    const encryptPassword: string = encrypt(req.signup_password);

    /* ユーザー新規登録
    ------------------------------------------------------------------ */

    /* Select - メールアドレスの重複確認
  　------------------------------------------------------------------ */
    await isEmailDuplicate({ email: req.user_email, supabase: supabase });

    /* Select - t_companies
  　------------------------------------------------------------------ */
    const domainName = getDomain(req.user_email);
    const selectSql = `
        SELECT *
        FROM t_companies
        WHERE id = $1
        AND $2 = ANY(domain)`;

    // Insert
    const domainCheck = await pgClient.query(selectSql, [decryptRes.t_companies_id, domainName]);
    const isCompanyDomain: boolean = domainCheck.rowCount ? domainCheck.rowCount > 0 : false;

    /* Insert - t_user
  　------------------------------------------------------------------ */
    const insertValues: Omit<
      t_user,
      | 'id'
      | 'payment_type'
      | 'url_key'
      | 'credit_member_id'
      | 'credit_seq_choice'
      | 'master_memo'
      | 'created_at'
      | 'updated_at'
    > = {
      t_companies_id: decryptRes.t_companies_id,
      t_companies_department_id: Number(req.t_companies_department_id),
      t_companies_employment_status_id: Number(req.t_companies_employment_status_id),
      user_name: req.user_name,
      user_name_kana: req.user_name_kana,
      optional_item_answer_1: req.optional_item_answer_1,
      optional_item_answer_2: req.optional_item_answer_2,
      user_email: req.user_email,
      signup_password: encryptPassword,
      user_registration_status: isCompanyDomain
        ? UserRegistrationStatus.WAITING_EMAIL_VERIFICATION
        : UserRegistrationStatus.WAITING_APPROVAL, // 承認待ちかメール認証待ち
      usage_status: UsageStatus.DEACTIVATION,
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertUserText = `INSERT INTO t_user (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertUserText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '会員情報の新規登録' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const newUserId: number = result.rows[0]?.id;

    /* 暗号化
    ------------------------------------------------------------------ */
    const signUpEncrypt: SignUpEncrypt = { id: newUserId };
    const signUpEncryptReq: string = encrypt(JSON.stringify(signUpEncrypt));

    /* 認証メール送信
  　------------------------------------------------------------------ */
    if (isCompanyDomain) {
      // TODO: URL差し替え
      const { error: signUpError } = await supabase.auth.signUp({
        email: req.user_email,
        password: req.signup_password,
        options: { emailRedirectTo: process.env.APP_URL_DEV + '/pre-registration/' + signUpEncryptReq },
      });

      if (signUpError) {
        console.error('Error signing up:', signUpError);
        throw new CustomError(
          ErrorCodes.NOT_FOUND.code,
          '認証メール送信' + ErrorCodes.NOT_FOUND.message,
          ErrorCodes.NOT_FOUND.status
        );
      }
    } else {
      /* 承認依頼メール送信
  　  ------------------------------------------------------------------ */
      const message = generateApprovalRequestMessage({
        date: now,
        userName: req.user_name,
        userNameKana: req.user_name_kana,
        userEmail: req.user_email,
        companyName: req.t_companies_department_id,
        branchName: '',
        userId: signUpEncryptReq,
      });

      await sendMail({
        title: '【みんなの社食】ユーザー承認依頼',
        text: message,
      });
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new user ID:', newUserId);

    return { success: true, data: { isCompanyDomain } };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

const generateApprovalRequestMessage = (details: ApprovalRequestMessageDetails): string => {
  const { date, userName, userNameKana, userEmail, companyName, branchName, userId } = details;

  return `
運営ご担当者様

お疲れ様です。  
下記ユーザーの詳細をご確認の上、ユーザーの承認または否認を行ってください。

────────────────────  
■ 申請日時  
${date}

■ ユーザー情報  
・お名前：${userName}(${userNameKana}) 様
・会社名：${companyName}  
・部署名：${branchName}  
・メールアドレス：${userEmail}

■ 承認
承認する場合は、下記URLにアクセスしてください。
http://localhost:3000/decision-result/0?token=${userId}

■ 否認
否認する場合は、下記URLにアクセスしてください。
http://localhost:3000/decision-result/1?token=${userId}


ご確認のほど、よろしくお願いいたします。

（自動送信）`.trim();
};
