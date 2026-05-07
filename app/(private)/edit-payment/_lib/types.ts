import { z } from 'zod';

import { PaymentType, SelectType } from '@/app/_types/enum';

/**
 * 支払い方法の更新 入力用バリデーションスキーマ
 */
export const EditPaymentSchema = z
  .object({
    /** 支払い種別 */
    paymentType: z.nativeEnum(PaymentType),
    /** * クレジットカードID、または 'new' 
     * ★ポイント: ここで .min(1) を使うと、給与天引きの時もエラーになるため
     * ここは .optional() または単なる .string() に留めます。
     */
    creditcard: z.string().optional(),
    /** GMO-PGトークン (フォーム送信時は空なので optional にする) */
    token: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. クレジットカード決済が選ばれている場合のみ、カードの選択を必須にする
    if (data.paymentType === PaymentType.CREDITCARD && !data.creditcard) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditcard'],
        message: 'クレジットカードを選択するか、新しく登録してください。',
      });
    }

    // ★重要: ここで token のチェックは行わない（submitHandler内で取得するため）
  });

/**
 * 支払い方法の更新 API用バリデーションスキーマ
 */
export const EditPaymentApiSchema = z
  .object({
    request: EditPaymentSchema,
  })
  .strict();

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
  /** 現在選択されているカードの連番 (credit_seq_choice) */
  currentCardDataId?: string;
  /** クレジットカード情報リスト（GMOから取得した複数枚） */
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
  /** クレジットカード連番選択 */
  credit_seq_choice?: string;
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
