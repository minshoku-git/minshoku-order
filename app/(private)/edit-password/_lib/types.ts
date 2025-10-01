import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD } from '@/app/_types/constants';

/**
 * パスワード変更 Schema
 */
export const EditPasswordSchema = z
  .object({
    /** ユーザー名 */
    current_password: z.string().nonempty({ message: formatString(MSG_REQUIRED, '現在のパスワード') }),
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
        message: '新しいパスワードと再入力のパスワードが一致しません。',
      });
    }
  });

/**
 * パスワード変更 FormValues
 */
export type EditPasswordFormValues = z.infer<typeof EditPasswordSchema>;
