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
