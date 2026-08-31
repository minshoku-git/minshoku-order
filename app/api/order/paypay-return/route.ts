import { NextRequest, NextResponse } from 'next/server';

import { completePaypayOrder } from '@/app/(private)/order/_lib/function';

/**
 * PayPay/GMOからの決済結果コールバック(RetURL)受信エンドポイント。
 * ExecTranPaypay実行時に RetURL として指定したURL。
 *
 * 通常のAPIルート(validateRequest → JSON)とは異なる。GMOがユーザーのブラウザ経由で
 * 通知してくる(fetcher()経由の呼び出しではない)ため、ここではJSONを返さず
 * 結果画面(/order/paypay-result)へリダイレクトする。
 *
 * GMOテスト環境での実疎通確認の結果、POSTではなくGETでコールバックされることを確認したため、
 * GET/POST両方に対応する(仕様変更の可能性もあるため両対応のままにしておく)。
 *
 * TODO(GMO doc要確認): OrderIDに相当するキーの候補をいくつか試している。
 */
async function handlePaypayReturn(req: NextRequest): Promise<NextResponse> {
  let orderId = '';

  try {
    if (req.method === 'GET') {
      const params = req.nextUrl.searchParams;
      // TODO(調査用ログ): 実際に届くパラメータ名を特定でき次第、このconsole.logは削除する
      console.log('[paypay-return] GET query:', req.nextUrl.search);
      orderId = params.get('OrderID') ?? params.get('OrderId') ?? params.get('orderId') ?? '';
    } else {
      const formData = await req.formData();
      // TODO(調査用ログ): 実際に届くパラメータ名を特定でき次第、このconsole.logは削除する
      console.log('[paypay-return] POST form:', JSON.stringify(Object.fromEntries(formData.entries())));
      orderId = String(formData.get('OrderID') ?? formData.get('OrderId') ?? formData.get('orderId') ?? '');
    }
  } catch (e) {
    console.error('[paypay-return] パラメータの解析に失敗しました:', e);
  }

  const result = await completePaypayOrder(orderId);
  const status = result.success && result.data.succeeded ? 'success' : 'failed';

  const url = new URL('/order/paypay-result', req.nextUrl.origin);
  url.searchParams.set('status', status);

  // POST→GETへの遷移のため303 See Otherでリダイレクトする
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  return handlePaypayReturn(req);
}

export async function POST(req: NextRequest) {
  return handlePaypayReturn(req);
}
