'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { InputItem } from '@/app/_ui/components/molecules/InputItem';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';

import { sendPasswordResetMail } from './_lib/fetcher';
import { PasswordFormValues, PasswordSchema } from './_lib/types';

/**
 * 会社一覧Component
 * @returns {JSX.Element} JSX
 */
export const PaymentComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  const [isSend, setIsSend] = useState<boolean>(false);

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PasswordFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(PasswordSchema),
    defaultValues: { email: '' },
  });

  const moveLoginPage = () => {
    router.back();
  };

  /* functions - send
  ------------------------------------------------------------------ */
  const sendHandler: SubmitHandler<PasswordFormValues> = async (data) => {
    sendMutate.mutate(data);
  };

  const sendMutate = useApiMutation({
    mutationFn: async (data: PasswordFormValues) => {
      openProcessing();
      const req: ApiRequest<PasswordFormValues> = { request: data };
      return sendPasswordResetMail(req) as unknown as ApiResponse<null>;
    },
    onSuccess: () => {
      setIsSend(true);
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          パスワードをお忘れの場合
        </Typography>
      </Box>
      {!isSend && (
        <>
          <Typography variant="body1">
            ご登録のメールアドレスをご入力ください。
            <br />
            新しいパスワードを設定するためのリンクを、メールでお送りします。
            <br />
            ※ご入力いただいたメールアドレスが、登録情報と一致しない場合は、メールは送信されませんのでご注意ください。
          </Typography>
          {/* 登録メールアドレス */}
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit(sendHandler)}>
              <InputItem control={control} label="登録メールアドレス" name="email" required={true} type="email" />
              {/* 送信ボタン */}
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <Btn label={'送信'} isSubmit={true} isDisabled={!isDirty} />
              </Box>
            </form>
          </Box>
        </>
      )}
      {isSend && (
        <>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              パスワード再設定ページのメールを送信しました。
              <br />
              内容をご確認の上、ログインしてください。
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
              <Btn label={'ログイン画面'} eventhandler={() => moveLoginPage()} />
            </Box>
          </Box>
        </>
      )}
    </>
  );
};
