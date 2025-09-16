import { fetcher } from '@/app/_lib/fetcher';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { SignUpInitData, SignUpInitRequest, SignUpRequest, SignUpResponse } from './types';

/**
 * sendPasswordResetMail
 * @param {ApiRequest<UserLoginFormValues>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const SignUpInitDataFetcher = async (
  condition: ApiRequest<SignUpInitRequest> | null
): Promise<ApiResponse<SignUpInitData>> => {
  return fetcher<ApiResponse<SignUpInitData>>('/api/signup/getSignUpInitData', {
    method: 'POST',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * sendPasswordResetMail
 * @param {ApiRequest<SignUpRequest>} condition
 * @returns {Promise<ApiResponse<null>>}
 */
export const SignUpFetcher = async (
  condition: ApiRequest<SignUpRequest> | null
): Promise<ApiResponse<SignUpResponse>> => {
  return fetcher<ApiResponse<SignUpResponse>>('/api/signup/insertUserProfile', {
    method: 'PUT',
    body: JSON.stringify(condition),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
