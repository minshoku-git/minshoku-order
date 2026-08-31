import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { insertOrder } from '@/app/(private)/order/_lib/function';
import { OrderApiSchema } from '@/app/(private)/order/_lib/types';

export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, OrderApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  // PayPayのRetURL(決済結果コールバック)を、環境固定のURLではなく現在アクセス中のオリジンから組み立てるため渡す
  // (本番/Preview/ローカルいずれでも自分自身に戻ってくるようにする)
  const result = await insertOrder(validationResult.data, req.nextUrl.origin);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
