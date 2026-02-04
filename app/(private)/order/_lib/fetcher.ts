import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { CancelOrderRequest, OrderFormValues, OrderInitRequest, OrderInitResponse } from './types';

/**
 * getOrderInitFetcher
 * @param {ApiRequest<OrderInitRequest>} condition
 * @returns {Promise<ApiResponse<OrderInitResponse>>}
 */
export const getOrderInitFetcher = async (
  condition: ApiRequest<OrderInitRequest> | null
): Promise<ApiResponse<OrderInitResponse>> => {
  return fetcher<ApiResponse<OrderInitResponse>>('/api/order/init', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * preOrderFetcher
 * @param {ApiRequest<OrderFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const preOrderFetcher = async (condition: ApiRequest<OrderFormValues> | null): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/order/pre-order', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * orderFetcher
 * @param {ApiRequest<OrderFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const orderFetcher = async (condition: ApiRequest<OrderFormValues> | null): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/order/order', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * cancelOrderFetcher
 * @param {ApiRequest<CancelOrderRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const cancelOrderFetcher = async (
  condition: ApiRequest<CancelOrderRequest> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/order/cancel-order', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
