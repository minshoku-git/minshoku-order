import { UserRegistrationStatus } from '@/app/_types/enum';

/** ユーザー情報 Response */
export type LoginUserResponse = {
  /** ユーザー名 */
  userName?: string;
  /** 食堂名 */
  restaurantName?: string;
  /** ユーザー登録ステータス */
  userRegistrationStatus?: string;
};

/** ユーザー情報 Response */
export type UserAndCompanies = {
  /** ユーザー名 */
  user_name: string;
  /** ユーザー登録ステータス */
  user_registration_status: string;
  /** 会社情報 */
  t_companies: {
    /** 食堂名 */
    restaurant_name: string;
  };
};
