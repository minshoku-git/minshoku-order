import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { PasswordFormValues } from './types';

/**
 * sendResetPasswordMail
 * @param {ApiRequest<ContactFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const sendResetPasswordMail = async (
  condition: ApiRequest<PasswordFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/forgot-password/sendResetPasswordMail', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
