import { z } from 'zod';

/**
 * 注文情報初期表示 入力用バリデーションスキーマ
 */
export const OrderInitSchema = z
  .object({
    /** 指定のスケジュールID */
    moveMenuScheduleId: z.number().optional(),
  })
  .strict();
/**
 * 注文情報初期表示 API用バリデーションスキーマ
 */
export const OrderInitApiSchema = z
  .object({
    request: OrderInitSchema,
  })
  .strict();
/**
 * 注文情報初期表示 FormValues
 */
export type OrderInitRequest = z.infer<typeof OrderInitSchema>;

/**
 * 注文情報 入力用バリデーションスキーマ
 */
export const OrderSchema = z
  .object({
    /** スケジュールID */
    menuScheduleId: z.number(),
    /** 注文数 */
    orderCount: z.number().min(1),
  })
  .strict();
/**
 * 注文情報 API用バリデーションスキーマ
 */
export const OrderApiSchema = z
  .object({
    request: OrderSchema,
  })
  .strict();
/**
 * 注文情報 FormValues
 */
export type OrderFormValues = z.infer<typeof OrderSchema>;

/**
 * 注文情報キャンセル 入力用バリデーションスキーマ
 */
export const CancelOrderSchema = z
  .object({
    /** スケジュールID */
    menuScheduleId: z.number(),
  })
  .strict();
/**
 * 注文情報キャンセル API用バリデーションスキーマ
 */
export const CancelOrderApiSchema = z
  .object({
    request: CancelOrderSchema,
  })
  .strict();
/** 注文情報キャンセル Request */
export type CancelOrderRequest = z.infer<typeof CancelOrderSchema>;

/** 注文情報 初期表示 Request */
export type OrderInitResponse = {
  /** 前の日付のスケジュールID */
  previousScheduleId?: number;
  /** 次の日付のスケジュールID */
  nextScheduleId?: number;
  /** メニュースケジュール情報 */
  menuScheduleData?: MenuScheduleData;
  /** 会社情報 */
  companyData?: CompanyData;
  /** 店舗情報 */
  shopData?: ShopData;
  /** 注文情報 */
  orderData?: OrderData;
  /** 支払い方法 */
  paymentTypeString?: string;
};

/** 注文情報 初期表示 Request */
export type OmitMenuScheduleAndShop = {
  /** ID(注文ID) */
  id: number;
  /** 納品日 */
  delivery_day: string | Date;
  /** メニュー名 */
  menu_name: string;
  /** メニュー紹介 */
  menu_description: string;
  /** アレルギー表記 */
  allergen_labelling: string;
  /** 辛さレベル */
  spice_level: number;
  /** 在庫数 */
  stock_count: number;
  /** 単価 */
  list_price: number;
  /** 売価 */
  sale_price: number;
  /** 店舗情報 */
  t_shops: {
    /** 店舗ID */
    id: number;
    /** 店舗名 */
    shop_name: string;
    /** 店舗紹介文 */
    shop_description: string;
    /** 食べログURL */
    tabelog_url: string;
    /** 店舗イメージ_ファイル */
    shop_image_file?: File;
    /** 特定商取引法に基づく表記 */
    specified_commercial_transaction_act: string;
    /** 店舗イメージ_セーフファイル名 */
    shop_image_safe_file_name: string;
  };
};

/** メニュースケジュール情報 */
export type MenuScheduleData = {
  /** メニュースケジュールID */
  id: number;
  /** 納品日 */
  delivery_day: string | Date;
  /** メニュー名 */
  menu_name: string;
  /** メニュー紹介 */
  menu_description: string;
  /** アレルギー表記 */
  allergen_labelling: string;
  /** 辛さレベル */
  spice_level: number;
  /** 在庫数 */
  stock_count: number;
  /** 定価 */
  list_price: number;
  /** 売価 */
  sale_price: number;
  /** 注文期限超過 */
  isOrderDeadlinePassed: boolean;
  /** 注文数 */
  orderCount: number;
};

/** 店舗情報 */
export type ShopData = {
  /** 店舗名 */
  shop_name: string;
  /** 店舗紹介文 */
  shop_description: string;
  /** 食べログURL */
  tabelog_url?: string;
  /** 店舗イメージ_ファイル */
  shop_image_file?: string;
  /** 特定商取引法に基づく表記 */
  specified_commercial_transaction_act: string;
};

/** 注文情報 */
export type OrderData = {
  /** ID(注文ID) */
  t_order_id?: number;
  /** 注文数 */
  order_count?: number;
  /** 注文キャンセル可否 */
  isCancellable: boolean;
};

/** 会社情報 */
export type CompanyData = {
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
