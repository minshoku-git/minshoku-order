'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import MenuCard from '@/app/_ui/_parts/MenuCard';
import MenuCardConfirm from '@/app/_ui/_parts/MenuCardConfirm';
import MenuCardNone from '@/app/_ui/_parts/MenuCardNone';
import MenuCardSkeleton from '@/app/_ui/_parts/MenuCardSkeleton';
import { MenuDateNavigation } from '@/app/_ui/_parts/MenuDateNavigation';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { cancelOrderFetcher, getOrderInitFetcher, orderFetcher, preOrderFetcher } from './_lib/fetcher';
import { CancelOrderRequest, OrderInitRequest, OrderInitResponse, OrderRequest } from './_lib/types';

/**
 * 注文Component
 * @returns {JSX.Element} JSX
 */
export const OrderComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [openPreOrder, setOpenPreOrder] = useState<boolean>(false);
  const [id, setId] = useState<number | undefined>(undefined);
  const [count, setCount] = useState(1);
  const [condition, setCondition] = useState<ApiRequest<OrderInitRequest>>({ request: { move_t_menu_schedule_id: undefined } });

  /* useQuery - 初期取得
  ------------------------------------------------------------------ */
  const { data: result, refetch, isLoading } = useQuery<ApiResponse<OrderInitResponse>>({
    queryKey: [QUERY_KEYS.ORDER_INIT_RESULT],
    queryFn: () => getOrderInitFetcher(condition),
    refetchOnWindowFocus: false,
  });

  /* useEffect 会員登録後メッセージ表示
  ------------------------------------------------------------------ */
  useEffect(() => {
    const message = sessionStorage.getItem('snackbar');
    if (message) {
      openSnackbar(AlertType.SUCCESS, '支払い方法登録が完了しました。');
      sessionStorage.removeItem('snackbar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // condition変化時に検索を実行
    if (condition !== null) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  /* useEffect 初期取得
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return
    }
    if (!result.success) {
      openSnackbar(AlertType.ERROR, result.error.message);
      return
    } else {
      // MEMO:スケジュールIDが存在しない場合、メニューなし表示になる。
      setId(result.data.menuScheduleData?.id ?? undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);


  /* functions - ページ送り
  ------------------------------------------------------------------ */
  const moveMenu = (id: number) => {
    const req: ApiRequest<OrderInitRequest> = {
      request: { move_t_menu_schedule_id: id }
    }
    setCondition(req);
  }

  /* functions - 注文確認
  ------------------------------------------------------------------ */
  const preOrderHandler = async () => {
    if (!id) return
    preOrderMutate.mutate(id);
  };

  const preOrderMutate = useMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<OrderRequest> = { request: { order_count: count, t_menu_schedule_id: id } };
      return preOrderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        setOpenPreOrder(true);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '注文確認に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 注文確定
  ------------------------------------------------------------------ */
  const orderHandler = async () => {
    if (!id) return
    orderMutate.mutate(id);
  };

  const orderMutate = useMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<OrderRequest> = { request: { order_count: count, t_menu_schedule_id: id } };
      return orderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        openSnackbar(AlertType.INFO, '注文が完了しました。');
        refetch()
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '注文確認に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 注文キャンセル
 ------------------------------------------------------------------ */
  const cancelOrderHandler = async () => {
    if (!id) return
    cancelOrderMutate.mutate(id);
  };

  const cancelOrderMutate = useMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<CancelOrderRequest> = { request: { t_menu_schedule_id: id } };
      return cancelOrderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        openSnackbar(AlertType.INFO, '注文をキャンセルしました。');
        refetch()
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '注文のキャンセルに失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */
  const backHandler = async () => {
    setOpenPreOrder(false);
    await refetch()
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>{isLoading
      ? <MenuCardSkeleton />
      : <>
        {/* 日付ナビゲーション */}
        {result?.success && result.data.menuScheduleData ? (<>
          {!openPreOrder ? <>
            <MenuDateNavigation
              menuDate={result.data.menuScheduleData.delivery_day as string}
              moveMenu={moveMenu}
              nextScheduleId={result.data.nextScheduleId}
              previousScheduleId={result.data.previousScheduleId}
            />
            <MenuCard
              preOrderHandler={preOrderHandler}
              cancelOrderHandler={cancelOrderHandler}
              data={result.data}
              count={count}
              setCount={setCount}
            />
          </>
            : <MenuCardConfirm
              backHandler={backHandler}
              orderHandler={orderHandler}
            />
          }
        </>) : (
          <MenuCardNone />
        )}
      </>
    }
    </>
  );
};
