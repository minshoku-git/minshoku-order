import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { RegisterPaymentInitData, UserPaymentFormValues } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<RegisterPaymentInitData>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const getRegisterPaymentTypeInitDataFetcher = async (
  condition: ApiRequest<null> | null
): Promise<ApiResponse<RegisterPaymentInitData>> => {
  return fetcher<ApiResponse<RegisterPaymentInitData>>('/api/register-payment/init', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * registerPaymentTypeFetcher
 * @param {ApiRequest<UserPaymentFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const registerPaymentTypeFetcher = async (
  condition: ApiRequest<UserPaymentFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/register-payment/insert', {
    method: 'PUT',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
