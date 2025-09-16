'use client';
import { Box, Card, CardContent, CircularProgress, Divider, Typography } from '@mui/material';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useRef, useState } from 'react';

import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { getOrderHistoryFetcher } from './_lib/fetcher';
import { OrderHistoryResponse } from './_lib/types';

/**
 * 注文履歴
 * @returns {JSX.Element} JSX
 */
export const OrderHistoryComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();

  /* useQuery - 初期取得
  ------------------------------------------------------------------ */
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery<ApiResponse<OrderHistoryResponse>>({
    queryKey: [QUERY_KEYS.ORDER_HISTORY_RESULT],
    queryFn: ({ pageParam = 0 }) => getOrderHistoryFetcher({ request: { pageParam: pageParam as number } }),
    refetchOnWindowFocus: false,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.success && lastPage.data.lastPage,
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    // 監視対象要素が存在しない、または次のページがない場合は何もしない
    if (!observerTarget.current || !hasNextPage) {
      return;
    }

    // Intersection Observer のインスタンスを作成
    const observer = new IntersectionObserver(
      (entries) => {
        // 監視対象要素が画面に入ったかどうかをチェック
        if (entries[0].isIntersecting) {
          // 次のページのデータを取得
          fetchNextPage();
        }
      },
      { threshold: 1.0 } // 監視対象が100%画面に入ったら発動
    );

    // 監視を開始
    observer.observe(observerTarget.current);

    // クリーンアップ関数
    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage]);

  const orders = data?.pages.flatMap((page) =>
    page.success ? page.data.orderData : []
  ) ?? [];

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Typography variant="h3" sx={{ fontSize: 20, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        注文履歴
      </Typography>
      <Box>
        {!isLoading && <>
          {orders.map((order) => (
            <Box key={order.delivery_day} sx={{ mb: 2 }}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  {/* 日付ヘッダー */}
                  <Typography
                    variant="h3"
                    sx={{ fontSize: 16, mb: 2, fontWeight: 'bold', borderRadius: 2, background: '#ffb59a', py: 1, px: 2 }}
                  >
                    {order.delivery_day}
                  </Typography>
                  {/* 注文データ */}
                  {order.orderData.map((item, index) => (
                    <Box key={item.id}>
                      {/* 最初の要素以外にDividerを表示 */}
                      {index > 0 && <Divider sx={{ mt: 2, mb: 2, backgroundColor: '#333' }} />}
                      {/* キャンセル済みの表示 */}
                      {item.cancel_datetime && (
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: 16,
                            mb: 2,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            background: '#afafaf',
                            display: 'inline-block',
                            py: 1,
                            px: 2,
                          }}
                        >
                          キャンセル済み
                        </Typography>
                      )}

                      {/* 各注文の詳細 */}
                      <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                        店舗：{item.t_shops.shop_name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                        商品：{item.t_menu_schedule.menu_name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                        数量：{item.count}食
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                        金額：{item.user_burden_amount}円(税込)
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                        支払い方法：{item.payment_type}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          ))}
          {orders.length === 0 && <>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                  <Typography sx={{ fontSize: 16 }}>
                    ご注文履歴がありません。<br />最初のご注文をお待ちしています。
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
          }
        </>}
      </Box>
      <Box ref={observerTarget}>
        {(isLoading || isFetchingNextPage) &&
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress color="warning" size="4rem" />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: '#ea5315' }}
                >Loading</Typography>
              </Box>
            </Box>
          </Box>
        }
      </Box>
    </>
  );
};
