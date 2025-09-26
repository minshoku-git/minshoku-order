import { z } from 'zod';

import { PaymentType, SelectType } from '@/app/_types/enum';

/**
 * 支払い方法の更新 Schema
 */
export const EditPaymentSchema = z.object({
  /** 支払い種別 */
  paymentType: z.enum(PaymentType),
  /** クレジットカード番号 */
  creditcard: z.string().optional(),
});

/**
 * 支払い方法の更新 FormValues
 */
export type EditPaymentFormValues = z.infer<typeof EditPaymentSchema>;

/**
 * 支払い方法の更新 初期表示情報
 */
export type EditPaymentInitData = {
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

export type CreditCardData = {
  /** id */
  creditcardId: string;
  /** マスク済みカード番号 */
  maskedCardNumber: string;
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
    deduction_flag?: string;
    /** クレジットカードFlag ※0:非/1:可 */
    credit_flag?: string;
    /** PaypayFlag ※0:非/1:可 */
    paypay_flag?: string;
  };
};
