'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { Inputitem } from '@/app/_ui/_parts/Inputitem';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { checkToken, updatePasswordFetcher } from './_lib/fetcher';
import {
  CheckTokenRequest,
  CheckTokenResponse,
  PasswordResetFormValues,
  PasswordResetRequest,
  PasswordResetSchema,
} from './_lib/types';

/**
 * パスワード更新Component
 * @returns {JSX.Element} JSX
 */
export const UpdatePasswordComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const type = searchParams.get('type') ?? '';

  const [isSend, setIsSend] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  /* useForm
  ------------------------------------------------------------------ */
  const { control, handleSubmit } = useForm<PasswordResetFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      new_signup_password: '',
      confirm_new_signup_password: '',
    },
  });

  /* useQuery - 初期表示(認証)情報取得
  ------------------------------------------------------------------ */
  const userBasicInitDataFetch = async () => {
    const req: ApiRequest<CheckTokenRequest> = { request: { token: token, type: type } };
    return checkToken(req);
  };

  const { data: result } = useQuery<ApiResponse<CheckTokenResponse>>({
    queryKey: [QUERY_KEYS.TOKEN_CHECK_RESULT],
    queryFn: userBasicInitDataFetch,
    refetchOnWindowFocus: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!result) {
      return;
    }
    if (!result?.success) {
      openSnackbar(AlertType.WARNING, result.error.message);
      router.push('/login');
    } else {
      setEmail(result.data.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  /* functions - パスワード更新
 ------------------------------------------------------------------ */
  const updatePasswordHandler: SubmitHandler<PasswordResetFormValues> = async (data) => {
    updatePasswordMutate.mutate(data);
  };

  const updatePasswordMutate = useMutation({
    mutationFn: async (data: PasswordResetFormValues) => {
      openProcessing();
      const req: ApiRequest<PasswordResetRequest> = { request: { ...data, email: email } };
      return updatePasswordFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        setIsSend(true);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, 'パスワード更新に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions - etc
  ------------------------------------------------------------------ */
  const moveLoginPage = () => {
    router.push('/login');
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {!result && (
        <>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                認証中
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                画面が切り替わるまで少々お待ちください。
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
      {result && result.success && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
              パスワードの更新
            </Typography>
          </Box>
          {/* パスワード更新前 */}
          {!isSend ? (
            <>
              <Typography variant="body1">新しいパスワードを入力してください。</Typography>
              <Box sx={{ mt: 2 }}>
                <form onSubmit={handleSubmit(updatePasswordHandler)}>
                  {/* 8文字以上、英数字の組み合わせ */}
                  <Inputitem
                    control={control}
                    label={`新しいパスワード`}
                    annotation="(8文字以上、半角英数字の組み合わせ)"
                    name="new_signup_password"
                    required={true}
                    type="password"
                  />
                  {/* 新しいパスワード(再入力) */}
                  <Inputitem
                    control={control}
                    label={`新しいパスワード(再入力)`}
                    name="confirm_new_signup_password"
                    required={true}
                    type="password"
                  />
                  {/* 送信ボタン */}
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Btn label={'送信'} isSubmit={true} />
                  </Box>
                </form>
              </Box>
            </>
          ) : (
            <>
              {/* パスワード更新後 */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  パスワードの再設定が完了しました。
                  <br />
                  ログイン画面より新しいパスワードでログインしてください。
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
                  <Btn label={'ログイン画面'} eventhandler={() => moveLoginPage()} />
                </Box>
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
