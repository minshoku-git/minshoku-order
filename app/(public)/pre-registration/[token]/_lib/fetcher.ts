import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { NextPageInitRequest } from './types';

/**
 * searchOrderList
 * @param {ApiRequest<NextPageInitRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const preregisterFetcher = async (
  condition: ApiRequest<NextPageInitRequest> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/pre-preregistration', {
    method: 'PUT',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
