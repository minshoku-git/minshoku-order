import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { CancelOrderRequest, OrderInitRequest, OrderInitResponse, OrderRequest } from './types';

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
 * @param {ApiRequest<OrderRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const preOrderFetcher = async (condition: ApiRequest<OrderRequest> | null): Promise<ApiResponse<null>> => {
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
 * @param {ApiRequest<OrderRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const orderFetcher = async (condition: ApiRequest<OrderRequest> | null): Promise<ApiResponse<null>> => {
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
