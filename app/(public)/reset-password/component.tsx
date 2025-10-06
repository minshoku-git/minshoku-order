'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { InputItemPassword } from '@/app/_ui/_parts/InputitemPassword';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useApiMutation } from '@/app/_ui/tanstackQuery/useApiMutation';

import { updatePasswordFetcher } from './_lib/fetcher';
import {
  PasswordResetFormValues,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetSchema,
} from './_lib/types';

/**
 * パスワードリセットComponent
 * @returns {JSX.Element} JSX
 */
export const UpdatePasswordComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openProcessing, closeProcessing } = useProcessing();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  console.log('searchParams', searchParams)

  const [showCompleteMsg, setShowCompleteMsg] = useState<boolean>(false);
  const [showRetryMsg, setShowRetryMsg] = useState<boolean>(false);
  const [retryMsg, setRetryMsg] = useState<string>('');
  const [showNewSignupPassword, setShowNewSignupPassword] = useState(false);
  const [showConfirmNewSignupPassword, setShowConfirmNewSignupPassword] = useState(false);


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
      return updatePasswordFetcher(req) as unknown as ApiResponse<PasswordResetResponse>;
    },
    onSuccess: (res) => {
      if (res.data.result) {
        setShowCompleteMsg(true);
        return
      }
      setShowRetryMsg(true)
      setRetryMsg(res.data.ErrorMessage!)
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  console.log('showRetryMsg', showRetryMsg)

  /* functions - etc
  ------------------------------------------------------------------ */
  const moveLoginPage = () => {
    router.replace('/login');
  };

  const moveForgotPasswordPage = () => {
    router.replace('/forgot-password');
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            パスワードの再設定
          </Typography>
        </Box>
        {/* パスワード更新前 */}
        {!showCompleteMsg && !showRetryMsg && (<>
          <Typography variant="body1">新しいパスワードを入力してください。</Typography>
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit(updatePasswordHandler)}>
              {/* 8文字以上、英数字の組み合わせ */}
              {/* 新しいパスワード */}
              <InputItemPassword
                control={control}
                label="新しいパスワード"
                name="new_signup_password"
                annotation="(8文字以上、半角英数字の組み合わせ)"
                showPassword={showNewSignupPassword}
                setShowPassword={setShowNewSignupPassword}
              />
              {/* 新しいパスワード(再入力) */}
              <InputItemPassword
                control={control}
                label={`新しいパスワード(再入力)`}
                name="confirm_new_signup_password"
                showPassword={showConfirmNewSignupPassword}
                setShowPassword={setShowConfirmNewSignupPassword}
              />
              {/* 送信ボタン */}
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <Btn label={'送信'} isSubmit={true} />
              </Box>
            </form>
          </Box>
        </>)}
        {showCompleteMsg && <>
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
        </>}
        {showRetryMsg && <>
          {/* パスワード更新後 */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">パスワードの更新に失敗しました</Typography>
            <Typography variant="body1" mb={2}>エラー内容：{retryMsg}</Typography>
            <Typography variant="body1">
              処理の途中でエラーが発生したため、セッションは無効になりました。
              <br />再度パスワードを変更するには、お手数ですが「パスワードをお忘れの場合」からメールを再送信し、手続きを最初からやり直してください。
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
              <Btn label={'パスワードをお忘れの場合'} eventhandler={() => moveForgotPasswordPage()} />
            </Box>
          </Box>
        </>}
      </>
    </>
  );
};
