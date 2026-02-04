import { NextRequest, NextResponse } from 'next/server';

import { getEditPaymentTypeInitData } from '@/app/(private)/edit-payment/_lib/function';

export async function POST(_req: NextRequest) {
  // --- 1. リクエスト検証 ---
  // MEMO: リクエストなし

  // --- 2. データ取得・加工 ---
  const result = await getEditPaymentTypeInitData();

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
