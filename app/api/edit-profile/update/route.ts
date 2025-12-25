import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { updateProfile } from '@/app/(private)/edit-profile/_lib/function';
import { UserProfileApiSchema } from '@/app/(private)/edit-profile/_lib/types';

export async function PUT(req: NextRequest) {
  // --- 1. リクエスト検証 ---
  const validationResult = await validateRequest(req, UserProfileApiSchema);

  if (!validationResult.success) {
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  // --- 2. データ取得・加工 ---
  const result = await updateProfile(validationResult.data);

  // --- 3. レスポンス返却 ---
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
