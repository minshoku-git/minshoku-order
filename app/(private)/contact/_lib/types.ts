import { z } from 'zod';

/**
 * 問い合わせ Schema
 */
export const ContactSchema = z.object({
  /** 本文 */
  contactMessage: z.string(),
});

/**
 * 問い合わせ FormValues
 */
export type ContactFormValues = z.infer<typeof ContactSchema>;

export type ContactMessageDetails = {
  /** ユーザー名 */
  userName: string;
  /** ユーザー名カナ */
  userNameKana: string;
  /** メールアドレス */
  userEmail: string;
  /** 問い合わせID */
  contactId: number;
  /** 本文 */
  contactMessage: string;
  /** 問い合わせ日時 */
  date: string;
  /** 会社名 */
  companyName: string;
  /** 支店名 */
  branchName: string;
};
