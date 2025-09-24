import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { CheckTokenRequest, CheckTokenResponse, PasswordResetFormValues } from './types';

/**
 * checkToken
 * @param {ApiRequest<CheckTokenRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const checkToken = async (
  condition: ApiRequest<CheckTokenRequest> | null
): Promise<ApiResponse<CheckTokenResponse>> => {
  return fetcher<ApiResponse<CheckTokenResponse>>('/api/checkToken', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * updatePasswordFetcher
 * @param {ApiRequest<ContactFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const updatePasswordFetcher = async (
  condition: ApiRequest<PasswordResetFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/update-password', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
