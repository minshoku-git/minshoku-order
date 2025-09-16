import { z } from 'zod';

import { PaymentType } from '@/app/_types/enum';

/**
 * パスワード再設定 Schema
 */
export const PasswordResetSchema = z.object({
  /** 新しいパスワード */
  angou: z.string().optional(),
  /** 新しいパスワード(再入力) */
  hukugou: z.string().optional(),
  /** 新しいパスワード */
  angou0: z.string().optional(),
  /** 新しいパスワード(再入力) */
  hukugou0: z.string().optional(),
  /** 新しいパスワード(再入力) */
  payment_type: z.string(),
});

/**
 * パスワード再設定 FormValues
 */
export type PasswordResetFormValues = z.infer<typeof PasswordResetSchema>;

/**
 * パスワード再設定 Request
 */
export type PasswordResetRequest = {
  /** メールアドレス */
  email: string;
} & PasswordResetFormValues;

/**
 * パスワード再設定(認証) Request
 */
export type CheckTokenRequest = {
  /** 暗号 */
  token: string;
  /** 種別 */
  type: string;
};

// /**
//  * パスワード再設定(認証) Response
//  */
// export type CheckTokenResponse = {
//   /** メールアドレス */
//   email: string;
// };

/**
 * Auth取得 Response
 */
export type GetAuthResponse = {
  /** メールアドレス */
  email: string;
  /** ID */
  id: string;
};
