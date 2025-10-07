import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { ORDER_HISTORY_PAGE_MAX_COUNT } from '@/app/_config/constants';
import { createClient } from '@/app/_lib/supabase/server';
import { t_order } from '@/app/_lib/supabase/tableTypes';
import { formatJstDate, formatJstDateTime } from '@/app/_lib/utils/getDateTime';
import { convertPaymentTypeName, PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getLoginUserDetail } from '../../../_lib/getLoginUser/getLoginUserDetail';
import { OrderData, OrderHistoryData, OrderHistoryRequest, OrderHistoryResponse } from './types';

/**
 * getOrderHistory
 * 注文画面の初期情報を取得する。
 *
 * @param {ApiRequest<OrderInitRequest>} values - 検索条件
 * @returns {Promise<ApiResponse<OrderInitResponse>>} 検索結果
 */
export const getOrderHistory = async (
  values: ApiRequest<OrderHistoryRequest>
): Promise<ApiResponse<OrderHistoryResponse>> => {
  const client = await createClient();
  const nextPage = values.request.pageParam;

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);
    console.log(user.id);

    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const queryDays = client
      .from('t_order')
      .select('delivery_day')
      .eq('t_user_id', user.id)
      .order('delivery_day', { ascending: false });

    const { data: days, error: errorDays } = (await queryDays) as PostgrestSingleResponse<
      Array<Pick<t_order, 'delivery_day'>>
    >;

    if (errorDays) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '注文履歴情報の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    if (!days) {
      return { success: true, data: { lastPage: null, orderData: [] } };
    }

    /* ページング処理
    ------------------------------------------------------------------ */
    const page = nextPage;
    const pageSize = ORDER_HISTORY_PAGE_MAX_COUNT;

    const uniqueDays = Array.from(new Set(days.map((d) => d.delivery_day)));
    const pagedDays = uniqueDays.slice(page * pageSize, (page + 1) * pageSize);

    // 次のページが存在するかどうか
    const hasNextPage = (page + 1) * pageSize < uniqueDays.length;

    /* メニュー情報取得
    ------------------------------------------------------------------ */
    const selectColumns = `
        id,
        delivery_day,
        count,
        user_burden_amount,
        payment_type,
        order_datetime,
        order_status_type,
        cancel_datetime,
        t_shops!inner(shop_name),
        t_menu_schedule!inner(menu_name)`;

    const query = client
      .from('t_order')
      .select(selectColumns)
      .eq('t_user_id', user.id)
      .in('delivery_day', pagedDays)
      .order('delivery_day', { ascending: false }) // 降順
      .order('order_datetime', { ascending: false }); // 降順

    const { data, error } = (await query) as PostgrestSingleResponse<OrderData[]>;
    if (error) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '注文履歴の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    if (!data || data.length === 0) {
      // MEMO: メニュースケジュールが存在しないため、予定なしとして正常終了。
      return {
        success: true,
        data: { lastPage: null, orderData: [] },
      };
    }

    // 取得したデータを日付ごとにグループ化
    const groupedData = data.reduce((acc, current) => {
      const formattedDate = formatJstDate(current.delivery_day as Date);

      const orderItem = {
        ...current,
        delivery_day: formattedDate,
        cancel_datetime: current.cancel_datetime ? formatJstDateTime(current.cancel_datetime as Date) : undefined,
        payment_type: convertPaymentTypeName(current.payment_type as PaymentType),
      };

      const group = acc.find((item) => item.delivery_day === formattedDate);

      if (group) {
        group.orderData.push(orderItem);
      } else {
        acc.push({
          delivery_day: formattedDate,
          orderData: [orderItem],
        });
      }

      return acc;
    }, [] as OrderHistoryData[]);

    return {
      success: true,
      data: { lastPage: hasNextPage ? page + 1 : null, orderData: groupedData },
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
