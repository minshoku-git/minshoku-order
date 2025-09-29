import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { PasswordResetFormValues } from './types';

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
