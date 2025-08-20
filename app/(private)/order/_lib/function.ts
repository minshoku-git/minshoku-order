import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { getDateString, getDatetimeString, getNow, getTodayXHour } from '@/app/_lib/getDateTime';
import { createClient } from '@/app/_lib/supabase/server';
import { t_menu_schedule, t_order } from '@/app/_lib/supabase/tableTypes';
import { OrderStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { OrderInitRequest, OrderInitResponse } from './types';

/**
 * _searchOrderList
 * オーダー情報を取得する。
 *
 * @param {ApiRequest<OrderInitRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderInitResponse>>} 検索結果
 */
export const getOrder = async (values: ApiRequest<OrderInitRequest>): Promise<ApiResponse<OrderInitResponse>> => {
  const supabase = await createClient();
  const req = values.request;
  const today = getTodayXHour();

  try {
    /* メニュー情報取得
  ------------------------------------------------------------------ */
    const query = supabase
      .from('t_menu_schedule')
      .select(
        `id,
      t_shops_id,
      delivery_day,
      menu_name,
      allergen_labelling,
      spice_level,
      order_count,
      list_price,
      sale_price,
      t_shops!inner(
        shop_name,
        specified_commercial_transaction_act
      )`
      )
      .eq('t_companies_id', req)
      .eq('cancel_flag', 0)
      .eq('delivery_day', today)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<t_menu_schedule>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'スケジュール情報の件数取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    /* 注文情報取得
    ------------------------------------------------------------------ */
    const queryOrder = supabase
      .from('t_order')
      .select('id, count')
      .eq('t_user_id', req)
      .eq('t_menu_schedule_id', req)
      .eq('order_status', OrderStatus.VALID)
      .single();
    const { data: dataOrder, error: errorOrder } = (await queryOrder) as PostgrestSingleResponse<t_order>;

    if (errorOrder) {
      console.error(errorOrder);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'オーダー情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* 返却
    ------------------------------------------------------------------ */
    const res: OrderInitResponse = {
      t_menu_schedule_id: data.id,
      delivery_day: data.delivery_day ? getDateString(data.delivery_day as Date) : '',
      list_price: data.list_price ?? 0,
      allergen_labelling: data.allergen_labelling,
      menu_name: data.menu_name,
      order_count: data.order_count,
      sale_price: data.sale_price,
      spice_level: data.spice_level,
      stock_count: data.stock_count,
      t_shops: {
        shop_name: '',
        specified_commercial_transaction_act: '',
      },
      t_companies: {},
    };

    return {
      success: true,
      data: res,
    };
  } catch (e: unknown) {
    console.error(e);
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
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};
