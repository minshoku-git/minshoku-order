import { z } from 'zod';

import { DirectionType } from '@/app/_types/enum';

/**
 * 注文情報 Schema
 */
export const OrderSchema = z.object({
  /** スケジュールID */
  t_menu_schedule_id: z.string(),
  /** 注文数 */
  order_count: z.number().min(1),
});

/**
 * 注文情報 FormValues
 */
export type OrderFormValues = z.infer<typeof OrderSchema>;

/** 注文情報 初期表示 Request */
export type OrderInitRequest = {
  /** 方向区分 */
  directionType?: DirectionType;
  /** 現在のスケジュールID */
  current_t_menu_schedule_id?: number;
};

/** 注文情報 初期表示 Request */
export type OrderInitResponse = {
  /** ID(注文ID) */
  t_menu_schedule_id?: number;
  /** 納品日 */
  delivery_day?: string;
  /** メニュー名 */
  menu_name?: string;
  /** アレルギー表記 */
  allergen_labelling?: string;
  /** 辛さレベル */
  spice_level?: number;
  /** 在庫数 */
  stock_count?: number;
  /** 注文数 */
  order_count?: number;
  /** 単価 */
  list_price?: number;
  /** 売価 */
  sale_price?: number;
  /** 店舗情報 */
  t_shops: {
    /** 店舗名 */
    shop_name?: string;
    /** 特定商取引法に基づく表記 */
    specified_commercial_transaction_act?: string;
  };
  /** 会社情報 */
  t_companies: {
    /** 提供場所 */
    location?: string;
    /** 提供時間_From */
    offer_time_from?: string;
    /** 提供時間_To */
    offer_time_to?: string;
    /** 注文期限_日 */
    order_period_day?: number;
    /** 注文期限_時間 */
    order_period_time?: string;
    /** キャンセル期限_日 */
    cancel_period_day?: number;
    /** キャンセル期限_時間 */
    cancel_period_time?: string;
  };
};
