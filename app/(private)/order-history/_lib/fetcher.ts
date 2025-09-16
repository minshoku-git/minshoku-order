import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { OrderData, OrderHistoryRequest, OrderHistoryResponse } from './types';

/**
 * getOrderInitFetcher
 * @param {ApiRequest<OrderHistoryRequest>} condition
 * @returns {Promise<ApiResponse<OrderHistoryResponse>>}
 */
export const getOrderHistoryFetcher = async (
  condition: ApiRequest<OrderHistoryRequest>
): Promise<ApiResponse<OrderHistoryResponse>> => {
  return fetcher<ApiResponse<OrderHistoryResponse>>('/api/order-history/select', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
