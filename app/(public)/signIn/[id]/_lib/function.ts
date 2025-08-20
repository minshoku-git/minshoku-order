import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { decrypt } from '@/app/_lib/encryption/crypto';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import {
  t_companies,
  t_companies_department,
  t_companies_employment_status,
  t_user,
} from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getDomain, getPostgreSqlItems } from '@/app/_lib/utill';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserBasicFormValues, UserBasicInitData, UserBasicInitRequest } from './types';

/**
 * getInitData
 * 初期表示情報を取得する。
 * @param {ApiRequest<UserBasicInitRequest>} values - 取得条件
 * @returns {Promise<ApiResponse<UserBasicInitData>>} 初期表示情報
 */
export const getInitData = async (
  values: ApiRequest<UserBasicInitRequest>
): Promise<ApiResponse<UserBasicInitData>> => {
  const supabase = await createClient();
  const req = values.request;

  try {
    /* 復号化
    ------------------------------------------------------------------ */
    const t_companies_id = decrypt(req.token);

    /* 会社情報取得
    ------------------------------------------------------------------ */
    const query = supabase
      .from('t_companies')
      .select('company_name, branch_name')
      .eq('id', t_companies_id)
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
      .eq('t_companies_id', t_companies_id)
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
      .from('t_companies_department')
      .select('id, employment_status_name')
      .eq('t_companies_id', t_companies_id)
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
    const res: UserBasicInitData = {
      company_name: data.company_name!,
      branch_name: data.branch_name!,
      departmentOptions: depOpt,
      employmentStatusOptions: empOpt,
    };

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
 * @param {shopDeteilRequestData} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const insertUserProfile = async (values: UserBasicFormValues): Promise<ApiResponse<null>> => {
  const req = values;
  const supabase = await createClient();
  const pgClient = createPgClient();

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* Select - t_companies_domain
  　------------------------------------------------------------------ */
    const domain = getDomain(req.user_email);
    const selectSql = `
      SELECT
        user_email,
        signup_password
      From
        t_companies_domain
      WHERE
        t_companies_id = ${req.t_companies_id}
      AND
        domain_name = ${domain};`;

    // Insert
    const domainCheck = await pgClient.query(selectSql);
    const isCompanyDomain: boolean = domainCheck.rowCount ? domainCheck.rowCount > 0 : false;

    /* Insert - t_shops
  　------------------------------------------------------------------ */
    // InsertData setting
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
      user_name: req.user_name,
      user_name_kana: req.user_name_kana,
      optional_item_answer_1: req.optional_item_answer_1,
      optional_item_answer_2: req.optional_item_answer_2,
      master_usage_state: 0,
      t_companies_id: Number(req.t_companies_id),
      t_companies_department_id: Number(req.t_companies_department_id),
      t_companies_employment_status_id: Number(req.t_companies_employment_status_id),
      user_email: req.user_email,
      signup_password: '',
      user_registration_status: isCompanyDomain
        ? UserRegistrationStatus.WAITING_APPROVAL
        : UserRegistrationStatus.WAITING_APPROVAL, // 承認待ちかメール承認待ち
      usage_status: UsageStatus.DEACTIVATION,
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertShopText = `INSERT INTO t_shops (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertShopText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '店舗情報の新規登録' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const newShopId: number = result.rows[0]?.id;

    /* メール送信
  　------------------------------------------------------------------ */
    // 認証メール送信

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');
    console.log('Transaction completed, new company ID:', newShopId);

    return { success: true, data: null };
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
