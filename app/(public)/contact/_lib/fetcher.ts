import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { ContactFormValues } from './types';

/**
 * searchOrderList
 * @param {ApiRequest<ContactFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const sendContact = async (condition: ApiRequest<ContactFormValues> | null): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/order/search', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
