import { NextRequest, NextResponse } from 'next/server';

import { validateRequest } from '@/app/_lib/validation';
import { preregister } from '@/app/(public)/pre-registration/[token]/_lib/function';
import { NextPageInitApiSchema } from '@/app/(public)/pre-registration/[token]/_lib/types';

export async function PUT(req: NextRequest) {
  console.log('[DEBUG] API Route /api/pre-registration started');
  
  const validationResult = await validateRequest(req, NextPageInitApiSchema);
  if (!validationResult.success) {
    console.error('[DEBUG] Validation Failed:', validationResult.error);
    return NextResponse.json(validationResult.error, { status: validationResult.error.status });
  }

  console.log('[DEBUG] Validation Success. Calling preregister...');
  const result = await preregister(validationResult.data);

  if (!result.success) {
    console.error('[DEBUG] preregister function failed:', result.error);
    return NextResponse.json(result.error, { status: result.error.status });
  }

  console.log('[DEBUG] API Route finished successfully');
  return NextResponse.json(result);
}