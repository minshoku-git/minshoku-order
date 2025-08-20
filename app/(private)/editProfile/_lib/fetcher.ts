import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { UserProfileFormValues, UserProfileInitData } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<null>} condition
 * @returns {Promise<ApiResponse<UserProfileInitData>>}
 */
export const getUpdateProfileInitData = async (
  condition: ApiRequest<null> | null
): Promise<ApiResponse<UserProfileInitData>> => {
  return fetcher<ApiResponse<UserProfileInitData>>('/api/sendPasswordResetMail', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserProfileFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const updateProfile = async (
  condition: ApiRequest<UserProfileFormValues> | null
): Promise<ApiResponse<null>> => {
  return fetcher<ApiResponse<null>>('/api/sendPasswordResetMail', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
