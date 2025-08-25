import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { GetAuthResponse, PasswordResetFormValues } from './types';

/**
 * getAuth
 * @param {ApiRequest<null>} condition
 * @returns {Promise<ApiResponse<GetAuthResponse>>}
 */
export const getAuthFetcher = async (condition: ApiRequest<null> | null): Promise<ApiResponse<GetAuthResponse>> => {
  return fetcher<ApiResponse<GetAuthResponse>>('/api/testPage/getAuth', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
