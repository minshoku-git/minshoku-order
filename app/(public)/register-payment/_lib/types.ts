import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_MIN_TO_MAX, MSG_REQUIRED, REG_HANKAKU_NUM } from '@/app/_types/constants';
import { PaymentType } from '@/app/_types/enum';

/**
 * ユーザー支払い情報 Schema
 */
export const UserPaymentSchema = z.object({
  /** 支払い種別 */
  payment_type: z.enum(PaymentType),
  /** クレジットカード番号 */
  creditcard: z.string().optional(),
});

/**
 * ユーザー支払い情報 FormValues
 */
export type UserPaymentFormValues = z.infer<typeof UserPaymentSchema>;
