import { NextRequest, NextResponse } from 'next/server';

import { completePaypayOrder } from '@/app/(private)/order/_lib/function';

/**
 * PayPay/GMOからの決済結果コールバック(RetURL)受信エンドポイント。
 * ExecTranPaypay実行時に RetURL として指定したURL。
 *
 * 通常のAPIルート(validateRequest → JSON)とは異なる。GMOがユーザーのブラウザ経由で
 * POST通知してくる(fetcher()経由の呼び出しではない)ため、ここではJSONを返さず
 * 結果画面(/order/paypay-result)へリダイレクトする。
 *
 * TODO(GMO doc要確認): 実際に届くパラメータ名は非公開ドキュメントのため未確定。
 * OrderIDに相当するキーの候補をいくつか試している。GMOテスト環境での実疎通で確定させること。
 */
export async function POST(req: NextRequest) {
  let orderId = '';

  try {
    const formData = await req.formData();
    orderId = String(formData.get('OrderID') ?? formData.get('OrderId') ?? formData.get('orderId') ?? '');
  } catch (e) {
    console.error('[paypay-return] フォームデータの解析に失敗しました:', e);
  }

  const result = await completePaypayOrder(orderId);
  const status = result.success && result.data.succeeded ? 'success' : 'failed';

  const url = new URL('/order/paypay-result', process.env.APP_URL_DEV);
  url.searchParams.set('status', status);

  // POST→GETへの遷移のため303 See Otherでリダイレクトする
  return NextResponse.redirect(url, { status: 303 });
}
