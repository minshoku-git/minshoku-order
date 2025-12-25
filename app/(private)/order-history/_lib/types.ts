import z from 'zod';

/** 注文履歴 入力用バリデーションスキーマ*/
export const OrderHistorySchema = z
  .object({
    /** ページ数 */
    pageParam: z.number(),
  })
  .strict();

/** 注文履歴 API用バリデーションスキーマ*/
export const OrderHistoryApiSchema = z
  .object({
    request: OrderHistorySchema,
  })
  .strict();
/** 注文履歴 FormValues*/
export type OrderHistoryRequest = z.infer<typeof OrderHistorySchema>;

/** 注文履歴 */
export type OrderHistoryResponse = {
  /** ページ数 */
  lastPage: number | null;
  /** メニュースケジュール情報 */
  orderData: OrderHistoryData[];
};

/** メニュースケジュール情報 */
export type OrderData = {
  /** 注文ID */
  id: number;
  /** 納品日 */
  delivery_day: string | Date;
  /** 注文数 */
  count: number;
  /** 個人負担額 */
  user_burden_amount: number;
  /** 支払い種別 */
  payment_type: string | number;
  /** 注文日時 */
  order_datetime?: Date;
  /** オーダーステータス */
  order_status_type?: number;
  /** キャンセル日時 */
  cancel_datetime?: string | Date;
  /** 店舗テーブル */
  t_shops: {
    /** 店舗名 */
    shop_name?: string;
  };
  /** メニュースケジュールテーブル */
  t_menu_schedule: {
    /** メニュー名 */
    menu_name?: string;
  };
};

/** メニュースケジュール情報 */
export type OrderHistoryData = {
  /** 納品日 */
  delivery_day: string;
  /** 注文情報 */
  orderData: OrderData[];
};
