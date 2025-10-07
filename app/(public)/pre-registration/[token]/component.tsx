'use client';
import { Card, CardContent, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect } from 'react';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { ApiRequest } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

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

  const { data, error } = useApiQuery<null>({
    queryKey: [QUERY_KEYS.PREREGISTRATION_INIT_RESULT],
    queryFn: preregisterFetch,
    refetchOnWindowFocus: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (data === undefined && error === null) {
      return;
    }
    if (error) {
      router.replace('/login');
      return;
    }
    router.replace('/register-payment');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

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

