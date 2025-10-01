// errorHandler.ts
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { AlertType } from '../../_types/enum';
import { showGlobalSnackbar } from '../snackBar/snackbarContext';

const FETCH_FAILURE_MESSAGE =
  'データの取得に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
const MUTATE_FAILURE_MESSAGE =
  'データの更新に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';

export const queryClientInstance = new QueryClient({
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
      // ログ出力: 開発者向けの詳細情報
      console.error('*** TanStack Query Fetch Error ***');
      console.error('Query Key:', query.queryKey);
      console.error('Error:', error);
      // 💡 サーバー側ApiErrorの場合（useApiQueryでSnackbar表示済み）
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
      // ログ出力: 開発者向けの詳細情報
      console.error('*** TanStack Mutation Update Error ***');
      console.error('Mutation Key:', mutation.options.mutationKey || 'N/A'); // MutationKeyがあれば表示
      console.error('Error:', error);

      // ユーザー向けSnackbar表示: 共通メッセージ
      showGlobalSnackbar(AlertType.ERROR, MUTATE_FAILURE_MESSAGE);
    },
  }),
});
