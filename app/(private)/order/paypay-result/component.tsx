'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Btn } from '@/app/_ui/components/atoms/Button';

/**
 * PayPayお支払い結果Component
 * サーバー側(/api/order/paypay-return)で決済結果を確定済みのため、
 * このページはクエリパラメータ(status)に応じた結果表示のみを行う。
 * データ取得は不要なため、4点セット規約の _lib/fetcher.ts 等はあえて作らない。
 */
export const PaypayResultComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSucceeded = searchParams.get('status') === 'success';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 6 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {isSucceeded ? 'お支払いが完了しました' : '決済が完了しませんでした'}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center' }}>
        {isSucceeded
          ? 'ご注文を受け付けました。'
          : 'PayPayでのお支払いが完了しませんでした。お手数ですが、もう一度注文をお試しください。'}
      </Typography>
      <Btn label="注文画面に戻る" eventhandler={() => router.push('/order')} />
    </Box>
  );
};
