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
 * GMOテスト環境での実疎通確認の結果:
 * - POSTではなくGETでコールバックされる
 * - コールバックにクエリパラメータは一切付与されない(OrderID等も無い)
 * ため、`insertOrder` で RetURL を組み立てる際に自前で `orderId` クエリパラメータを
 * 埋め込んでおき、それを頼りに注文を特定する(GMO側のパラメータには依存しない)。
 */
async function handlePaypayReturn(req: NextRequest): Promise<NextResponse> {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? '';

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
