/**
 * 共通のエラーコード定義
 */
export const FETCH_FAILURE_MESSAGE =
  'データの取得に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
export const MUTATE_FAILURE_MESSAGE =
  'データの更新に失敗しました。ネットワーク接続を確認するか、しばらくしてから再度お試しください。';
export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'E1001', message: '入力値不正', status: 400 },
  PASSWORD_CONFIRMATION_MISMATCH: {
    code: 'E1002',
    message: '新しいパスワードと確認用パスワードが一致しません。',
    status: 400,
  },
  AUTH_CODE_EXPIRED: {
    code: 'E1003',
    message: '認証コードの有効期限が切れています。',
    status: 400,
  },
  ORDER_EXPIRED: {
    code: 'E1004',
    message: '注文期限を超過しています。再度確認してください。',
    status: 400,
  },
  UNAUTHORIZED: { code: 'E1005', message: '認証が必要です', status: 401 },
  LOGGED_OUT: {
    code: 'E1006',
    message: 'セッションが存在しません。再度ログインしてください。',
    status: 401,
  },
  CURRENT_PASSWORD_INCORRECT: {
    code: 'E1007',
    message: '現在のパスワードが正しくありません。',
    status: 401,
  },
  ACCOUNT_SUSPENDED: {
    code: 'E1008',
    message: 'このアカウントは現在利用停止状態です。管理者までお問い合わせください。',
    status: 403,
  },
  COMPANY_SUSPENDED: {
    code: 'E1009',
    message: 'この会社アカウントは現在利用停止状態です。管理者までお問い合わせください。',
    status: 403,
  },
  NOT_FOUND: {
    code: 'E1010',
    message: 'に失敗しました。再度お試しください。',
    status: 404,
  },
  EMAIL_NOT_REGISTERED: {
    code: 'E1011',
    message: '入力されたメールアドレスは登録されていません。',
    status: 404,
  },
  EMAIL_ALREADY_REGISTERED: {
    code: 'E1012',
    message: 'このメールアドレスは既に登録されています。',
    status: 409,
  },
  ORDER_ALREADY_PLACED: {
    code: 'E1013',
    message: 'この注文は既に完了しています。再度確認してください。',
    status: 409,
  },
  CONFLICT: {
    code: 'E1014',
    message: '他の処理と競合しました。画面を更新して再度実行してください。',
    status: 409,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'E1015',
    message: '予期しないエラーが発生しました。',
    status: 500,
  },
  EMAIL_SEND_FAILED: {
    code: 'E1016',
    message: 'メールの送信に失敗しました。時間をおいて再度お試しください。',
    status: 500,
  },
  LOGOUT_FAILED: {
    code: 'E1017',
    message: 'ログアウトに失敗しました。再度お試しください。',
    status: 500,
  },
  INVALID_RECOVERY_LINK: {
    code: 'E1018',
    message: '無効なリンクです。リンクの有効期限が切れているか、形式が正しくありません。',
    status: 400,
  },
  PASSWORD_SAME_AS_OLD: {
    code: 'E1019',
    message: '新しいパスワードは以前のパスワードと異なるものを設定してください。',
    status: 400,
  },
} as const;
