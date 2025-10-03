import { z } from 'zod';

import { formatString } from '@/app/_lib/utills';
import { MSG_EMAIL, MSG_MAX, MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD, REG_ZENKAKU_KANA } from '@/app/_types/constants';
import { SelectOption } from '@/app/_types/types';

/**
 * ユーザー情報 Schema
 */
export const UserProfileSchema = z.object({
  /** ユーザー名 */
  user_name: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'ユーザー名') })
    .max(64, formatString(MSG_MAX, 'ユーザー名', '64')),
  /** ユーザー名カナ */
  user_name_kana: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'ユーザー名(カナ)') })
    .regex(new RegExp(REG_ZENKAKU_KANA), '全角カナで入力してください。')
    .max(256, formatString(MSG_MAX, 'ユーザー名(カナ)', '256')),
  /** 企業部署ID */
  t_companies_department_id: z.string(),
  /** 企業雇用形態ID */
  t_companies_employment_status_id: z.string(),
  /** 任意項目_回答1 */
  optional_item_answer_1: z.string().optional(),
  /** 任意項目_回答2 */
  optional_item_answer_2: z.string().optional(),
});

/**
 * ユーザー情報 FormValues
 */
export type UserProfileFormValues = z.infer<typeof UserProfileSchema>;

/**
 * ユーザー情報 初期表示情報
 */
export type UserProfileInitData = {
  /** 会社名 */
  t_companies_name: string;
  /** ユーザー名 */
  user_name: string;
  /** ユーザー名カナ */
  user_name_kana: string;
  /** 会社ID */
  t_companies_id: number;
  /** 部署ID */
  t_companies_department_id: number;
  /** 雇用形態ID */
  t_companies_employment_status_id: number;
  /** 任意項目_回答1 */
  optional_item_answer_1: string;
  /** 任意項目_回答2 */
  optional_item_answer_2: string;
  /** メールアドレス */
  user_email: string;
  /** 会社情報 */
  t_companies: {
    /** 会社名 */
    company_name: string;
    /** 支店名 */
    branch_name: string;
    /** 任意項目_項目名1 */
    optional_item_title_1?: string;
    /** 任意項目_注釈1 */
    optional_item_notes_1?: string;
    /** 任意項目_項目名2 */
    optional_item_title_2?: string;
    /** 任意項目_注釈2 */
    optional_item_notes_2?: string;
  };
  /** 部署名の選択肢 */
  departmentOptions: SelectOption[];
  /** 雇用形態名の選択肢 */
  employmentStatusOptions: SelectOption[];
};

/**
 * ユーザー情報 登録結果
 */
export type UserBasicResult = {
  /** 会社ドメイン判定 */
  isCompanyDomain: boolean;
};
