'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { RadioButtonGroup, useForm } from 'react-hook-form-mui';
import { TextFieldElement } from 'react-hook-form-mui';

import { decrypt, encrypt } from '@/app/_lib/encryption/crypto';
import { AlertType, PaymentType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { InputItem } from '@/app/_ui/components/molecules/InputItem';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';

import { getAuthFetcher } from './_lib/fetcher';
import {
  GetAuthResponse,
  PasswordResetFormValues,
  PasswordResetSchema,
} from './_lib/types';

/**
 * テストページ！所謂自由帳！！
 * @returns {JSX.Element} JSX
 */
export const TestPageComponent = (): JSX.Element => {
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
  const { control, handleSubmit, getValues, setValue } = useForm<PasswordResetFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      angou: '{"t_companies_id":12345678}',
      hukugou: 'baee3c5a4a9f18c60f6e4da5e12f5abde13eed6729c4d1e1a5a031abd8506fee',
      angou0: '',
      hukugou0: '',
      payment_type: '0',
      password: '',
    },
  });


  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const getAuthFetch = async () => {
    const req: ApiRequest<null> = { request: null };
    return getAuthFetcher(req);
  };

  const { data, refetch } = useApiQuery<GetAuthResponse>({
    queryKey: [QUERY_KEYS.TEST_RESULT],
    queryFn: getAuthFetch,
    refetchOnWindowFocus: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  /** 初期表示情報取得 */
  useEffect(() => {
    if (!data) {
      return;
    }
    openSnackbar(AlertType.INFO, '取れたんやが！！！:' + data.email + "," + data.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* functions - パスワード更新
  ------------------------------------------------------------------ */
  // const updatePasswordHandler: SubmitHandler<PasswordResetFormValues> = async (data) => {
  //   updatePasswordMutate.mutate(data);
  // };

  // const updatePasswordMutate = useMutation({
  //   mutationFn: async (data: PasswordResetFormValues) => {
  //     openProcessing();
  //     const req: ApiRequest<PasswordResetRequest> = { request: { ...data, email: email } };
  //     return updatePasswordFetcher(req) as unknown as ApiResponse<null>;
  //   },
  //   onSuccess: (res) => {
  //     if (res.success) {
  //       setIsSend(true);
  //     } else {
  //       openSnackbar(AlertType.ERROR, res.error.message);
  //     }
  //   },
  //   onError: (e) => {
  //     console.log(e.message);
  //     openSnackbar(AlertType.ERROR, 'パスワード更新に失敗しました。再度お試しください。');
  //   },
  //   onSettled: () => {
  //     closeProcessing();
  //   },
  // });

  /* functions - 暗号化
  ------------------------------------------------------------------ */
  const getDecryptAndEncrypt = () => {
    const res1 = encrypt(getValues('angou') ?? '')
    const res2 = decrypt(getValues('hukugou') ?? '')
    setValue('angou0', res1)
    setValue('hukugou0', res2)
  };

  const [showPassword, setShowPassword] = useState(false);

  /* functions - ログアウト
  ------------------------------------------------------------------ */
  const logoutHandler = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });
    const res = await response.json() as ApiResponse<null>;
    if (res.success) {
      refetch()
      openSnackbar(AlertType.INFO, 'ログアウトしました！')
    } else {
      openSnackbar(AlertType.ERROR, res.error.message)
    }
  };


  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          パスワードの更新
        </Typography>
      </Box>
      {/* 暗号化と復号化 */}
      <Typography variant="h6">暗号化と復号化</Typography>
      <Box sx={{ mt: 2 }}>
        {/* 暗号化 */}
        <InputItem
          control={control}
          label={`暗号化`}
          name="angou"
          required={true}
        />
        <InputItem
          control={control}
          label={`変換後`}
          name="angou0"
          required={true}
        />
        {/* 復号化 */}
        <InputItem
          control={control}
          label={`復号化`}
          name="hukugou"
          required={true}
        />
        <InputItem
          control={control}
          label={`変換後`}
          name="hukugou0"
          required={true}
        />
        {/* 送信ボタン */}
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <Btn label={'送信'} eventhandler={() => getDecryptAndEncrypt()} />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <Btn label={'ログアウト'} eventhandler={() => logoutHandler()} />
        </Box>
      </Box>
      <form >
        <RadioButtonGroup
          control={control}
          label="payment_type"
          name='payment_type'
          options={[
            {
              id: PaymentType.SALAEY_DEDUCTIONS.toString(),
              label: (
                <>
                  <Typography fontWeight="bold">
                    給与天引き（毎月の給与から天引き）
                  </Typography>
                </>
              ),
            },
            {
              id: '1',
              label: (
                <Typography fontWeight="bold">
                  PayPayオンライン決済
                </Typography>
              ),
            },
            {
              id: '2',
              label: (
                <Typography fontWeight="bold">
                  クレジットカード決済
                </Typography>
              ),
            },
          ]} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            ★目隠しオンオフなパスワード入力欄
          </Typography>
          <TextFieldElement
            name="password"
            label="パスワード"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            control={control}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>
      </form>
    </>
  );
};
