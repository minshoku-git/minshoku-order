import { z } from 'zod';

/**
 * 問い合わせ Schema
 */
export const ContactSchema = z.object({
  /** 本文 */
  mainText: z.string(),
});

/**
 * 問い合わせ FormValues
 */
export type ContactFormValues = z.infer<typeof ContactSchema>;
