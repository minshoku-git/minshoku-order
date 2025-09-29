import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { AlertType } from '@/app/_types/enum';
import { ApiResponse, ApiSuccess, isApiError } from '@/app/_types/types'; // ApiErrorをインポート

import { showGlobalSnackbar } from '../snackBar/snackbarContext';

// ----------------------------------------------------------------------
// 💡 ApiError (success: false) を自動処理し、onSuccess の引数を成功型に絞り込むカスタムフック
// ----------------------------------------------------------------------

// 成功レスポンスのみを抽出するユーティリティ型
// Tが ApiSuccess<D> の構造を持つ場合、その構造を返します。
type SuccessResponse<T> = T extends { success: true; data: infer D } ? { success: true; data: D } : never;

// useMutationに渡すオプションから onSuccess を除外し、成功型に絞り込んだ onSuccess を再定義
type UseApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiResponse<TData>, unknown, TVariables, unknown>,
  'onSuccess'
> & {
  // onSuccess の引数 data は SuccessResponse<ApiResponse<TData>> に絞り込まれます。
  onSuccess?: (
    data: SuccessResponse<ApiResponse<TData>>, // 成功型のみを強制 (ApiErrorは含まれない)
    variables: TVariables,
    context: unknown
  ) => unknown;
};

/**
 * APIレスポンスのエラー(success: false)を自動的に検知し、Snackbarを表示するカスタムミューテーションフック。
 * ネットワークエラーはグローバルの MutationCache.onError で処理されます。
 */
export const useApiMutation = <TData, TVariables>(options: UseApiMutationOptions<TData, TVariables>) => {
  return useMutation({
    ...options,

    // 既存のonSuccessロジックをラップ
    onSuccess: (data, variables, context) => {
      // 1. サーバー処理エラー(ApiError)のチェック
      if (isApiError(data)) {
        // ログ出力（ApiErrorの詳細ログ）
        console.error('*** TanStack ApiError ***', data.error.code, data.error.message);

        // 共通Snackbarを表示（APIから返された具体的なエラーメッセージを使用）
        showGlobalSnackbar(AlertType.ERROR, data.error.message);

        // サーバー処理エラーが発生した場合、元のonSuccessは実行しない。
        return;
      }

      // 2. サーバー処理が成功した場合 (success: true)
      if (options.onSuccess) {
        // 💡 成功型 (SuccessResponse) としてアサートして元の onSuccess を呼び出す
        // TypeScriptはここで data が ApiSuccess<TData> であることを知っています。
        options.onSuccess(data as SuccessResponse<ApiResponse<TData>>, variables, context);
      }
    },
  });
};
