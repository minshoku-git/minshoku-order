'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { PaymentType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse, CreditCardData } from '@/app/_types/types';
import { PaymentForm } from '@/app/_ui/components/organisms/paymentForm';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { getRegisterPaymentTypeInitDataFetcher, registerPaymentTypeFetcher } from './_lib/fetcher';
import { RegisterPaymentInitData, UserPaymentFormValues, UserPaymentSchema } from './_lib/types';

// window オブジェクトの型拡張（TypeScriptエラー回避）
declare global {
  interface Window {
    Multipayment: any;
  }
}

/**
 * 支払方法登録Component
 * @returns {JSX.Element} JSX
 */
export const PaymentComponent = (): JSX.Element => {
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
    formState: { errors },
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
  const selectedCardId = watch('creditcard');

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
  const registerHandler: SubmitHandler<UserPaymentFormValues> = async (formData) => {
    // 新規クレジットカード登録が必要なケースか判定
    const isNewCreditCard = formData.paymentType === PaymentType.CREDITCARD && formData.creditcard === 'new';
    if (isNewCreditCard) {
      openProcessing();

      // 1. ショップIDで初期化（環境変数からの取得を推奨）
      const shopId = process.env.NEXT_PUBLIC_GMO_SHOP_ID || 'tshop00076633';
      window.Multipayment.init(shopId);

      // 2. DOMから直接カード情報を取得（前回の PaymentForm で id 指定したフィールド）
      const cardNo = (document.getElementById('cardNo') as HTMLInputElement)?.value;
      const expireMonth = (document.getElementById('expireMonth') as HTMLInputElement)?.value;
      const expireYear = (document.getElementById('expireYear') as HTMLInputElement)?.value;
      const securityCode = (document.getElementById('securityCode') as HTMLInputElement)?.value;

      // 3. トークン取得の実行
      window.Multipayment.getToken({
        cardno: cardNo,
        expire: expireYear + expireMonth, // YYMM形式
        securitycode: securityCode,
        holdername: '',
      }, (response: any) => {
        console.log('GMO-PG Response:', response);
        if (response.resultCode === '000') {
          // トークン取得成功：API送信用データにトークンをセット
          const token = response.tokenObject.token[0];
          registerMutate.mutate({
            ...formData,
            token: token, // ここでサーバーに渡す用のトークンを追加
          });
        } else {
          // トークン取得失敗
          closeProcessing();
          alert('クレジットカード情報が正しくありません。');
        }
      });
    } else {
      // 給与天引きや既存カードの場合はそのまま送信
      registerMutate.mutate(formData);
    }
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
      {/* GMO-PG トークン取得 JS を読み込む */}
      <Script 
        src="https://static.mul-pay.jp/ext/js/token.js" 
        strategy="beforeInteractive" // フォーム表示前に読み込んでおく
      />

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
          onError={(errors) => console.log('Validation Errors:', errors)} 
          control={control}
          paymentMethod={paymentMethod}
          cards={creditCardOptions}
          isRegister={true}
          deduction_flag={data.deduction_flag}
          credit_flag={data.credit_flag}
          paypay_flag={data.paypay_flag}
          error={errors.paymentType}
        />
      </>}
    </>
  );
};
