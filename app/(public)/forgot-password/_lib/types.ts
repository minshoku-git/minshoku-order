import { z } from 'zod';

/**
 * パスワード Schema
 */
export const PasswordSchema = z.object({
  /** メールアドレス */
  email: z.email({ message: '有効なメールアドレスを入力してください。' }),
});

/**
 * パスワード FormValues
 */
export type PasswordFormValues = z.infer<typeof PasswordSchema>;
