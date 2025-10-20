import { ApiResponse } from '@/app/_types/types';

import { fetcher } from '../fetcher';
import { SessionResponse } from './types';

/**
 * getUserNameFetcher
 * ログイン中のユーザー名、食堂名、登録ステータスなどの簡易情報を取得します。
 * @returns {Promise<ApiResponse<LoginUserResponse>>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSessionFetcher = (): Promise<ApiResponse<SessionResponse>> => {
  return fetcher<ApiResponse<SessionResponse>>('/api/util/getSession', {
    method: 'POST',
    body: null,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
