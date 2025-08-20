import { z } from 'zod';

import { formatString } from '@/app/_lib/utill';
import { MSG_EMAIL, MSG_MAX, MSG_PASSWORD, MSG_REQUIRED, REG_PASSWORD, REG_ZENKAKU_KANA } from '@/app/_types/constants';
import { SelectOption } from '@/app/_types/types';

/**
 * ユーザー基本情報 Schema
 */
export const UserBasicSchema = z.object({
  /** 会社ID */
  t_companies_id: z.string(),
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
  /** メールアドレス */
  user_email: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') })
    .email(formatString(MSG_EMAIL, 'メールアドレス')),
  /** パスワード */
  signup_password: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '新しいパスワード(再入力)') })
    .regex(REG_PASSWORD, MSG_PASSWORD),
  /** パスワード(再入力) */
  confirm_signup_password: z
    .string()
    .nonempty({ message: formatString(MSG_REQUIRED, '新しいパスワード(再入力)') })
    .regex(REG_PASSWORD, MSG_PASSWORD),
});

/**
 * ユーザー基本情報 FormValues
 */
export type UserBasicFormValues = z.infer<typeof UserBasicSchema>;

/**
 * ユーザー基本情報 初期表示情報リクエスト
 */
export type UserBasicInitRequest = {
  /** 暗号 */
  token: string;
};

/**
 * ユーザー基本情報 初期表示情報
 */
export type UserBasicInitData = {
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name?: string;
  /** 部署名の選択肢 */
  departmentOptions: SelectOption[];
  /** 雇用形態名の選択肢 */
  employmentStatusOptions: SelectOption[];
};

/**
 * ユーザー基本情報 登録結果
 */
export type UserBasicResult = {
  /** 会社ドメイン判定 */
  isCompanyDomain: boolean;
};
