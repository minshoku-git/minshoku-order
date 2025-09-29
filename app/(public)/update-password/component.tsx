'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { InputItem } from '@/app/_ui/_parts/Inputitem';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';
import { useApiMutation } from '@/app/_ui/tanstackQuery/useApiMutation';

import { updatePasswordFetcher } from './_lib/fetcher';
import {
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

  console.log('searchParams', searchParams)

  const [isSend, setIsSend] = useState<boolean>(false);

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

  /* functions - パスワード更新
  ------------------------------------------------------------------ */
  const updatePasswordHandler: SubmitHandler<PasswordResetFormValues> = async (data) => {
    updatePasswordMutate.mutate(data);
  };

  const updatePasswordMutate = useApiMutation({
    mutationFn: async (data: PasswordResetFormValues) => {
      openProcessing();
      const req: ApiRequest<PasswordResetRequest> = { request: { ...data, token: token } };
      return updatePasswordFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: () => {
      setIsSend(true);
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
                <InputItem
                  control={control}
                  label={`新しいパスワード`}
                  annotation="(8文字以上、半角英数字の組み合わせ)"
                  name="new_signup_password"
                  required={true}
                  type="password"
                />
                {/* 新しいパスワード(再入力) */}
                <InputItem
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
    </>
  );
};
