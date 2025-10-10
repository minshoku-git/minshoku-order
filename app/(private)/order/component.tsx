'use client';
import { JSX, useEffect, useState } from 'react';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { AlertType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import MenuCard from '@/app/_ui/components/organisms/menu/MenuCard';
import MenuCardConfirm from '@/app/_ui/components/organisms/menu/MenuCardConfirm';
import MenuCardNone from '@/app/_ui/components/organisms/menu/MenuCardNone';
import MenuCardSkeleton from '@/app/_ui/components/organisms/menu/MenuCardSkeleton';
import { MenuDateNavigation } from '@/app/_ui/components/organisms/menu/MenuDateNavigation';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { cancelOrderFetcher, getOrderInitFetcher, orderFetcher, preOrderFetcher } from './_lib/fetcher';
import { CancelOrderRequest, OrderInitRequest, OrderInitResponse, OrderRequest } from './_lib/types';

/**
 * 注文Component
 * @returns {JSX.Element} JSX
 */
export const OrderComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [openPreOrder, setOpenPreOrder] = useState<boolean>(false);
  const [scheduleID, setScheduleID] = useState<number | undefined>(undefined);
  const [count, setCount] = useState(1);
  const [condition, setCondition] = useState<ApiRequest<OrderInitRequest>>({ request: { move_t_menu_schedule_id: undefined } });

  /* useQuery - 初期取得
  ------------------------------------------------------------------ */
  const { data, refetch, isLoading } = useApiQuery<OrderInitResponse>({
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
    if (!data) {
      return
    } else {
      setScheduleID(data.menuScheduleData?.id ?? undefined)
    }
  }, [data]);


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
    if (!scheduleID) return
    preOrderMutate.mutate(scheduleID);
  };

  const preOrderMutate = useApiMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<OrderRequest> = { request: { order_count: count, t_menu_schedule_id: id } };
      return preOrderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: () => {
      setOpenPreOrder(true);
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 注文確定
  ------------------------------------------------------------------ */
  const orderHandler = async () => {
    if (!scheduleID) return
    orderMutate.mutate(scheduleID);
  };

  const orderMutate = useApiMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<OrderRequest> = { request: { order_count: count, t_menu_schedule_id: id } };
      return orderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: async () => {
      await refetch()
      openSnackbar(AlertType.INFO, '注文が完了しました。');
      setOpenPreOrder(false);
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - 注文キャンセル
 ------------------------------------------------------------------ */
  const cancelOrderHandler = async () => {
    if (!scheduleID) return
    cancelOrderMutate.mutate(scheduleID);
  };

  const cancelOrderMutate = useApiMutation({
    mutationFn: async (id: number) => {
      openProcessing();
      const req: ApiRequest<CancelOrderRequest> = { request: { t_menu_schedule_id: id } };
      return cancelOrderFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: async () => {
      await refetch()
      openSnackbar(AlertType.INFO, '注文をキャンセルしました。');
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
  // ロード中はスケルトンを表示し、DOM構造のブレを防ぐ
  if (isLoading || !data) {
    // データ取得中、またはデータがまだ空の場合はスケルトンを表示
    // MenuCardNoneを表示するのはデータ取得完了後、かつメニューデータがnullの場合のみ
    return <MenuCardSkeleton />;
  }

  return (
    <>
      {data.menuScheduleData ? (
        <>
          {!openPreOrder ? (
            <>
              {/* 日付ナビゲーションはデータがあれば常に表示 */}
              <MenuDateNavigation
                menuDate={data.menuScheduleData.delivery_day as string}
                moveMenu={moveMenu}
                nextScheduleId={data.nextScheduleId}
                previousScheduleId={data.previousScheduleId}
              />
              {/* メインコンテンツ部分の制御 */}
              <MenuCard
                preOrderHandler={preOrderHandler}
                cancelOrderHandler={cancelOrderHandler}
                data={data}
                count={count}
                setCount={setCount}
              />
            </>
          ) : (
            <MenuCardConfirm
              data={data}
              count={count}
              backHandler={backHandler}
              orderHandler={orderHandler}
            />
          )}
        </>
      ) : (
        // データが存在しない（メニューがない）場合
        <MenuCardNone />
      )}
    </>
  );
};
