'use client';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect } from 'react';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { preregisterFetcher } from './_lib/fetcher';
import { NextPageInitRequest } from './_lib/types';

/**
 * 仮登録完了Component
 * @returns {JSX.Element} JSX
 */
export const PreregistrationComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const token = useParams().token?.toString() ?? '';
  const { openSnackbar } = useSnackBar();

  /* useQuery - 仮登録
  ------------------------------------------------------------------ */
  const preregisterFetch = async () => {
    const req: ApiRequest<NextPageInitRequest> = { request: { token: token } };
    return preregisterFetcher(req);
  };

  const { data: result } = useQuery<ApiResponse<null>>({
    queryKey: [QUERY_KEYS.PREREGISTRATION_INIT_RESULT],
    queryFn: preregisterFetch,
    refetchOnWindowFocus: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return;
    }
    if (!result?.success) {
      openSnackbar(AlertType.WARNING, result.error.message);
      router.replace('/login');
    } else {
      router.replace('/register-payment');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  /* JSX
  ------------------------------------------------------------------ */
  return <>
    <>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            認証中
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            画面が切り替わるまで少々お待ちください。
          </Typography>
        </CardContent>
      </Card>
    </>
  </>;
};

