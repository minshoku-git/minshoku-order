import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { EditPaymentFormValues, EditPaymentInitData } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserPaymentFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const getEditPaymentTypeInitDataFetcher = async (
  condition: ApiRequest<null> | null
): Promise<ApiResponse<EditPaymentInitData>> => {
  return fetcher<ApiResponse<EditPaymentInitData>>('/api/edit-payment/init', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserPaymentFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const updatePaymentTypeFetcher = async (
  condition: ApiRequest<EditPaymentFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/edit-payment/update', {
    method: 'PUT',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
