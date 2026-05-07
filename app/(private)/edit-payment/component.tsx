'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { PaymentType } from '@/app/_types/enum';
import { ApiRequest } from '@/app/_types/types';
import { PaymentForm } from '@/app/_ui/components/organisms/paymentForm';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';

import { getEditPaymentTypeInitDataFetcher, updatePaymentTypeFetcher } from './_lib/fetcher';
import { CreditCardData, EditPaymentFormValues, EditPaymentInitData, EditPaymentSchema } from './_lib/types';

// window オブジェクトの型拡張（TypeScriptエラー回避）
declare global {
  interface Window {
    Multipayment: any;
  }
}

const EditPaymentInitDataFetch = async () => {
  const req: ApiRequest<null> = { request: null };
  return getEditPaymentTypeInitDataFetcher(req);
};

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
    formState: { errors },
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

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  // 2. queryFn に外で定義した関数を渡す
  const { data, isLoading } = useApiQuery<EditPaymentInitData>({
    queryKey: [QUERY_KEYS.EDIT_PAYMENT_INIT_RESULT],
    queryFn: EditPaymentInitDataFetch,
  });

  /* useEffect 初期表示情報取得
  ------------------------------------------------------------------ */
  useEffect(() => {
    // data が存在しない、または初期化済みの場合は実行しないガードを入れるとより安全です
    if (!data) return;

    setCreditCardOptions(data.creditCardDatas);
    reset({
      paymentType: data.currentPaymentType ?? PaymentType.SALAEY_DEDUCTIONS,
      creditcard: data.currentCardDataId ?? '', 
    });
    // reset は stable なので依存配列に入れてもループしませんが、data の安定化が鍵です
  }, [data, reset]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
  }, [isLoading, openProcessing, closeProcessing]);

  /* functions - 支払い方法の更新処理
  ------------------------------------------------------------------ */
  const updateHandler: SubmitHandler<EditPaymentFormValues> = async (formData) => {
    // 新規カード入力（'new'）が選択されているか判定
    const isNewCreditCard = 
      formData.paymentType === PaymentType.CREDITCARD && 
      formData.creditcard === 'new';

      if (isNewCreditCard) {
        openProcessing();

        window.Multipayment.init(process.env.NEXT_PUBLIC_GMO_SHOP_ID || 'tshop00076633');

        const cardNo = (document.getElementById('cardNo') as HTMLInputElement)?.value;
        const mm = (document.getElementById('expireMonth') as HTMLInputElement)?.value;
        const yy = (document.getElementById('expireYear') as HTMLInputElement)?.value;
        const securityCode = (document.getElementById('securityCode') as HTMLInputElement)?.value;

        // ★ 修正1: 有効期限を YYYYMM (6桁) に整形する
        const formattedExpire = `20${yy}${mm}`;

        window.Multipayment.getToken({
          cardno: cardNo.replace(/\s|-/g, ''),
          expire: formattedExpire, // 4桁ではなく6桁
          securitycode: securityCode,
          tokennumber: '1',         // ★ 修正2: 発行数を明示的に指定
      }, (response: any) => {
        // ブラウザのコンソールで結果を必ず確認
        console.log('GMO SDK Response:', response);

        // resultCode が '000' でない限り、絶対にサーバーに送らない
        if (response.resultCode === '000') {
          const token = response.tokenObject.token[0];
          
          // ここで token が '1' などの異常値でないか最終チェック
          if (token === '1') {
            closeProcessing();
            alert("トークンの生成に失敗しました。カード情報を確認してください。");
            return;
          }

          updateMutate.mutate({
            ...formData,
            token: token,
          });
        } else {
          closeProcessing();
          // エラーコードを表示（E01240002 など）
          alert(`カード認証エラー (Code: ${response.resultCode})`);
        }
      });
    } else {
      updateMutate.mutate(formData);
  }
  };

  /* Mutation - サーバーサイド更新API呼び出し
  ------------------------------------------------------------------ */
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

  const onError = (errors: any) => {
    console.error('バリデーションエラーの詳細:', JSON.stringify(errors, null, 2));
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* GMO-PG トークン取得 SDK (テスト環境用) */}
      <Script 
        src="https://stg.static.mul-pay.jp/ext/js/token.js" 
        strategy="beforeInteractive" 
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          支払い方法の変更
        </Typography>
      </Box>

      <Typography variant="body1">支払い方法をご選択ください。</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        ※予約済みの注文は、変更前の支払い方法で決済されます。
      </Typography>

      {!isLoading && data && (
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
          error={errors.paymentType as any}
        />
      )}
    </>
  );
};