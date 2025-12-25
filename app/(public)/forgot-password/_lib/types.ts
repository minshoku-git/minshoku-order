import { z } from 'zod';

import { MSG_EMAIL, MSG_REQUIRED } from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';

/**
 * パスワード Schema
 */
export const PasswordSchema = z.object({
  /** メールアドレス */
  email: z
    .email(formatString(MSG_EMAIL, 'メールアドレス'))
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') }),
});

/**
 * パスワード FormValues
 */
export type PasswordFormValues = z.infer<typeof PasswordSchema>;
