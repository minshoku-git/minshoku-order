'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { InputItem } from '@/app/_ui/components/molecules/InputItem';
import { InputItemPassword } from '@/app/_ui/components/molecules/InputItemPassword';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';

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
  const queryClient = useQueryClient();
  const { openProcessing, closeProcessing } = useProcessing();

  const [showPassword, setShowPassword] = useState(false);

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

  const loginMutate = useApiMutation({
    mutationFn: async (data: UserLoginFormValues) => {
      openProcessing();
      const req: ApiRequest<UserLoginFormValues> = { request: data };
      return userlogin(req) as unknown as ApiResponse<null>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH_STATUS] });
      router.push('/order');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions 
  ------------------------------------------------------------------ */
  const movePasswordPage = () => {
    router.push('/forgot-password');
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
          <InputItemPassword
            name="password"
            label="パスワード"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            control={control}
          />
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
