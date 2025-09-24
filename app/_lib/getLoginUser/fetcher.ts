import { ApiResponse } from '@/app/_types/types';

import { fetcher } from '../fetcher';
import { LoginUserResponse } from './types';

/**
 * getWaitingApproval
 * 承認待ちステータスのユーザー数を取得します
 * @returns {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserNameFetcher = (): Promise<ApiResponse<LoginUserResponse>> => {
  return fetcher<ApiResponse<LoginUserResponse>>('/api/util/getUserName', {
    method: 'POST',
    body: null,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
