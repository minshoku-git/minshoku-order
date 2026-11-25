import { PaymentType, SelectType } from '@/app/_types/enum';

/* 支払方法の利用可否
------------------------------------------------------------------ */

/**
 * 雇用形態ごとの支払方法の利用可否フラグ
 * ※t_companies_employment_status の各フラグ（'0':不可 / '1':可）
 */
export type PaymentTypeFlags = {
  /** 給与天引き（会社精算）Flag */
  deduction_flag?: string | null;
  /** クレジットカードFlag */
  credit_flag?: string | null;
  /** PayPayFlag */
  paypay_flag?: string | null;
  /** メルペイFlag */
  merpay_flag?: string | null;
};

/**
 * isPaymentTypeAllowed
 * 指定した支払方法が、雇用形態のフラグで許可されているかを判定する。
 * 未設定（null/空）の支払方法や、未知の支払方法は許可しない。
 * @param {string | null | undefined} paymentType - 支払方法
 * @param {PaymentTypeFlags} flags - 雇用形態の利用可否フラグ
 * @returns {boolean} 許可されていれば true
 */
export const isPaymentTypeAllowed = (paymentType: string | null | undefined, flags: PaymentTypeFlags): boolean => {
  switch (paymentType) {
    case PaymentType.SALAEY_DEDUCTIONS:
      return flags.deduction_flag === SelectType.SELECTED;
    case PaymentType.CREDITCARD:
      return flags.credit_flag === SelectType.SELECTED;
    case PaymentType.PAYPAY:
      return flags.paypay_flag === SelectType.SELECTED;
    case PaymentType.MERPAY:
      return flags.merpay_flag === SelectType.SELECTED;
    default:
      return false;
  }
};
