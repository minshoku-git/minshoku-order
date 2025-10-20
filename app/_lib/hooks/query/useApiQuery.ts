/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { AlertType } from '@/app/_types/enum';
import { ApiResponse, ApiSuccess, isApiError } from '@/app/_types/types';

import { showGlobalSnackbar } from '../../../_ui/state/snackBar/snackbarContext';

// ----------------------------------------------------------------------
// 💡 型ユーティリティ: ApiResponseから成功型のみを抽出
// ----------------------------------------------------------------------

// Tが { success: true, data: D } の構造を持つ場合のみ、その型を抽出する
type SuccessResponse<T> = T extends { success: true; data: infer D } ? T : never;

// ----------------------------------------------------------------------
// 💡 カスタム useApiQuery フックのオプション定義
// ----------------------------------------------------------------------

type UseApiQueryOptions<TQueryFnData, TData, TQueryKey extends readonly unknown[]> = Omit<
  UseQueryOptions<ApiResponse<TQueryFnData>, unknown, TData, TQueryKey>,
  'select' | 'queryFn' | 'initialData' // TanStack Queryの型を上書き
> & {
  // queryFnは必ず ApiResponse<TQueryFnData> を返すことを強制
  queryFn: (context: { signal?: AbortSignal }) => Promise<ApiResponse<TQueryFnData>>;

  // initialDataも ApiResponse<TQueryFnData> 型で受け取る
  initialData?: ApiResponse<TQueryFnData> | (() => ApiResponse<TQueryFnData>);
};

/**
 * APIレスポンスのエラー(success: false)を自動的に検知し、
 * QueryClientのグローバルonErrorに処理を委譲するカスタムクエリフック。
 * * @param options - TanStack Queryオプション。queryFnは ApiResponse<T> を返します。
 */
export const useApiQuery = <
  TQueryFnData,
  TData = TQueryFnData,
  TQueryKey extends [string, ...any[]] = [string, ...any[]],
>(
  options: UseApiQueryOptions<TQueryFnData, TData, TQueryKey>
) => {
  // ApiErrorがグローバルエラーハンドリングと重複しないようにするためのプレフィックス
  const API_LOGIC_ERROR_PREFIX = 'API_LOGIC_ERROR: ';

  const wrappedQueryFn = async (context: { signal?: AbortSignal }): Promise<ApiResponse<TQueryFnData>> => {
    try {
      const response = await options.queryFn(context);

      // 1. サーバー処理エラー(ApiError)のチェック (success: falseの場合)
      if (isApiError(response)) {
        // ログ出力のみ行い、Snackbar表示はグローバルonErrorに委譲する
        console.log('*** TanStack ApiError ***', response.error.code, response.error.message);
        // 💡 修正: ApiErrorが返した具体的なメッセージをここでSnackbar表示する
        showGlobalSnackbar(AlertType.ERROR, response.error.message);

        // 🚨 意図的にエラーをスローし、useQueryを isError=true にする
        // グローバル onError でメッセージを解析できるようにエラーオブジェクトを文字列化してスロー
        // (このプレフィックスが、グローバル側でSnackbar表示をスキップする目印になる)
        throw new Error(API_LOGIC_ERROR_PREFIX + JSON.stringify(response.error));
      }

      // 成功 (ApiSuccess<TQueryFnData>) の場合
      return response;
    } catch (error) {
      // ネットワークエラーや、fetcher内で発生した予期せぬエラーはここで捕捉される
      // 何もせず再スローすることで、QueryCacheのグローバルonErrorに処理を委譲する
      throw error;
    }
  };

  // 最終的な useQuery 呼び出し
  return useQuery<ApiResponse<TQueryFnData>, unknown, TData, TQueryKey>({
    ...options,
    queryFn: wrappedQueryFn,

    // 💡 データの抽出をフック内部で強制し、コンポーネント側の .data アクセスを不要にする
    // 成功レスポンスから純粋なデータ (TQueryFnData) を抽出する
    select: (res) => (res as ApiSuccess<TQueryFnData>).data as unknown as TData,
  });
};
