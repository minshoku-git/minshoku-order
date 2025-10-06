'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { PaymentType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest } from '@/app/_types/types';
import { PaymentForm } from '@/app/_ui/components/organisms/paymentForm';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';

import { getEditPaymentTypeInitDataFetcher, updatePaymentTypeFetcher } from './_lib/fetcher';
import { CreditCardData, EditPaymentFormValues, EditPaymentInitData, EditPaymentSchema } from './_lib/types';

/**
 * 支払い方法の更新Component
 * @returns {JSX.Element} JSX
 */
export const EditPaymentComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
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
    formState: { isDirty },
  } = useForm<EditPaymentFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(EditPaymentSchema),
    defaultValues: {
      paymentType: PaymentType.SALAEY_DEDUCTIONS,
      creditcard: '',
    },
  });
  const paymentMethod = watch('paymentType');
  console.log(paymentMethod)

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const EditPaymentInitDataFetch = async () => {
    const req: ApiRequest<null> = { request: null };
    return getEditPaymentTypeInitDataFetcher(req);
  };

  const { data, isLoading } = useApiQuery<EditPaymentInitData>({
    queryKey: [QUERY_KEYS.EDIT_PAYMENT_INIT_RESULT],
    queryFn: EditPaymentInitDataFetch,
  });

  /* useEffect 初期表示情報取得
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!data) {
      return;
    }
    else {
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

  /* functions - 支払い方法の更新
  ------------------------------------------------------------------ */
  const updateHandler: SubmitHandler<EditPaymentFormValues> = async (data) => {
    updateMutate.mutate(data);
  };

  const updateMutate = useApiMutation({
    mutationFn: async (data: EditPaymentFormValues) => {
      openProcessing();
      const req: ApiRequest<EditPaymentFormValues> = { request: data };
      return updatePaymentTypeFetcher(req);
    },
    onSuccess: () => {
      sessionStorage.setItem('snackbar', '支払い方法登録の更新が完了しました。');
      router.replace('/order');
    },
    onSettled: () => {
      closeProcessing();
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (errors: any) => {
    console.error('バリデーションエラー:', errors);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* 上部リンク */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          支払い方法の変更
        </Typography>
      </Box>
      <Typography variant="body1">支払い方法をご選択ください。</Typography>
      {!isLoading && data && <>
        <PaymentForm
          handleSubmit={handleSubmit}
          onError={onError}
          submitHandler={updateHandler}
          control={control}
          paymentMethod={paymentMethod}
          cards={creditCardOptions}
          isRegister={false}
          deduction_flag={data.deduction_flag}
          credit_flag={data.credit_flag}
          paypay_flag={data.paypay_flag}
        />
      </>}
    </>
  );
};
