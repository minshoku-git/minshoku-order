import { NextRequest, NextResponse } from 'next/server';

import { completeMerpayOrder } from '@/app/(private)/order/_lib/function';

/**
 * メルペイ/GMOからの決済結果コールバック(RetURL)受信エンドポイント。
 * ExecTranMerpay実行時に RetURL として指定したURL。
 *
 * paypay-return/route.tsと対称な実装。PayPayではGMOテスト環境での実疎通確認により
 * コールバックにクエリパラメータが一切付与されないことが判明したため、`insertOrder` で
 * RetURL を組み立てる際に自前で `orderId` クエリパラメータを埋め込む方式にしている。
 * メルペイでも同様にGMO側のパラメータには依存しない設計にしているため、GET/POST
 * いずれで届いても、パラメータの有無に関わらず動作する想定(実疎通は未検証)。
 */
async function handleMerpayReturn(req: NextRequest): Promise<NextResponse> {
  const orderId = req.nextUrl.searchParams.get('orderId') ?? '';

  const result = await completeMerpayOrder(orderId);
  const status = result.success && result.data.succeeded ? 'success' : 'failed';

  const url = new URL('/order/merpay-result', req.nextUrl.origin);
  url.searchParams.set('status', status);

  // POST→GETへの遷移のため303 See Otherでリダイレクトする
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  return handleMerpayReturn(req);
}

export async function POST(req: NextRequest) {
  return handleMerpayReturn(req);
}
