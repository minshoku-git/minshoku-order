import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_companies_department, t_companies_employment_status, t_user } from '@/app/_lib/supabase/tableTypes';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getLoginUserDetail } from '../../../_lib/getLoginUser/getLoginUserDetail';
import { UserProfileFormValues, UserProfileInitData } from './types';

/* 会員情報の変更
------------------------------------------------------------------ */
/**
 * getUserProfileInitData
 * 「会員情報の変更」の初期表示情報を取得する。
 *
 * @param {ApiRequest<number>} values - いらないかも！
 * @returns {Promise<UserDetailFormValues>} 初期表示情報
 */
export const getUserProfileInitData = async (values: ApiRequest<number>): Promise<ApiResponse<UserProfileInitData>> => {
  const supabase = await createClient();

  try {
    /* ユーザー情報の取得
    ------------------------------------------------------------------ */
    const userEmail: string = (await supabase.auth.getUser()).data.user?.email ?? '';
    const query = supabase
      .from('t_user')
      .select(
        `
      user_name,
      user_name_kana,
      user_email,
      t_companies_id,
      t_companies_department_id,
      t_companies_employment_status_id,
      optional_item_answer_1,
      optional_item_answer_2,
      t_companies!inner(
        company_name,
        branch_name,
        optional_item_title_1,
        optional_item_notes_1,
        optional_item_title_2,
        optional_item_notes_2
      )
      `
      )
      .eq('user_email', userEmail)
      .eq('usage_status', UsageStatus.AVAILABLE)
      .eq('user_registration_status', UserRegistrationStatus.REGISTERED)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserProfileInitData>;

    if (error || !data) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '会員情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 部署の選択肢取得
  　------------------------------------------------------------------ */
    const queryDep = supabase
      .from('t_companies_department')
      .select('id,department_name')
      .eq('t_companies_id', data.t_companies_id)
      .eq('delete_flag', 0)
      .order('id', { ascending: true });

    const { data: dataDep, error: errorDep } = (await queryDep) as PostgrestSingleResponse<t_companies_department[]>;

    if (errorDep || !dataDep) {
      console.error(dataDep);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '部署情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 雇用形態の選択肢取得
  　------------------------------------------------------------------ */
    const depOpt: SelectOption[] = dataDep?.map((m) => {
      return { id: m.id!.toString(), label: m.department_name! };
    });

    // 雇用形態の選択肢
    const queryEmp = supabase
      .from('t_companies_employment_status')
      .select('id,employment_status_name')
      .eq('t_companies_id', data.t_companies_id)
      .eq('delete_flag', 0)
      .order('id', { ascending: true });

    const { data: dataEmp, error: errorEmp } = (await queryEmp) as PostgrestSingleResponse<
      t_companies_employment_status[]
    >;

    if (errorEmp || !dataEmp) {
      console.error(errorEmp);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '雇用種別情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const empOpt: SelectOption[] = dataEmp?.map((m) => {
      return { id: m.id!.toString(), label: m.employment_status_name! };
    });

    /* 返却
  　------------------------------------------------------------------ */
    const res: UserProfileInitData = {
      ...data,
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
        error: e,
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * ユーザー情報の更新
 * @returns {Promise<ApiResponse<string>>}
 */
export const updateProfile = async (values: ApiRequest<UserProfileFormValues>): Promise<ApiResponse<null>> => {
  const client = await createClient();
  const req = values.request;
  const now = getNow();

  try {
    const user = await getLoginUserDetail(client);

    const query = client
      .from('t_user')
      .update<t_user>({
        user_name: req.user_name,
        user_name_kana: req.user_name_kana,
        t_companies_department_id: Number(req.t_companies_department_id),
        t_companies_employment_status_id: Number(req.t_companies_employment_status_id),
        optional_item_answer_1: req.optional_item_answer_1,
        optional_item_answer_2: req.optional_item_answer_2,
        updated_at: now,
      })
      .eq('user_email', user.user_email)
      .single();

    const { error } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の更新' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// /**
//  * パスワード変更
//  * @returns {Promise<ApiResponse<string>>}
//  */
// export const updatePassword = async (req: ApiRequest<UserProfileFormValues>): Promise<ApiResponse<null>> => {
//   const supabase = await createClient();

//   try {
//     /* 新しいパスワードと新しいパスワード(再入力)の検証
//   　------------------------------------------------------------------ */
//     if (req.request.signup_password !== req.request.confirm_signup_password) {
//       throw new CustomError(ErrorCodes.NOT_FOUND.code, '' + ErrorCodes.NOT_FOUND.message, ErrorCodes.NOT_FOUND.status);
//     }

//     /* 現在のパスワードの検証
//   　------------------------------------------------------------------ */
//     const email: string = (await supabase.auth.getUser()).data.user?.email ?? '';

//     const verifyClient = await createClient(); // MEMO: 別クライアントで検証
//     const { error: signInError } = await verifyClient.auth.signInWithPassword({
//       email,
//       password: req.request.current_signup_password,
//     });

//     if (signInError) {
//       console.error('現在のパスワード検証エラー:', signInError);
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         '現在のパスワードが正しくありません' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }

//     /* パスワード更新
//   　------------------------------------------------------------------ */
//     const { error } = await supabase.auth.updateUser({
//       password: req.request.signup_password,
//     });

//     if (error) {
//       console.log(error.message);
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'パスワードの更新' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }

//     return { success: true, data: null };
//   } catch (e: unknown) {
//     if (e instanceof CustomError) {
//       return {
//         success: false,
//         error: {
//           code: e.code,
//           message: e.message,
//         },
//       };
//     }
//     return {
//       success: false,
//       error: {
//         code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
//         message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
//       },
//     };
//   }
// };

// /**
//  * メールアドレス変更 ※不使用になるかもしれない。
//  * @returns {Promise<ApiResponse<string>>}
//  */
// export const updateEmail = async (req: ApiRequest<UserProfileFormValues>): Promise<ApiResponse<null>> => {
//   const supabase = await createClient();

//   try {
//     /* 現在のメールアドレスと変更後のメールアドレスの比較
//   　------------------------------------------------------------------ */
//     const email: string = (await supabase.auth.getUser()).data.user?.email ?? '';
//     if (req.request.user_email.toLowerCase() === email.toLowerCase()) {
//       throw new CustomError({
//         ...ErrorCodes.NOT_FOUND,
//         message: '新しいメールアドレスが現在のメールアドレスと同じです。' + ErrorCodes.NOT_FOUND.message,
//       });
//     }

//     /* メールアドレスの重複確認(ユーザー情報)
//   　------------------------------------------------------------------ */
//     const query = supabase.from('t_user').select('id').eq('user_email', req.request.user_email).single();

//     const { data, error } = (await query) as PostgrestSingleResponse<t_user>;

//     if (error) {
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'ユーザー情報の取得' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }
//     if (data) {
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'このメールアドレスは既に使用されています。' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }

//     /* メールアドレスの重複確認(管理者情報)
//   　------------------------------------------------------------------ */
//     const queryAdmin = supabase.from('t_administrator').select('id').eq('email', req.request.user_email).single();

//     const { data: dataAdmin, error: errorAdmin } = (await queryAdmin) as PostgrestSingleResponse<t_administrator>;

//     if (errorAdmin) {
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'ユーザー情報の取得' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }
//     if (dataAdmin) {
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'このメールアドレスは既に使用されています。' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }

//     /* メールアドレス更新
//   　------------------------------------------------------------------ */
//     const { error: errorPw } = await supabase.auth.updateUser({
//       email: req.request.user_email,
//     });

//     if (errorPw) {
//       console.log(errorPw.message);
//       throw new CustomError(
//         ErrorCodes.NOT_FOUND.code,
//         'パスワードの更新' + ErrorCodes.NOT_FOUND.message,
//         ErrorCodes.NOT_FOUND.status
//       );
//     }

//     return { success: true, data: null };
//   } catch (e: unknown) {
//     console.error('Transaction failed:', e);

//     if (e instanceof CustomError) {
//       return {
//         success: false,
//         error: {
//           code: e.code,
//           message: e.message,
//         },
//       };
//     }
//     return {
//       success: false,
//       error: {
//         code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
//         message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
//       },
//     };
//   }
// };
