import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_MIN_TO_MAX, MSG_REQUIRED, REG_HANKAKU_NUM } from '@/app/_types/constants';
import { PaymentType } from '@/app/_types/enum';
import { SelectOption } from '@/app/_types/types';

/**
 * ユーザー支払い情報 Schema
 */
export const UserPaymentSchema = z.object({
  /** 支払い種別 */
  payment_type: z.nativeEnum(PaymentType),
  /** クレジットカード番号 */
  creditcard_number: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'クレジットカード番号') })
    .regex(new RegExp(REG_HANKAKU_NUM), 'は半角数字を入力してください。')
    .min(14, formatString(MSG_MIN_TO_MAX, 'クレジットカード番号', '14', '16'))
    .max(16, formatString(MSG_MIN_TO_MAX, 'クレジットカード番号', '14', '16')),
  /** 有効期限(年) */
  creditcard_year: z.string().optional(),
  /** 有効期限(月) */
  creditcard_month: z.string().optional(),
  /** セキュリティコード */
  security_code: z.string().optional(),
});

/**
 * ユーザー支払い情報 FormValues
 */
export type UserPaymentFormValues = z.infer<typeof UserPaymentSchema>;
