import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { formatISO } from 'date-fns';
import { format } from 'date-fns';

import { BUCKET_SHOP_IMAGES, PAYPAY_PENDING_TTL_MINUTES } from '@/app/_config/constants';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule, t_order } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getImageSignedUrl } from '@/app/_lib/supabaseStorage/getImageUrl';
import {
  formatJstDate,
  formatJstDateTime,
  formatTimeToJst,
  getCancelDeadlineUTC,
  getJstNow,
  getNow,
  getOrderDeadlineUTC,
  getTodayXHour,
} from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { convertPaymentTypeName, OrderStatusType, PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getLoginUserDetail } from '../../../_lib/getLoginUser/getLoginUserDetail';
import { alterTranGmo,entryTranGmo, execTranGmo } from './gmoApi';
import { entryTranPaypay, execTranPaypay, paypayCancelReturn, searchTradePaypay } from './paypayApi';
import {
  CancelOrderRequest,
  OmitMenuScheduleAndShop,
  OrderFormValues,
  OrderInitRequest,
  OrderInitResponse,
  PaypayRedirectInfo,
} from './types';

/**
 * PayPay決済待ち(PENDING_PAYMENT)行のTTLカットオフ時刻を取得する。
 * これより前に作成された PENDING_PAYMENT 行は、ユーザーが離脱したものとみなし
 * 在庫消費・重複注文チェックの対象から除外する。
 */
const getPaypayPendingCutoff = (now: Date): Date => new Date(now.getTime() - PAYPAY_PENDING_TTL_MINUTES * 60_000);

/**
 * getOrderInit
 * 注文画面の初期情報を取得する。
 *
 * @param {ApiRequest<OrderInitRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderInitResponse>>} 検索結果
 */
export const getOrderInit = async (values: ApiRequest<OrderInitRequest>): Promise<ApiResponse<OrderInitResponse>> => {
  const client = await createClient();
  const menuSchesuleId = values.request.moveMenuScheduleId;
  const now = getNow();
  const today = format(getJstNow(), 'yyyy-MM-dd');

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    /* メニュー情報取得
    ------------------------------------------------------------------ */
    const selectColumns = `id,
            delivery_day,
            menu_name,
            menu_description,
            allergen_labelling,
            spice_level,
            list_price,
            stock_count,
            t_shops!inner(
              id,
              shop_name,
              shop_description,
              tabelog_url,
              specified_commercial_transaction_act,
              shop_image_safe_file_name
            )`;

    const query = menuSchesuleId
      ? client
          .from('t_menu_schedule')
          .select(selectColumns)
          .eq('id', menuSchesuleId)
          .eq('cancel_flag', 0)
          .gte('delivery_day', today)
          .limit(1)
          .maybeSingle()
      : client
          .from('t_menu_schedule')
          .select(selectColumns)
          .eq('t_companies_id', user.t_companies_id)
          .eq('cancel_flag', 0)
          .gte('delivery_day', today) // 今日以降
          .order('delivery_day', { ascending: true })
          .limit(1)
          .maybeSingle();

    const { data, error } = (await query) as PostgrestSingleResponse<OmitMenuScheduleAndShop>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'メニュースケジュール情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    if (!data) {
      // MEMO: メニュースケジュールが存在しないため、予定なしとして正常終了。
      return {
        success: true,
        data: {},
      };
    }

    /* 前の日付のスケジュール取得
    ------------------------------------------------------------------ */
    const { data: previousSchedule, error: errorPreviousSchedule } = (await client
      .from('t_menu_schedule')
      .select('id')
      .eq('t_companies_id', user.t_companies_id)
      .eq('cancel_flag', 0)
      .lt('delivery_day', data.delivery_day)
      .gte('delivery_day', today) // 今日以降
      .order('delivery_day', { ascending: false })
      .limit(1)
      .maybeSingle()) as PostgrestSingleResponse<t_menu_schedule>;

    if (errorPreviousSchedule) {
      console.error('query error', errorPreviousSchedule);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '前の日付のスケジュール取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    /* 次のスケジュール取得
    ------------------------------------------------------------------ */
    const { data: nextSchedule, error: errorNextSchedule } = (await client
      .from('t_menu_schedule')
      .select('id')
      .eq('t_companies_id', user.t_companies_id)
      .eq('cancel_flag', 0)
      .gt('delivery_day', data.delivery_day)
      .gte('delivery_day', today) // 今日以降
      .order('delivery_day', { ascending: true })
      .limit(1)
      .maybeSingle()) as PostgrestSingleResponse<t_menu_schedule>;

    if (errorNextSchedule) {
      console.error('query error', errorNextSchedule);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '次の日付のスケジュールデータ取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 自注文情報取得
    ------------------------------------------------------------------ */
    const queryOrder = client
      .from('t_order')
      .select('id, count')
      .eq('t_user_id', user.id)
      .eq('t_menu_schedule_id', menuSchesuleId ?? data.id)
      .eq('order_status_type', OrderStatusType.VALID)
      .maybeSingle();
    const { data: orderData, error: errorOrder } = (await queryOrder) as PostgrestSingleResponse<t_order>;

    if (errorOrder) {
      console.error(errorOrder);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'オーダー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 現在の注文数
    ------------------------------------------------------------------ */
    const queryCountOrder = client
      .from('t_order')
      .select('count')
      .eq('t_menu_schedule_id', menuSchesuleId ?? data.id)
      .eq('order_status_type', OrderStatusType.VALID);
    const { data: countOrderData, error: errorCountOrder } = (await queryCountOrder) as PostgrestSingleResponse<
      t_order[]
    >;

    if (errorCountOrder) {
      console.error(errorCountOrder);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '現在の注文数の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    const orderCount = countOrderData ? countOrderData.reduce((sum, item) => sum + (item.count ?? 0), 0) : 0;

    /* 注文可否判定
    ------------------------------------------------------------------ */
    const orderPeriodDaysBefore = user.t_companies.order_period_day;
    const orderPeriodTime = user.t_companies.order_period_time;
    const orderDeadlineUTC = getOrderDeadlineUTC(data.delivery_day, orderPeriodDaysBefore, orderPeriodTime);

    // ★ ログを詳細化
    console.log('=== [DEBUG] 注文期限判定 ===');
    console.log('現在時刻 (UTC):', now.toISOString());
    console.log('現在時刻 (JST):', formatJstDateTime(now));
    console.log('納品日 (Raw):', data.delivery_day);
    console.log('注文期限 (UTC):', orderDeadlineUTC.toISOString());
    console.log('注文期限 (JST):', formatJstDateTime(orderDeadlineUTC));
    console.log('判定結果 (過ぎているか):', now >= orderDeadlineUTC);

    const isOrderDeadlinePassed = now >= orderDeadlineUTC;

    /* 注文キャンセル可否判定
    ------------------------------------------------------------------ */
    const cancelDaysBefore = user.t_companies.cancel_period_day;
    const cancelTime = user.t_companies.cancel_period_time;
    const cancelDeadlineUTC = getCancelDeadlineUTC(data.delivery_day, cancelDaysBefore, cancelTime);

    // ★ ログを詳細化
    console.log('=== [DEBUG] キャンセル期限判定 ===');
    console.log('現在時刻 (UTC):', now.toISOString());
    console.log('キャンセル期限 (UTC):', cancelDeadlineUTC.toISOString());
    console.log('キャンセル期限 (JST):', formatJstDateTime(cancelDeadlineUTC));
    console.log('判定結果 (キャンセル可能か):', cancelDeadlineUTC > now);
    console.log('============================');

    const isCancellable = cancelDeadlineUTC > now;

    /* 店舗イメージ画像取得
    ------------------------------------------------------------------ */
    const imageSignedUrl = data.t_shops.shop_image_safe_file_name
      ? await getImageSignedUrl(
          client,
          process.env.SUPABASE_STORAGE!,
          `${BUCKET_SHOP_IMAGES}/${data.t_shops.id}/${data.t_shops.shop_image_safe_file_name}`
        )
      : '';

    /* 返却
    ------------------------------------------------------------------ */
    const res: OrderInitResponse = {
      nextScheduleId: nextSchedule ? nextSchedule.id : undefined,
      previousScheduleId: previousSchedule ? previousSchedule.id : undefined,
      menuScheduleData: {
        id: data.id,
        delivery_day: formatJstDate(data.delivery_day as Date),
        list_price: data.list_price ?? 0,
        sale_price: data.list_price - (user.t_companies_employment_status.set_meal_burden ?? 0),
        allergen_labelling: data.allergen_labelling ?? '',
        menu_name: data.menu_name ?? '',
        menu_description: data.menu_description ?? '',
        spice_level: data.spice_level ?? 0,
        stock_count: data.stock_count ?? 0,
        isOrderDeadlinePassed: isOrderDeadlinePassed,
        orderCount: orderCount,
      },
      shopData: {
        shop_name: data.t_shops.shop_name,
        shop_description: data.t_shops.shop_description,
        tabelog_url: data.t_shops.tabelog_url,
        shop_image_file: imageSignedUrl,
        specified_commercial_transaction_act: data.t_shops.specified_commercial_transaction_act,
      },
      companyData: {
        location: user.t_companies.location,
        offer_time_from: formatTimeToJst(user.t_companies.offer_time_from),
        offer_time_to: formatTimeToJst(user.t_companies.offer_time_to),
        order_period_day: user.t_companies.order_period_day,
        order_period_time: formatTimeToJst(user.t_companies.order_period_time),
        cancel_period_day: user.t_companies.cancel_period_day,
        cancel_period_time: formatTimeToJst(user.t_companies.cancel_period_time),
      },
      orderData: orderData ? { t_order_id: orderData.id, order_count: orderData.count, isCancellable } : undefined,
      paymentTypeString: convertPaymentTypeName(user.payment_type as PaymentType),
    };

    return {
      success: true,
      data: res,
    };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    console.error(e);
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * preOrder
 * 注文状況を確認します。
 *
 * @param {ApiRequest<OrderFormValues>} values
 * @returns {Promise<ApiResponse<null>>}
 */
export const preOrder = async (values: ApiRequest<OrderFormValues>): Promise<ApiResponse<null>> => {
  const client = await createClient();
  const req = values.request;
  const now = getNow();

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    /* スケジュール情報取得とテーブルロック
  　------------------------------------------------------------------ */
    const { data: menuSchedule, error: scheduleError } = await client
      .from('t_menu_schedule')
      .select('delivery_day, stock_count')
      .eq('id', req.menuScheduleId)
      .eq('cancel_flag', 0)
      .single();

    if (scheduleError) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'メニュースケジュール情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 注文時間判定
    ------------------------------------------------------------------ */
    const orderPeriodDaysBefore = user.t_companies.order_period_day;
    const orderPeriodTime = user.t_companies.order_period_time;
    const orderDeadlineUTC = getOrderDeadlineUTC(menuSchedule.delivery_day, orderPeriodDaysBefore, orderPeriodTime);

    console.log('注文期限:', orderDeadlineUTC);
    console.log('現在日時:', now);

    const isOrderDeadlinePassed = now >= orderDeadlineUTC;
    if (isOrderDeadlinePassed) {
      throw new CustomError(ErrorCodes.ORDER_EXPIRED);
    }

    /* 自身の注文状況(有効注文 + 期限内のPayPay決済待ちも対象)
  　------------------------------------------------------------------ */
    const pendingCutoff = getPaypayPendingCutoff(now);

    const { data: orderCheckRows, error: orderCheckError } = await client
      .from('t_order')
      .select('id, order_status_type, order_datetime')
      .eq('t_menu_schedule_id', req.menuScheduleId)
      .eq('t_user_id', user.id)
      .in('order_status_type', [OrderStatusType.VALID, OrderStatusType.PENDING_PAYMENT]);

    if (orderCheckError) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '注文状況の確認' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    const hasActiveOrder = (orderCheckRows ?? []).some(
      (o) =>
        o.order_status_type === OrderStatusType.VALID ||
        (o.order_status_type === OrderStatusType.PENDING_PAYMENT && new Date(o.order_datetime!) > pendingCutoff)
    );
    if (hasActiveOrder) {
      throw new CustomError(ErrorCodes.ORDER_ALREADY_PLACED);
    }

    /* 現在の在庫数の確認(有効注文 + 期限内のPayPay決済待ちも消費数に含める)
  　------------------------------------------------------------------ */
    const { data: orders, error: ordersError } = await client
      .from('t_order')
      .select('count, order_status_type, order_datetime')
      .eq('t_menu_schedule_id', req.menuScheduleId)
      .in('order_status_type', [OrderStatusType.VALID, OrderStatusType.PENDING_PAYMENT]);

    if (ordersError) {
      throw ordersError;
    }

    // 現在の注文数を合計(期限切れのPENDING_PAYMENTは除外)
    const totalOrders = orders.reduce((sum, order) => {
      if (
        order.order_status_type === OrderStatusType.PENDING_PAYMENT &&
        new Date(order.order_datetime!) <= pendingCutoff
      ) {
        return sum;
      }
      return sum + order.count;
    }, 0);

    // 納品数を超過しているか
    if (totalOrders + req.orderCount > menuSchedule.stock_count) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ご希望の数量は、残り注文可能数を上回っています。',
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * insertOrder
 * 注文情報を新規登録します。
 * PayPayの場合、決済はまだ完了しておらず、返却された `startUrl` にユーザーを
 * 遷移させて決済を続行させる必要がある(呼び出し元は `data` の有無で判定する)。
 *
 * @param {ApiRequest<OrderFormValues>} values
 * @returns {Promise<ApiResponse<PaypayRedirectInfo | null>>}
 */
export const insertOrder = async (
  values: ApiRequest<OrderFormValues>
): Promise<ApiResponse<PaypayRedirectInfo | null>> => {
  const req = values.request;
  const now = getNow();
  const client = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    // DBから最新のカード情報を再取得
    const { data: userData } = await client
      .from('t_user')
      .select('credit_member_id, credit_seq_choice')
      .eq('id', user.id)
      .single();

    /* スケジュール情報取得とテーブルロック
  　------------------------------------------------------------------ */
    const selectSql = `
        SELECT 
          ms.*,
          s.shop_name,
          s.gmo_shop_code,
          s.gmo_shop_password
        FROM
          t_menu_schedule ms
        INNER JOIN t_shops s ON ms.t_shops_id = s.id
        WHERE 
          ms.id = $1
          AND ms.cancel_flag = $2
        FOR UPDATE`; // MEMO: テーブルロック

    const resultMenuSchedule = await pgClient.query<t_menu_schedule>(selectSql, [req.menuScheduleId, 0]);

    const stockCount = Number(resultMenuSchedule.rows[0].stock_count ?? 0);

    if (resultMenuSchedule.rows.length === 0 || stockCount === 0) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '在庫切れ', ErrorCodes.DB_QUERY_FAILED.status);
    }

    const menuScheduleData: t_menu_schedule = resultMenuSchedule.rows[0];

    /* ユーザーの注文状況確認(有効注文 + 期限内のPayPay決済待ちも対象)
  　------------------------------------------------------------------ */
    const pendingCutoff = getPaypayPendingCutoff(now);

    const selectUserSql = `
        SELECT
          id
        FROM
          t_order
        WHERE
          t_menu_schedule_id = $1
          AND t_user_id = $2
          AND (order_status_type = $3 OR (order_status_type = $4 AND order_datetime > $5))`;

    const existingOrderResult = await pgClient.query(selectUserSql, [
      req.menuScheduleId,
      user.id,
      OrderStatusType.VALID,
      OrderStatusType.PENDING_PAYMENT,
      pendingCutoff,
    ]);

    if (existingOrderResult.rows.length > 0) {
      throw new CustomError(ErrorCodes.DB_QUERY_FAILED.code, '既に注文済みです。', ErrorCodes.DB_QUERY_FAILED.status);
    }

    /* 現在の注文数取得(有効注文 + 期限内のPayPay決済待ちも消費数に含める)
  　------------------------------------------------------------------ */
    const selectOrderSql = `
        SELECT
          SUM(count) as total_count
        FROM
          t_order
        WHERE
          t_menu_schedule_id = $1
          AND (order_status_type = $2 OR (order_status_type = $3 AND order_datetime > $4))`;

    // Insert
    const resultOrder = await pgClient.query(selectOrderSql, [
      req.menuScheduleId,
      OrderStatusType.VALID,
      OrderStatusType.PENDING_PAYMENT,
      pendingCutoff,
    ]);
    const totalCount = Number(resultOrder.rows[0].total_count ?? 0);

    if (totalCount + Number(req.orderCount) > Number(menuScheduleData.stock_count ?? 0)) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '注文上限数を超過しました。',
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* 会社負担額
    ------------------------------------------------------------------ */
    const mealBurden: number = user.t_companies_employment_status.set_meal_burden ?? 0;
    const companiesBurdenAmount = req.orderCount * mealBurden;

    const amount = menuScheduleData.list_price! * req.orderCount;

    // ユーザー負担額
    const userBurdenAmount = amount - companiesBurdenAmount;

    let gmoOrderId = '';
    let creditAccessId = '';
    let creditAccessPass = '';
    let paypayOrderId = '';
    let paypayAccessId = '';
    let paypayAccessPass = '';

    // ★ バリデーションガード：GMO設定情報が空欄の店舗だった場合の決済クラッシュを防ぎます
    // (クレジットカード・PayPayどちらも同じGMO加盟店契約のShopID/ShopPassを使う)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gmoShopCode = (menuScheduleData as any).gmo_shop_code;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gmoShopPassword = (menuScheduleData as any).gmo_shop_password;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shopName = (menuScheduleData as any).shop_name;

    /* クレジットの場合
    ------------------------------------------------------------------ */
    if (user.payment_type === PaymentType.CREDITCARD) {
      gmoOrderId = `ORD-${user.id}-${Date.now()}`;

      if (!userData?.credit_member_id || !userData?.credit_seq_choice) {
        throw new Error('クレジットカード情報が登録されていません。');
      }

      if (!gmoShopCode || !gmoShopPassword) {
        throw new CustomError(
          ErrorCodes.INTERNAL_SERVER_ERROR.code,
          `店舗「${shopName}」のGMO IDまたはGMO PASSが設定されていません。マスタ設定を確認してください。`,
          400
        );
      }

      // 1. 取引登録 (EntryTran) - ★ 動的に取得した店舗のコードとパスワードを渡すよう変更
      const entryRes = await entryTranGmo(gmoOrderId, userBurdenAmount, gmoShopCode, gmoShopPassword);
      if (!entryRes.success) throw new Error(`GMO取引登録失敗: ${entryRes.errInfo}`);

      creditAccessId = entryRes.accessId!;
      creditAccessPass = entryRes.accessPass!;

      // 2. 決済実行 (ExecTran: 登録済みカードを使用)
      const execRes = await execTranGmo(
        creditAccessId,
        creditAccessPass,
        gmoOrderId,
        userData.credit_member_id,
        userData.credit_seq_choice
      );

      if (!execRes.success) throw new Error(`GMO決済実行失敗: ${execRes.errInfo}`);
    }

    /* PayPayの場合
    ------------------------------------------------------------------ */
    if (user.payment_type === PaymentType.PAYPAY) {
      paypayOrderId = `PPORD-${user.id}-${Date.now()}`;

      if (!gmoShopCode || !gmoShopPassword) {
        throw new CustomError(
          ErrorCodes.INTERNAL_SERVER_ERROR.code,
          `店舗「${shopName}」のGMO IDまたはGMO PASSが設定されていません。マスタ設定を確認してください。`,
          400
        );
      }

      // 取引登録 (EntryTranPaypay) のみロック内で行う。
      // 決済実行(ExecTranPaypay)はユーザーをPayPay画面へ送り出す準備のため、
      // 在庫を確定コミットした後(ロック解放後)に行う。
      const entryRes = await entryTranPaypay(paypayOrderId, userBurdenAmount, gmoShopCode, gmoShopPassword);
      if (!entryRes.success) throw new Error(`PayPay取引登録失敗: ${entryRes.errInfo}`);

      paypayAccessId = entryRes.accessId!;
      paypayAccessPass = entryRes.accessPass!;
    }

    const isPaypay = user.payment_type === PaymentType.PAYPAY;

    /* 注文情報の新規登録
    ------------------------------------------------------------------ */
    const insertValues: Omit<t_order, 'id' | 'cancel_datetime' | 'created_at' | 'updated_at'> = {
      t_menu_schedule_id: req.menuScheduleId,
      t_shops_id: Number(menuScheduleData.t_shops_id),
      t_user_id: user.id,
      t_companies_id: user.t_companies_id,
      t_companies_department_id: user.t_companies_department_id,
      t_companies_employment_status_id: user.t_companies_employment_status_id,
      delivery_day: menuScheduleData.delivery_day,
      order_datetime: now,
      // PayPayはユーザーがPayPay画面で承認するまで確定しないため、決済待ちで登録する
      order_status_type: isPaypay ? OrderStatusType.PENDING_PAYMENT : OrderStatusType.VALID,
      // 支払金額類
      count: req.orderCount,
      list_price: menuScheduleData.list_price,
      amount: amount,
      // 支払情報
      payment_type: user.payment_type,
      user_burden_amount: userBurdenAmount,
      // 会社負担額
      companies_burden_amount: companiesBurdenAmount,
      // クレジットカード決済情報
      // PayPayの場合、gmo_order_idにはpaypayOrderIdを格納する(RetURLコールバック時の照合キーとして使う)
      gmo_order_id: isPaypay ? paypayOrderId : gmoOrderId,
      credit_access_id: creditAccessId,
      credit_access_password: creditAccessPass,
      // PayPay決済情報
      paypay_access_id: paypayAccessId,
      paypay_access_password: paypayAccessPass,
    };
    console.log(insertValues);
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertUserText = `INSERT INTO t_order (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertUserText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '会員情報の新規登録' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit (PayPayの場合はここで在庫が確定する。決済自体はまだ未完了)
    await pgClient.query('COMMIT');

    if (!isPaypay) {
      return { success: true, data: null };
    }

    /* PayPay: コミット後に決済実行(ExecTranPaypay)を呼び、リダイレクト情報を返す
    ------------------------------------------------------------------ */
    const retUrl = `${process.env.APP_URL_DEV}/api/order/paypay-return`;
    const execRes = await execTranPaypay(paypayAccessId, paypayAccessPass, paypayOrderId, retUrl);

    if (!execRes.success || !execRes.startUrl || !execRes.token) {
      // ベストエフォートで直前にコミットした行を取消状態へ更新する。
      // (このUPDATE自体が失敗しても、TTL経過後は在庫集計から自動的に除外される)
      await client
        .from('t_order')
        .update<t_order>({ order_status_type: OrderStatusType.SYSTEM_CANCEL })
        .eq('t_menu_schedule_id', req.menuScheduleId)
        .eq('t_user_id', user.id)
        .eq('order_status_type', OrderStatusType.PENDING_PAYMENT);

      return { success: false, error: ErrorCodes.PAYPAY_PAYMENT_FAILED };
    }

    return {
      success: true,
      data: { startUrl: execRes.startUrl, accessId: paypayAccessId, token: execRes.token },
    };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};

/**
 * cancelOrder
 * 注文をキャンセルします。
 *
 * @param {ApiRequest<CancelOrderRequest>} values
 * @returns {Promise<ApiResponse<null>>}
 */
export const cancelOrder = async (values: ApiRequest<CancelOrderRequest>): Promise<ApiResponse<null>> => {
  const client = await createClient();
  const req = values.request;
  const now = getNow();

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    /* 注文キャンセル
  　------------------------------------------------------------------ */
    const { data, error } = (await client
      .from('t_menu_schedule')
      .select('delivery_day')
      .eq('id', req.menuScheduleId)
      .eq('cancel_flag', 0)
      .limit(1)
      .single()) as PostgrestSingleResponse<t_menu_schedule>;

    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '前の日付のスケジュール取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* キャンセル日時判定
    ------------------------------------------------------------------ */
    const cancelDaysBefore = user.t_companies.cancel_period_day;
    const cancelTime = user.t_companies.cancel_period_time;
    const cancelDeadlineUTC = getCancelDeadlineUTC(data.delivery_day!, cancelDaysBefore, cancelTime);

    if (now > cancelDeadlineUTC) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'キャンセル日時を超過しています。キャンセル日時:' + cancelDeadlineUTC + ', 現在日時:' + now,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* キャンセル対象の注文情報（決済情報含む）を取得
    ------------------------------------------------------------------ */
    const { data: orderData, error: orderError } = await client
      .from('t_order')
      .select(
        `
        payment_type,
        credit_access_id,
        credit_access_password,
        paypay_access_id,
        paypay_access_password,
        t_shops (
          shop_name,
          gmo_shop_code,
          gmo_shop_password
        )
      `
      )
      .eq('t_menu_schedule_id', req.menuScheduleId)
      .eq('t_user_id', user.id)
      .eq('order_status_type', OrderStatusType.VALID)
      .single();

    if (orderError || !orderData) {
      throw new Error('キャンセル可能な注文が見つかりませんでした。');
    }

    /* クレジットカード決済の場合はGMO側を取り消す
    ------------------------------------------------------------------ */
    if (orderData.payment_type === PaymentType.CREDITCARD) {
      if (orderData.credit_access_id && orderData.credit_access_password) {
        // バリデーションガードと店舗情報の抽出
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shops = orderData.t_shops as any;
        if (!shops?.gmo_shop_code || !shops?.gmo_shop_password) {
          throw new Error(`店舗「${shops?.shop_name || ''}」のGMO IDまたはGMO PASSが設定されていません。`);
        }

        // 引数に店舗マスタから取得した動的な値を引き渡す
        const gmoRes = await alterTranGmo(
          orderData.credit_access_id,
          orderData.credit_access_password,
          shops.gmo_shop_code,
          shops.gmo_shop_password
        );
        if (!gmoRes.success) {
          throw new Error(`GMO決済のキャンセルに失敗しました: ${gmoRes.errInfo}`);
        }
      }
    }

    /* PayPay決済の場合はGMO側を取り消す
    ------------------------------------------------------------------ */
    if (orderData.payment_type === PaymentType.PAYPAY) {
      if (orderData.paypay_access_id && orderData.paypay_access_password) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shops = orderData.t_shops as any;
        if (!shops?.gmo_shop_code || !shops?.gmo_shop_password) {
          throw new Error(`店舗「${shops?.shop_name || ''}」のGMO IDまたはGMO PASSが設定されていません。`);
        }

        const paypayRes = await paypayCancelReturn(
          orderData.paypay_access_id,
          orderData.paypay_access_password,
          shops.gmo_shop_code,
          shops.gmo_shop_password
        );
        if (!paypayRes.success) {
          throw new Error(`PayPay決済のキャンセルに失敗しました: ${paypayRes.errInfo}`);
        }
      }
    }

    /* 注文キャンセル
  　------------------------------------------------------------------ */
    const { error: orderCheckError } = await client
      .from('t_order')
      .update<t_order>({ order_status_type: OrderStatusType.USER_CANCEL, cancel_datetime: now })
      .eq('t_menu_schedule_id', req.menuScheduleId)
      .eq('t_user_id', user.id)
      .eq('order_status_type', OrderStatusType.VALID)
      .maybeSingle();

    if (orderCheckError) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '注文キャンセル' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * completePaypayOrder
 * PayPayからのリダイレクト帰還(RetURLコールバック)を処理する。
 * コールバックのパラメータ自体は信用せず、SearchTradeMultiでサーバー間の
 * 真の決済結果を確認してから、対象注文行をVALID/取消のいずれかへ確定させる。
 * 通知は複数回届く可能性があるため、対象行がPENDING_PAYMENTのままの場合のみ更新する
 * (楽観的排他)。
 *
 * @param {string} orderId - PayPay取引のOrderID(insertOrderで発行したpaypayOrderId)
 * @returns {Promise<ApiResponse<{ succeeded: boolean }>>}
 */
export const completePaypayOrder = async (orderId: string): Promise<ApiResponse<{ succeeded: boolean }>> => {
  const client = await createClient();

  try {
    if (!orderId) {
      throw new CustomError(ErrorCodes.PAYPAY_SESSION_EXPIRED);
    }

    /* 対象の決済待ち注文行を取得
    ------------------------------------------------------------------ */
    const { data: orderRow, error: orderRowError } = await client
      .from('t_order')
      .select(
        `
        id,
        paypay_access_id,
        paypay_access_password,
        t_shops (
          gmo_shop_code,
          gmo_shop_password
        )
      `
      )
      .eq('gmo_order_id', orderId)
      .eq('order_status_type', OrderStatusType.PENDING_PAYMENT)
      .maybeSingle();

    if (orderRowError) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '決済結果の確認' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    if (!orderRow) {
      // 既に確定済み(2重通知)、またはTTL経過で失効済み。どちらも処理不要のため成功扱いとする。
      return { success: true, data: { succeeded: false } };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shops = orderRow.t_shops as any;
    if (!shops?.gmo_shop_code || !shops?.gmo_shop_password || !orderRow.paypay_access_id) {
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    /* サーバー間で真の決済結果を確認(コールバックのパラメータ自体は信用しない)
    ------------------------------------------------------------------ */
    const searchRes = await searchTradePaypay(shops.gmo_shop_code, shops.gmo_shop_password, orderId);

    if (!searchRes.success) {
      throw new CustomError(ErrorCodes.PAYPAY_INQUIRY_FAILED);
    }

    // TODO(GMO doc要確認): 実売上完了を示す正しいStatus値・フィールド名で判定する。
    const isPaymentSucceeded = searchRes.status === 'CAPTURE' || searchRes.status === 'SALES';

    /* 決済待ち行をVALID/取消へ確定(PENDING_PAYMENTのままの行のみ更新=楽観的排他)
    ------------------------------------------------------------------ */
    const { error: updateError } = await client
      .from('t_order')
      .update<t_order>(
        isPaymentSucceeded
          ? { order_status_type: OrderStatusType.VALID }
          : { order_status_type: OrderStatusType.SYSTEM_CANCEL }
      )
      .eq('id', orderRow.id)
      .eq('order_status_type', OrderStatusType.PENDING_PAYMENT);

    if (updateError) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '注文確定' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return { success: true, data: { succeeded: isPaymentSucceeded } };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
