import { z } from 'zod';

import { MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * パスワード再設定 入力用バリデーションスキーマ
 */
export const PasswordResetSchema = z
  .object({
    /** 新しいパスワード */
    new_signup_password: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '新しいパスワード') })
      .regex(REG_PASSWORD, MSG_PASSWORD),
    /** 新しいパスワード(再入力) */
    confirm_new_signup_password: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, '新しいパスワード(再入力)') })
      .regex(REG_PASSWORD, MSG_PASSWORD),
  })
  .check((ctx) => {
    if (ctx.value.new_signup_password !== ctx.value.confirm_new_signup_password) {
      ctx.issues.push({
        code: 'custom',
        path: ['confirm_new_signup_password'],
        message: '新しいパスワードと新しいパスワード(再入力)が一致しません。',
        input: ctx.value,
      });
    }
  })
  .strict();

/**
 * パスワード再設定 FormValues
 */
export type PasswordResetFormValues = z.infer<typeof PasswordResetSchema>;

/**
 * 暗号 入力用バリデーションスキーマ
 */
export const TokenSchema = z
  .object({
    /** 暗号 */
    token: z.string(),
  })
  .strict();

/**
 * パスワード再設定 API用バリデーションスキーマ
 */
export const PasswordResetApiSchema = z
  .object({
    request: z.object({
      ...PasswordResetSchema.shape,
      ...TokenSchema.shape,
    }),
  })
  .strict();

/**
 * パスワード再設定 Request
 */
export type PasswordResetRequest = z.infer<typeof PasswordResetApiSchema>['request'];

/**
 * パスワード再設定 Response
 */
export type PasswordResetResponse = {
  /** 結果 */
  result: boolean;
  /** ErrorMessage */
  ErrorMessage?: string;
};
