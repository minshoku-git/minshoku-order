'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { JSX } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { InputItem } from '@/app/_ui/_parts/Inputitem';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { userlogin } from './fetcher';
import { UserLoginFormValues, UserLoginSchema } from './types';

type Props = {
  router: AppRouterInstance;
};

/**
 * ログインComponent
 * @returns {JSX.Element} JSX
 */
export const LoginForm = (props: Props): JSX.Element => {
  /* initialize
    ------------------------------------------------------------------ */
  const router = props.router;
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useForm
    ------------------------------------------------------------------ */
  const { control, handleSubmit } = useForm<UserLoginFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserLoginSchema),
    defaultValues: { email: 's.abe@refact.co.jp', password: 'password1' },
  });

  /* functions - send
    ------------------------------------------------------------------ */
  const loginHandler: SubmitHandler<UserLoginFormValues> = async (data) => {
    loginMutate.mutate(data);
  };

  const loginMutate = useMutation({
    mutationFn: async (data: UserLoginFormValues) => {
      openProcessing();
      const req: ApiRequest<UserLoginFormValues> = { request: data };
      return userlogin(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        router.push('/order');
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, 'ログインに失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions 
    ------------------------------------------------------------------ */
  const movePasswordPage = () => {
    router.push('/resetPassword');
  };

  /* JSX
    ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ pb: 8 }}>
        {/* 上部リンク */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            ログインはこちら
          </Typography>
        </Box>
        <form onSubmit={handleSubmit(loginHandler)}>
          {/* メールアドレス */}
          <InputItem control={control} label="メールアドレス" name="email" required={true} type="mail" />
          {/* パスワード */}
          <InputItem control={control} label="パスワード" name="password" required={true} type="password" />
          {/* ログインボタン */}
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
            <Btn label={'ログイン'} isSubmit={true} />
          </Box>
        </form>
        {/* パスワードをお忘れの場合 */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            sx={{ textDecoration: 'underline', color: '#000', fontWeight: 'bold' }}
            onClick={() => movePasswordPage()}
          >
            パスワードをお忘れの場合
          </Button>
        </Box>
      </Box>
    </>
  );
};
