import { z } from 'zod';

import { formatString } from '@/app/_lib/utills';
import { MSG_EMAIL, MSG_MAX, MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD } from '@/app/_types/constants';

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
