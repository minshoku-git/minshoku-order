import { z } from 'zod';

import {
  MSG_EMAIL,
  MSG_MAX,
  MSG_PASSWORD,
  MSG_REQUIRED,
  REG_PASSWORD,
  REG_ZENKAKU_KANA,
} from '@/app/_config/constants';
import { formatString } from '@/app/_lib/utils/utils';
import { SelectOption } from '@/app/_types/types';

/**
 * ユーザー基本情報初期表示情報 入力用バリデーションスキーマ
 */
export const SignUpInitSchema = z
  .object({
    /** 暗号 */
    token: z.string(),
  })
  .strict();
/**
 * ユーザー基本情報初期表示情報 API用バリデーションスキーマ
 */
export const SignUpInitApiSchema = z
  .object({
    request: SignUpInitSchema,
  })
  .strict();
/**
 * ユーザー基本情報初期表示情報 リクエスト
 */
export type SignUpInitRequest = z.infer<typeof SignUpInitSchema>;

/**
 * ユーザー基本情報 入力用バリデーションスキーマ
 */
export const SignUpSchema = z
  .object({
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
    t_companies_department_id: z.string().nonempty({ message: formatString(MSG_REQUIRED, '部署') }),
    /** 企業雇用形態ID */
    t_companies_employment_status_id: z.string().nonempty({ message: formatString(MSG_REQUIRED, '雇用形態') }),
    /** 任意項目_回答1 */
    optional_item_answer_1: z.string().optional(),
    /** 任意項目_回答2 */
    optional_item_answer_2: z.string().optional(),
    /** メールアドレス */
    user_email: z
      .email(formatString(MSG_EMAIL, 'メールアドレス'))
      .nonempty({ message: formatString(MSG_REQUIRED, 'メールアドレス') }),
    /** パスワード */
    signup_password: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, 'パスワード') })
      .regex(REG_PASSWORD, MSG_PASSWORD),
    /** パスワード(再入力) */
    confirm_signup_password: z
      .string()
      .nonempty({ message: formatString(MSG_REQUIRED, 'パスワード(再入力)') })
      .regex(REG_PASSWORD, MSG_PASSWORD),
  })
  .check((ctx) => {
    if (ctx.value.signup_password !== ctx.value.confirm_signup_password) {
      ctx.issues.push({
        code: 'custom',
        path: ['confirm_signup_password'],
        message: 'パスワードとパスワード(再入力)が一致しません。',
        input: ctx.value,
      });
    }
  })
  .strict();

/**
 * ユーザー基本情報 FormValues
 */
export type SignUpFormValues = z.infer<typeof SignUpSchema>;

/**
 * ユーザー基本情報新規登録 API用バリデーションスキーマ
 */
export const SignUpRequestApiSchema = z
  .object({
    request: z.object({
      ...SignUpSchema.shape,
      ...SignUpInitSchema.shape,
    }),
  })
  .strict();

/**
 * ユーザー基本情報 FormValues
 */
export type SignUpRequest = z.infer<typeof SignUpRequestApiSchema>['request'];

/**
 * ユーザー基本情報 復号後
 */
export type SignUpDecrypt = {
  /** 暗号 */
  t_companies_id: number;
};

/**
 * 仮登録完了 initRequest
 */
export type SignUpEncrypt = {
  /** メールアドレス */
  id: number;
};

/**
 * ユーザー基本情報 初期表示情報
 */
export type SignUpInitData = {
  /** 会社名 */
  company_name: string;
  /** 支店名 */
  branch_name?: string;
  /** 部署名の選択肢 */
  departmentOptions: SelectOption[];
  /** 雇用形態名の選択肢 */
  employmentStatusOptions: SelectOption[];
  /** 任意項目_項目名1 */
  optional_item_title_1: string;
  /** 任意項目_注釈1 */
  optional_item_notes_1: string;
  /** 任意項目_項目名2 */
  optional_item_title_2: string;
  /** 任意項目_注釈2 */
  optional_item_notes_2: string;
};

/**
 * ユーザー基本情報 登録結果
 */
export type SignUpResponse = {
  /** 会社ドメイン判定 */
  isCompanyDomain: boolean;
};

export type ApprovalRequestMessageDetails = {
  /** ユーザー名 */
  userName: string;
  /** ユーザー名カナ */
  userNameKana: string;
  /** メールアドレス */
  userEmail: string;
  /** 問い合わせ日時 */
  date: string;
  /** 会社名 */
  companyName: string;
  /** 支店名 */
  branchName: string;
  /** ユーザーID */
  userId: string;
};
