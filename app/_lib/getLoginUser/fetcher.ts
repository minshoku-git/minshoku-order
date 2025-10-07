import { ApiResponse } from '@/app/_types/types';

import { fetcher } from '../fetcher';
import { LoginUserResponse } from './types';

/**
 * getUserNameFetcher
 * ログイン中のユーザー名、食堂名、登録ステータスなどの簡易情報を取得します。
 * @returns {Promise<ApiResponse<LoginUserResponse>>}
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
