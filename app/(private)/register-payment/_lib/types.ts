import { z } from 'zod';

import { PaymentType, SelectType } from '@/app/_types/enum';

/**
 * ユーザー支払い情報 入力用バリデーションスキーマ
 */
export const UserPaymentSchema = z
  .object({
    /** 支払い種別 */
    // 初期値は未選択（''）。未選択のまま送信された場合はこのメッセージを表示する
    paymentType: z.nativeEnum(PaymentType, { error: '支払い方法を選択してください。' }),
    /** クレジットカード番号 */
    creditcard: z.string().optional(),
    /** GMO-PGトークン */
    token: z.string().optional(),
  })
  // ★ .check ではなく superRefine を使用します
  .superRefine((data, ctx) => {
    if (data.paymentType === PaymentType.CREDITCARD && !data.creditcard) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditcard'],
        message: '「新しいクレジットカードを登録する」を押して、カード情報を入力してください。',
      });
    }
  });

/**
 * ユーザー支払い情報 API用バリデーションスキーマ
 */
export const UserPaymentApiSchema = z
  .object({
    request: UserPaymentSchema,
  })
  .strict();

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

export type CreditCardData = {
  /** id (CardSeq) */
  creditcardId: string;
  /** マスク済みカード番号 (例: ************1234) */
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
/** SaveCard レスポンス */
export interface SaveCardResponse {
  CardSeq?: string;
  CardNo?: string;
  Forward?: string;
  Brand?: string;
  ErrCode?: string;
  ErrInfo?: string;
}