import { z } from 'zod';

import { MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

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
  .check((ctx) => {
    if (ctx.value.new_signup_password !== ctx.value.confirm_new_signup_password) {
      ctx.issues.push({
        code: 'custom',
        path: ['confirm_new_signup_password'],
        message: '新しいパスワードと新しいパスワード(再入力)が一致しません。',
        input: ctx.value,
      });
    }
  });

/**
 * パスワード変更 FormValues
 */
export type EditPasswordFormValues = z.infer<typeof EditPasswordSchema>;
