import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserLoginFormValues } from './types';

/**
 * userlogin
 * @param {ApiRequest<UserLoginFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const userlogin = async (condition: ApiRequest<UserLoginFormValues> | null): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/login', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
