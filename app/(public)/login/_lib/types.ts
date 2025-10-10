import { z } from 'zod';

import { MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * ユーザーログイン Schema
 */
export const UserLoginSchema = z.object({
  /** メールアドレス */
  email: z.email(),
  /** パスワード */
  password: z.string().nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') }),
});

/**
 * ユーザーログイン FormValues
 */
export type UserLoginFormValues = z.infer<typeof UserLoginSchema>;

/**
 *  LoginUserQueryResponse
 */
export type LoginUserQueryResponse = {
  /** 利用ステータス */
  usage_status?: string;
  /** ユーザー登録ステータス */
  user_registration_status?: string;
  /** 会社テーブル */
  t_companies?: {
    /** 利用ステータス */
    usage_status: string;
  };
};
