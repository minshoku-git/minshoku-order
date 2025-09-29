'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { InputItem } from '@/app/_ui/_parts/Inputitem';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';
import { useApiMutation } from '@/app/_ui/tanstackQuery/useApiMutation';

import { updatePasswordFetcher } from './_lib/fetcher';
import { EditPasswordFormValues, EditPasswordSchema, } from './_lib/types';

/**
 * パスワードの変更Component
 * @returns {JSX.Element} JSX
 */
export const EditPasswordComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter()
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, reset } = useForm<EditPasswordFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: zodResolver(EditPasswordSchema),
    defaultValues: {
      current_password: '',
      new_signup_password: '',
      confirm_new_signup_password: '',
    },
  });

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */
  const updatePasswordHandler: SubmitHandler<EditPasswordFormValues> = async (data) => {
    updatePasswordMutate.mutate(data);
  };

  const updatePasswordMutate = useApiMutation({
    mutationFn: async (data: EditPasswordFormValues) => {
      openProcessing();

      const req: ApiRequest<EditPasswordFormValues> = { request: data };
      return updatePasswordFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: () => {
      openSnackbar(AlertType.SUCCESS, 'パスワードを更新しました。');
      router.push('/order')
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            パスワードの変更
          </Typography>
        </Box>
        {/* <Typography variant='body1'>会員登録に必要な情報をご入力・ご選択ください。</Typography> */}
        <Box sx={{ mt: 2 }}>
          <form onSubmit={handleSubmit(updatePasswordHandler)}>
            {/* 現在のパスワード */}
            <InputItem
              control={control}
              label={`現在のパスワード`}
              name="current_password"
              required={true}
              type="password"
            />
            {/* 新しいパスワード */}
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
      </Box>
    </>
  );
};
