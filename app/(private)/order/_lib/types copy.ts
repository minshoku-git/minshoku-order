import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';

/** 取得結果 ユーザー詳細 */
export type UserData = {
  /** ID */
  id: number;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 任意項目_回答1 */
  optional_item_answer_1?: string;
  /** 任意項目_回答2 */
  optional_item_answer_2?: string;
  /** メールアドレス */
  user_email: string;
  /** ユーザー登録ステータス */
  user_registration_status: UserRegistrationStatus;
  /** 利用ステータス */
  usage_status: UsageStatus;
  /** 支払種別 */
  payment_type?: number;
  /** 会社ID */
  t_companies_id: number;
  /** 企業部署ID */
  t_companies_department_id: number;
  /** 企業雇用形態ID */
  t_companies_employment_status_id?: number;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
    /** 食堂名 */
    restaurant_name: string;
    /** 提供場所 */
    location: string;
    /** 提供時間_From */
    offer_time_from: string;
    /** 提供時間_To */
    offer_time_to: string;
    /** 注文期限_日 */
    order_period_day: number;
    /** 注文期限_時間 */
    order_period_time: string;
    /** キャンセル期限_日 */
    cancel_period_day: number;
    /** キャンセル期限_時間 */
    cancel_period_time: string;
    /** 任意項目_項目名1 */
    optional_item_title_1?: string;
    /** 任意項目_注釈1 */
    optional_item_notes_1?: string;
    /** 任意項目_項目名2 */
    optional_item_title_2?: string;
    /** 任意項目_注釈2 */
    optional_item_notes_2?: string;
  };
  /** 部署情報 */
  t_companies_department: {
    /** 部署名 */
    department_name: string;
  };
  /** 会社雇用形態情報 */
  t_companies_employment_status: {
    /** 雇用形態名 */
    employment_status_name: string;
  };
};
