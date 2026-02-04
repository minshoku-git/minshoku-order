import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { sendPasswordResetMail } from '@/app/(public)/forgot-password/_lib/function';
import { PasswordApiSchema } from '@/app/(public)/forgot-password/_lib/types';

export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, PasswordApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await sendPasswordResetMail(validationResult.data);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
