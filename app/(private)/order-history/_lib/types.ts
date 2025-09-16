/** メニュースケジュール情報 */
export type OrderHistoryRequest = {
  /** ページ数 */
  pageParam: number;
};

/** メニュースケジュール情報 */
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
