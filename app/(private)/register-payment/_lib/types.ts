import { z } from 'zod';

import { PaymentType, SelectType } from '@/app/_types/enum';
import { CreditCardData } from '@/app/_types/types';

/**
 * ユーザー支払い情報 Schema
 */
export const UserPaymentSchema = z.object({
  /** 支払い種別 */
  paymentType: z.enum(PaymentType),
  /** クレジットカード番号 */
  creditcard: z.string().optional(),
});

/**
 * ユーザー支払い情報 FormValues
 */
export type UserPaymentFormValues = z.infer<typeof UserPaymentSchema>;

/**
 * 支払い方法の更新 初期表示情報
 */
export type RegisterPaymentInitData = {
  /** 現在の支払い種別 */
  currentPaymentType: PaymentType;
  /** 現在のクレジットカード */
  currentCardDataId?: string;
  /** クレジットカード情報 */
  creditCardDatas?: CreditCardData[];
  /** 給与天引きFlag ※0:非/1:可 */
  deduction_flag: SelectType;
  /** クレジットカードFlag ※0:非/1:可 */
  credit_flag: SelectType;
  /** PaypayFlag ※0:非/1:可 */
  paypay_flag: SelectType;
};

/**
 * 支払い方法の更新 初期表示情報
 */
export type UserAndCompaniesEmploymentStatus = {
  /** 支払種別 */
  payment_type: PaymentType;
  /** クレジット_メンバーID */
  credit_member_id?: string;
  /** 企業雇用形態 */
  t_companies_employment_status: {
    /** 給与天引きFlag ※0:非/1:可 */
    deduction_flag?: number;
    /** クレジットカードFlag ※0:非/1:可 */
    credit_flag?: number;
    /** PaypayFlag ※0:非/1:可 */
    paypay_flag?: number;
  };
};
