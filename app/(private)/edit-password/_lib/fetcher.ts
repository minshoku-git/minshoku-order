import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { EditPasswordFormValues } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<EditPasswordFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const updatePasswordFetcher = async (
  condition: ApiRequest<EditPasswordFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/edit-password/update', {
    method: 'PUT',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
