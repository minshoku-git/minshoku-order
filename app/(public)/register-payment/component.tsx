'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddCard } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useMutation as registerPaymentTypeMutate } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { RadioButtonGroup, SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType, PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { registerPaymentTypeFetcher } from './_lib/fetcher';
import { UserPaymentFormValues, UserPaymentSchema } from './_lib/types';

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

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UserPaymentFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserPaymentSchema),
    defaultValues: {
      payment_type: 0,
      creditcard: '',
    },
  });


  /* functions - send
  ------------------------------------------------------------------ */
  const registerHandler: SubmitHandler<UserPaymentFormValues> = async (data) => {
    registerMutate.mutate(data);
  };

  const registerMutate = registerPaymentTypeMutate({
    mutationFn: async (data: UserPaymentFormValues) => {
      openProcessing();
      const req: ApiRequest<UserPaymentFormValues> = { request: data };
      return registerPaymentTypeFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        sessionStorage.setItem('snackbar', '支払い方法登録の登録が完了しました。');
        router.replace('/order');
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '支払い方法登録に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });


  /* useState
  ------------------------------------------------------------------ */
  /* useEffect
  ------------------------------------------------------------------ */
  /* JSX
  ------------------------------------------------------------------ */
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [creditOption, setCreditOption] = useState('');
  const cards = ['************1111', '************2222']

  return (
    <>
      {/* 上部リンク */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          支払い方法／新規会員登録
        </Typography>
      </Box>
      <Typography variant="body1">支払い方法をご選択ください。</Typography>
      <Divider sx={{ mb: 2, mt: 4 }} />
      {/* 給与天引き */}
      <form onSubmit={handleSubmit(registerHandler)}>
        <RadioButtonGroup
          control={control}
          name={'payment_type'}
          options={[
            {
              id: PaymentType.SALAEY_DEDUCTIONS.toString(),
              label: (
                <Typography fontWeight="bold">給与天引き（毎月の給与から天引き）</Typography>
              ),
            },
            {
              id: PaymentType.PAYPAY.toString(),
              label: (
                <Typography fontWeight="bold">PayPayオンライン決済</Typography>
              ),
            },
            {
              id: PaymentType.CREDITCARD.toString(),
              label: (
                <Typography fontWeight="bold">クレジットカード決済</Typography>
              ),
            },
          ]} />

        <RadioGroup name="payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel
            value={PaymentType.SALAEY_DEDUCTIONS}
            control={<Radio />}
            label={<Typography fontWeight="bold">給与天引き（毎月の給与から天引き）</Typography>}
          />
          <Divider sx={{ my: 2 }} />

          {/* クレジットカード決済 */}
          <FormControlLabel
            value={PaymentType.CREDITCARD}
            control={<Radio />}
            label={<Typography fontWeight="bold">クレジットカード決済</Typography>}
          />
          {paymentMethod === 'credit' && (
            <>
              <Box sx={{ pl: 2 }}>
                <RadioGroup name="credit-option" value={creditOption} onChange={(e) => setCreditOption(e.target.value)}>
                  {cards.map((card, i) => (
                    <FormControlLabel
                      key={i}
                      value={`card${i}`}
                      control={<Radio />}
                      sx={{ ml: 1, }}
                      label={<Typography fontWeight="bold">カード番号{card}</Typography>}
                    />
                  ))}
                  <Button
                    startIcon={<AddCard />}
                    sx={{ border: '1px solid #ddd', fontWeight: 'bold', mr: 3, ml: 1, pl: 2, background: '#fff', borderRadius: 1, justifyContent: 'flex-start' }}
                  >
                    新しいクレジットカードを登録する
                  </Button>
                </RadioGroup>
              </Box>
            </>
          )}
          <Divider sx={{ my: 2 }} />
          {/* PayPay */}
          <FormControlLabel
            value={PaymentType.PAYPAY}
            control={<Radio />}
            label={<Typography fontWeight="bold">PayPayオンライン決済</Typography>}
          />
        </RadioGroup>
        {/* 支払い方法を登録ボタン */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <Btn label={'支払い方法を登録'} isSubmit={true} />
        </Box>
      </form>
    </>
  );
};
