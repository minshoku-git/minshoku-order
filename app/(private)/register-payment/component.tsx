'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { PaymentType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest, ApiResponse, CreditCardData } from '@/app/_types/types';
import { PaymentForm } from '@/app/_ui/components/organisms/paymentForm';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';

import { getRegisterPaymentTypeInitDataFetcher, registerPaymentTypeFetcher } from './_lib/fetcher';
import { RegisterPaymentInitData, UserPaymentFormValues, UserPaymentSchema } from './_lib/types';

/**
 * 支払方法登録Component
 * @returns {JSX.Element} JSX
 */
export const PaymentComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [creditCardOptions, setCreditCardOptions] = useState<CreditCardData[] | undefined>();

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<UserPaymentFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserPaymentSchema),
    defaultValues: {
      paymentType: PaymentType.SALAEY_DEDUCTIONS,
      creditcard: '',
    },
  });
  const paymentMethod = watch('paymentType');

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const RegisterPaymentInitDataFetch = async () => {
    const req: ApiRequest<null> = { request: null };
    return getRegisterPaymentTypeInitDataFetcher(req);
  };

  const { data, isLoading } = useApiQuery<RegisterPaymentInitData>({
    queryKey: [QUERY_KEYS.REGISTER_PAYMENT_INIT_RESULT],
    queryFn: RegisterPaymentInitDataFetch,
  });

  /* functions - send
  ------------------------------------------------------------------ */
  const registerHandler: SubmitHandler<UserPaymentFormValues> = async (data) => {
    registerMutate.mutate(data);
  };

  const registerMutate = useApiMutation({
    mutationFn: async (data: UserPaymentFormValues) => {
      openProcessing();
      const req: ApiRequest<UserPaymentFormValues> = { request: data };
      return registerPaymentTypeFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      sessionStorage.setItem('snackbar', '支払い方法登録の登録が完了しました。');
      router.replace('/order');
    },
    onSettled: () => {
      closeProcessing();
    },
  });


  /* useEffect 初期表示情報取得
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!data) {
      return;
    } else {
      setCreditCardOptions(data.creditCardDatas);
      reset({
        paymentType: data.currentPaymentType as PaymentType ?? PaymentType.SALAEY_DEDUCTIONS,
        creditcard: data.currentCardDataId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  /* JSX
  ------------------------------------------------------------------ */

  return (
    <>
      {/* 上部リンク */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          支払い方法／新規会員登録
        </Typography>
      </Box>
      <Typography variant="body1">支払い方法をご選択ください。</Typography>
      {!isLoading && data && <>
        <PaymentForm
          handleSubmit={handleSubmit}
          submitHandler={registerHandler}
          control={control}
          paymentMethod={paymentMethod}
          cards={creditCardOptions}
          isRegister={true}
          deduction_flag={data.deduction_flag}
          credit_flag={data.credit_flag}
          paypay_flag={data.paypay_flag}
        />
      </>}
    </>
  );
};
