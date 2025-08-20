import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserBasicFormValues, UserBasicInitData, UserBasicInitRequest, UserBasicResult } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserLoginFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const getUserBasicInitData = async (
  condition: ApiRequest<UserBasicInitRequest> | null
): Promise<ApiResponse<UserBasicInitData>> => {
  return fetcher<ApiResponse<UserBasicInitData>>('/api/order/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserBasicFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const insertUserBasic = async (
  condition: ApiRequest<UserBasicFormValues> | null
): Promise<ApiResponse<UserBasicResult>> => {
  return fetcher<ApiResponse<UserBasicResult>>('/api/order/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
