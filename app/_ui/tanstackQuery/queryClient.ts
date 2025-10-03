import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { QUERY_KEYS } from '@/app/_types/queryKeys';

import { AlertType } from '../../_types/enum';
import { showGlobalSnackbar } from '../snackBar/snackbarContext';

// エラーメッセージの定義
const FETCH_FAILURE_MESSAGE =
  'データの取得に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
const MUTATE_FAILURE_MESSAGE =
  'データの更新に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';

// 外部にエクスポートするQueryClientインスタンスを定義
export const queryClientInstance = newQueryClient(); // 修正: newQueryClientの戻り値で初期化

/**
 * TanStack QueryのQueryClientインスタンスを作成・設定する関数
 * @returns 設定済みのQueryClientインスタンス
 */
function newQueryClient(): QueryClient {
  const clientInstance = new QueryClient({
    // ------------------------------------------------------------------
    // 1. デフォルトオプションの統一 (Global Defaults)
    // ------------------------------------------------------------------
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分間はStaleではないと見なす
        gcTime: 1000 * 60 * 30, // 30分間はキャッシュに残す (gcTime > staleTime)
        retry: 2, // 2回リトライ
        refetchOnWindowFocus: false, // ウィンドウフォーカス時のリフェッチを無効化
      },
    },
    // ------------------------------------------------------------------
    // 2. クエリエラーのグローバルロギングとSnackbar表示 (Fetching/useQuery)
    // ------------------------------------------------------------------
    queryCache: new QueryCache({
      onError: (error, query) => {
        const API_ERROR_PREFIX = 'API_LOGIC_ERROR: ';

        console.error('*** TanStack Query Fetch Error ***');
        console.error('Query Key:', query.queryKey);
        console.error('Error:', error);

        // サーバー側ApiErrorの場合（useApiQueryでSnackbar表示済み）
        if (error instanceof Error && error.message.startsWith(API_ERROR_PREFIX)) {
          // **何もしない。Snackbar表示をスキップする**
          return;
        }

        // ユーザー向けSnackbar表示: 共通メッセージ
        showGlobalSnackbar(AlertType.ERROR, FETCH_FAILURE_MESSAGE);
      },
    }),
    // ------------------------------------------------------------------
    // 3. ミューテーションエラーのグローバルロギングとSnackbar表示 (Mutating/useMutation)
    // ------------------------------------------------------------------
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        console.error('*** TanStack Mutation Update Error ***');
        console.error('Mutation Key:', mutation.options.mutationKey || 'N/A'); // MutationKeyがあれば表示
        console.error('Error:', error);

        // ユーザー向けSnackbar表示: 共通メッセージ
        showGlobalSnackbar(AlertType.ERROR, MUTATE_FAILURE_MESSAGE);
      },
    }),
  });

  // 永続化の設定
  if (typeof window !== 'undefined') {
    // SSR環境でのエラー回避のため、windowの存在を確認
    persistQueryClient({
      queryClient: clientInstance,
      persister: createAsyncStoragePersister({ storage: window.localStorage }),
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // 永続化対象のキーを定義
          const PERSIST_KEYS = [QUERY_KEYS.AUTH_STATUS];

          // queryKeyの最初の要素（メインキー）が永続化対象リストに含まれているか確認
          // queryKeyは配列なので、最初の要素（例: ['TOKEN_CHECK_RESULT', userId]）を確認
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const primaryKey: any = query.queryKey[0];

          return PERSIST_KEYS.includes(primaryKey);
        },
      },
    });
  }

  return clientInstance; // 修正: 作成したインスタンスを返す
}
