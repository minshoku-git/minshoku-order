import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserPaymentFormValues } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserPaymentFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const registerPaymentTypeFetcher = async (
  condition: ApiRequest<UserPaymentFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/register-payment/', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
