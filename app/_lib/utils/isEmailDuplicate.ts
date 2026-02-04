import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { t_administrator, t_user } from '../supabase/tableTypes';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>;
  email: string;
  //   isAdmin?: boolean;
  //   isUser?: boolean;
};

/**
 * メールアドレス重複確認
 * @returns boolean
 */
export async function isEmailDuplicate(props: Props) {
  /* メールアドレスの重複確認(ユーザー情報)
  ----------------------------------------------------------------- */
  const query = props.supabase.from('t_user').select('id').eq('user_email', props.email).maybeSingle();

  const { data, error } = (await query) as PostgrestSingleResponse<t_user>;

  if (error) {
    throw new CustomError(
      ErrorCodes.DB_QUERY_FAILED.code,
      'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
      ErrorCodes.DB_QUERY_FAILED.status
    );
  }
  if (data) {
    throw new CustomError(ErrorCodes.EMAIL_ALREADY_REGISTERED);
  }

  /* メールアドレスの重複確認(管理者情報)
  ------------------------------------------------------------------ */
  const queryAdmin = props.supabase.from('t_administrator').select('id').eq('email', props.email).maybeSingle();

  const { data: dataAdmin, error: errorAdmin } = (await queryAdmin) as PostgrestSingleResponse<t_administrator>;

  if (errorAdmin) {
    throw new CustomError(
      ErrorCodes.DB_QUERY_FAILED.code,
      'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
      ErrorCodes.DB_QUERY_FAILED.status
    );
  }
  if (dataAdmin) {
    throw new CustomError(ErrorCodes.EMAIL_ALREADY_REGISTERED);
  }

  return true;
}
