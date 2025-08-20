import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { PasswordFormValues } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<ContactFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const sendPasswordResetMail = async (
  condition: ApiRequest<PasswordFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/sendPasswordResetMail', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
