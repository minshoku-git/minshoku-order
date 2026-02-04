import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { resetPassword } from '@/app/(public)/reset-password/_lib/function';
import { PasswordResetApiSchema } from '@/app/(public)/reset-password/_lib/types';

export async function POST(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, PasswordResetApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await resetPassword(validationResult.data);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
