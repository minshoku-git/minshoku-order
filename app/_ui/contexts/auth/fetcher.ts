import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { AuthContextResponse } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<null>} condition
 * @returns {Promise<ApiResponse<AuthContextResponse>>}
 */
export const SessionStatusfetcher = async (
  condition: ApiRequest<null> | null
): Promise<ApiResponse<AuthContextResponse>> => {
  return fetcher<ApiResponse<AuthContextResponse>>('/api/supabase', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
