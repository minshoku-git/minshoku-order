// errorHandler.ts
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AlertType } from '../_types/enum';
import { useSnackBar } from './snackBar/snackbarContext';

export const createQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
    mutations: {
      onError: (error) => {
        // ここでエラーハンドリング処理を呼び出し
        handleGlobalError(error);
      },
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGlobalError(error: any) {
  // ここではエラーメッセージを送信するだけ
  // 実際にエラーメッセージの処理を行うのはコンポーネント内で行う
  // 必要に応じて別の方法でエラーを伝播する
  console.error('Global Error:', error);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useErrorHandler(error: any) {
  const { openSnackbar } = useSnackBar();

  useEffect(() => {
    if (error) {
      const message = getErrorMessage(error);
      openSnackbar(AlertType.ERROR, message);
    }
  }, [error, openSnackbar]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  return '予期しないエラーが発生しました';
}
