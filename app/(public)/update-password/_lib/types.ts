import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD } from '@/app/_types/constants';

/**
 * パスワード再設定 Schema
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
  .superRefine((data, ctx) => {
    if (data.new_signup_password !== data.confirm_new_signup_password) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirm_new_signup_password'],
        message: '新しいパスワードが一致しません。',
      });
    }
  });

/**
 * パスワード再設定 FormValues
 */
export type PasswordResetFormValues = z.infer<typeof PasswordResetSchema>;

/**
 * パスワード再設定 Request
 */
export type PasswordResetRequest = {
  /** 暗号 */
  token: string;
} & PasswordResetFormValues;
