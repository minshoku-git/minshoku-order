import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { formatISO } from 'date-fns';

import { BUCKET_SHOP_IMAGES } from '@/app/_config/constants';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule, t_order } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getImageSignedUrl } from '@/app/_lib/supabaseStorage/getImageUrl';
import { formatJstDate, getCancelDeadlineUTC, getNow, getOrderDeadlineUTC } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { convertPaymentTypeName, OrderStatusType, PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getLoginUserDetail } from '../../../_lib/getLoginUser/getLoginUserDetail';
import {
  CancelOrderRequest,
  OmitMenuScheduleAndShop,
  OrderInitRequest,
  OrderInitResponse,
  OrderRequest,
} from './types';

/**
 * getOrderInit
 * 注文画面の初期情報を取得する。
 *
 * @param {ApiRequest<OrderInitRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderInitResponse>>} 検索結果
 */
export const getOrderInit = async (values: ApiRequest<OrderInitRequest>): Promise<ApiResponse<OrderInitResponse>> => {
  const client = await createClient();
  const menuSchesuleId = values.request.move_t_menu_schedule_id;
  const now = getNow();
  const today = formatISO(now);

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    /* メニュー情報取得
    ------------------------------------------------------------------ */
    const selectColumns = `id,
            delivery_day,
            menu_name,
            allergen_labelling,
            spice_level,
            list_price,
            sale_price,
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
          .gte('delivery_day', today) // 今日以降
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
        ErrorCodes.NOT_FOUND.code,
        'メニュースケジュール情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
        ErrorCodes.NOT_FOUND.code,
        '前の日付のスケジュール取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
        ErrorCodes.NOT_FOUND.code,
        '次の日付のスケジュールデータ取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
    console.log('スケジュールID', menuSchesuleId ?? data.id);

    if (errorOrder) {
      console.error(errorOrder);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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
    console.log('スケジュールID', menuSchesuleId ?? data.id);

    if (errorCountOrder) {
      console.error(errorCountOrder);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '現在の注文数の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const orderCount = countOrderData ? countOrderData.reduce((sum, item) => sum + (item.count ?? 0), 0) : 0;

    /* 注文可否判定
    ------------------------------------------------------------------ */
    const orderPeriodDaysBefore = user.t_companies.order_period_day;
    const orderPeriodTime = user.t_companies.order_period_time;
    const orderDeadlineUTC = getOrderDeadlineUTC(data.delivery_day, orderPeriodDaysBefore, orderPeriodTime);

    console.log('現在日時:', now);
    console.log('納品日:', data.delivery_day);
    console.log('注文期限:', orderDeadlineUTC);

    const isOrderDeadlinePassed = now >= orderDeadlineUTC;

    /* 注文キャンセル可否判定
    ------------------------------------------------------------------ */
    const cancelDaysBefore = user.t_companies.cancel_period_day;
    const cancelTime = user.t_companies.cancel_period_time;
    const cancelDeadlineUTC = getCancelDeadlineUTC(data.delivery_day, cancelDaysBefore, cancelTime);

    console.log('キャンセル日時:', cancelDeadlineUTC);

    const isCancellable = cancelDeadlineUTC > now;

    /* 店舗イメージ画像取得
    ------------------------------------------------------------------ */
    const imageSignedUrl = data.t_shops.shop_image_safe_file_name
      ? await getImageSignedUrl(
          client,
          BUCKET_SHOP_IMAGES,
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
        allergen_labelling: data.allergen_labelling ?? '',
        menu_name: data.menu_name ?? '',
        menu_description: data.menu_description ?? '',
        sale_price: data.sale_price ?? 0,
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
        offer_time_from: user.t_companies.offer_time_from!.slice(0, 5),
        offer_time_to: user.t_companies.offer_time_to!.slice(0, 5),
        order_period_day: user.t_companies.order_period_day,
        order_period_time: user.t_companies.order_period_time!.slice(0, 5),
        cancel_period_day: user.t_companies.cancel_period_day,
        cancel_period_time: user.t_companies.cancel_period_time!.slice(0, 5),
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
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    console.error(e);
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * preOrder
 * 注文状況を確認します。
 *
 * @param {ApiRequest<OrderRequest>} values
 * @returns {Promise<ApiResponse<null>>}
 */
export const preOrder = async (values: ApiRequest<OrderRequest>): Promise<ApiResponse<null>> => {
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
      .eq('id', req.t_menu_schedule_id)
      .eq('cancel_flag', 0)
      .single();

    if (scheduleError) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'メニュースケジュール情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
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

    /* 自身の注文状況
  　------------------------------------------------------------------ */
    const { data: orderCheck, error: orderCheckError } = await client
      .from('t_order')
      .select('id')
      .eq('t_menu_schedule_id', req.t_menu_schedule_id)
      .eq('t_user_id', user.id)
      .eq('order_status_type', OrderStatusType.VALID)
      .maybeSingle();

    if (orderCheckError) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '注文状況の確認' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    if (orderCheck && orderCheck.id) {
      throw new CustomError(ErrorCodes.ORDER_ALREADY_PLACED);
    }

    /* 現在の在庫数の確認
  　------------------------------------------------------------------ */
    const { data: orders, error: ordersError } = await client
      .from('t_order')
      .select('count')
      .eq('t_menu_schedule_id', req.t_menu_schedule_id)
      .eq('order_status_type', OrderStatusType.VALID);

    if (ordersError) {
      throw ordersError;
    }

    // 現在の注文数を合計
    const totalOrders = orders.reduce((sum, order) => sum + order.count, 0);

    // 納品数を超過しているか
    if (totalOrders + req.order_count > menuSchedule.stock_count) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ご希望の数量は、残り注文可能数を上回っています。' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  }
};

/**
 * getOrderInit
 * 注文情報を新規登録します。
 *
 * @param {ApiRequest<OrderRequest>} values
 * @returns {Promise<ApiResponse<null>>}
 */
export const insertOrder = async (values: ApiRequest<OrderRequest>): Promise<ApiResponse<null>> => {
  const pgClient = createPgClient();
  const client = await createClient();

  const req = values.request;
  const today = formatISO(getNow());
  const now = getNow();

  try {
    /* ユーザー情報取得
      ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* スケジュール情報取得とテーブルロック
  　------------------------------------------------------------------ */
    const selectSql = `
        SELECT 
          *
        FROM
          t_menu_schedule
        WHERE 
          id = $1
          AND cancel_flag = $2
        -- AND delivery_day = $2
        -- TASK: 現在日時より前の納品日ではないことを確認する
        FOR UPDATE`; // MEMO: テーブルロック

    const resultMenuSchedule = await pgClient.query<t_menu_schedule>(selectSql, [req.t_menu_schedule_id, 0]);
    const stockCount = resultMenuSchedule.rows[0].stock_count ? resultMenuSchedule.rows[0].stock_count : 0;

    if (resultMenuSchedule.rows.length === 0 || stockCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '在庫切れ' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    const menuScheduleData: t_menu_schedule = resultMenuSchedule.rows[0];

    /* ユーザーの注文状況確認
  　------------------------------------------------------------------ */
    const selectUserSql = `
        SELECT 
          id
        FROM
          t_order
        WHERE 
          id = $1
          AND t_user_id = $2
          AND order_status_type = $3`;

    const existingOrderResult = await pgClient.query(selectUserSql, [
      req.t_menu_schedule_id,
      user.id,
      OrderStatusType.VALID,
    ]);

    if (existingOrderResult.rows.length > 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '既に注文済みです。' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 現在の注文数取得
  　------------------------------------------------------------------ */
    const selectOrderSql = `
        SELECT 
          SUM(count) as total_count
        FROM
          t_order
        WHERE 
          id = $1
          AND order_status_type = $2`;

    // Insert
    const resultOrder = await pgClient.query(selectOrderSql, [req.t_menu_schedule_id, OrderStatusType.VALID]);
    const totalCount = resultOrder.rows[0].total_count ? resultOrder.rows[0].total_count : 0;

    if (totalCount + req.order_count > menuScheduleData.stock_count!) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '注文上限数を超過しました。' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 会社負担額
    ------------------------------------------------------------------ */
    const burden: number = user.t_companies_employment_status.set_meal_burden ?? 0;
    const companiesBurdenAmount = req.order_count * burden;

    const amount = menuScheduleData.sale_price! * req.order_count;

    // ユーザー負担額
    const userBurdenAmount = amount - companiesBurdenAmount;

    /* 注文情報の新規登録
    ------------------------------------------------------------------ */
    const insertValues: Omit<t_order, 'id' | 'cancel_datetime' | 'created_at' | 'updated_at'> = {
      t_menu_schedule_id: req.t_menu_schedule_id,
      t_shops_id: Number(menuScheduleData.t_shops_id),
      t_user_id: user.id,
      t_companies_id: user.t_companies_id,
      t_companies_department_id: user.t_companies_department_id,
      t_companies_employment_status_id: user.t_companies_employment_status_id,
      delivery_day: menuScheduleData.delivery_day,
      order_datetime: now,
      order_status_type: OrderStatusType.VALID,
      // 支払金額類
      count: req.order_count,
      list_price: menuScheduleData.list_price,
      amount: amount,
      // 支払情報
      payment_type: user.payment_type,
      user_burden_amount: userBurdenAmount,
      // 会社負担額
      companies_burden_amount: companiesBurdenAmount,
      // クレジットカード情報 TASK:置き換え
      gmo_order_id: PaymentType.CREDITCARD === user.payment_type ? '' : '',
      credit_access_id: PaymentType.CREDITCARD === user.payment_type ? '' : '',
      credit_access_password: PaymentType.CREDITCARD === user.payment_type ? '' : '',
      // paypay情報 TASK:置き換え
      paypay_access_id: PaymentType.PAYPAY === user.payment_type ? '' : '',
      paypay_access_password: PaymentType.PAYPAY === user.payment_type ? '' : '',
    };
    console.log(insertValues);
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertUserText = `INSERT INTO t_order (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    // Insert
    const result = await pgClient.query(insertUserText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '会員情報の新規登録' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // const newUserId: number = result.rows[0]?.id;

    /* クレジットカード登録
    　------------------------------------------------------------------ */
    // TODO:クレジットカード登録

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
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
  const today = formatISO(getNow());
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
      .eq('id', req.t_menu_schedule_id)
      .eq('cancel_flag', 0)
      .limit(1)
      .single()) as PostgrestSingleResponse<t_menu_schedule>;

    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '前の日付のスケジュール取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* キャンセル日時判定
    ------------------------------------------------------------------ */
    const cancelDaysBefore = user.t_companies.cancel_period_day;
    const cancelTime = user.t_companies.cancel_period_time;
    const cancelDeadlineUTC = getCancelDeadlineUTC(data.delivery_day!, cancelDaysBefore, cancelTime);

    if (now > cancelDeadlineUTC) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'キャンセル日時を超過しています。キャンセル日時:' + cancelDeadlineUTC + ', 現在日時:' + now,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 注文キャンセル
  　------------------------------------------------------------------ */
    const { error: orderCheckError } = await client
      .from('t_order')
      .update<t_order>({ order_status_type: OrderStatusType.USER_CANCEL, cancel_datetime: now })
      .eq('t_menu_schedule_id', req.t_menu_schedule_id)
      .eq('t_user_id', user.id)
      .eq('order_status_type', OrderStatusType.VALID)
      .maybeSingle();

    if (orderCheckError) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '注文キャンセル' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  }
};
