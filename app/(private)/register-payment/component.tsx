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
  const isNewCreditCard = formData.paymentType === PaymentType.CREDITCARD && formData.creditcard === 'new';

  if (isNewCreditCard) {

    if (typeof window === 'undefined' || !window.Multipayment) {
      alert('決済システムの準備ができていません。数秒待ってから再度お試しいただくか、ページを再読み込みしてください。');
      return;
    }
    
    openProcessing();

    // 1. 初期化
    const shopId = process.env.NEXT_PUBLIC_GMO_SHOP_ID || 'tshop00076633';
    window.Multipayment.init(shopId);

    // 2. カード情報取得
    const cardNo = (document.getElementById('cardNo') as HTMLInputElement)?.value;
    const mm = (document.getElementById('expireMonth') as HTMLInputElement)?.value;
    const yy = (document.getElementById('expireYear') as HTMLInputElement)?.value;
    const securityCode = (document.getElementById('securityCode') as HTMLInputElement)?.value;

    // ★ 修正：有効期限を 6桁 (YYYYMM) に整形
    const formattedExpire = `20${yy}${mm}`;

    // 3. トークン取得
    window.Multipayment.getToken({
      cardno: cardNo.replace(/\s|-/g, ''),
      expire: formattedExpire,
      securitycode: securityCode,
      tokennumber: '1', // ★ 明示的に '1' を指定
    }, (response: any) => {
      if (response.resultCode === '000') {
        const token = response.tokenObject.token[0];
        // サーバーサイドへ送信
        registerMutate.mutate({
          ...formData,
          token: token,
        });
      } else {
        closeProcessing();
        alert(`カード認証に失敗しました。内容を確認してください。(Error: ${response.resultCode})`);
      }
    });
  } else {
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

  useEffect(() => {
    if (!data) {
      return;
    } else {
      setCreditCardOptions(data.creditCardDatas);
      reset({
        paymentType: data.currentPaymentType as PaymentType ?? PaymentType.SALAEY_DEDUCTIONS,
        // ★ ここを修正：undefined の場合は空文字をセットして「常に controlled」な状態にする
        creditcard: data.currentCardDataId ?? '', 
      });
    }
  }, [data, reset]);

  /* JSX
  ------------------------------------------------------------------ */
// 読み込み状態を管理する state を追加（任意）
const [isGmoLoaded, setIsGmoLoaded] = useState(false);
  return (
    <>
      {/* GMO-PG トークン取得 JS を読み込む */}
      <Script 
      src="https://stg.static.mul-pay.jp/ext/js/token.js" 
      strategy="afterInteractive" 
      onLoad={() => {
        console.log('GMO SDK Loaded');
        setIsGmoLoaded(true);
      }}
      onError={() => console.error('GMO SDK Load Error')}
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
