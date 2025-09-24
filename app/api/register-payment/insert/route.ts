import { NextRequest, NextResponse } from 'next/server';

import { registerPaymentType } from '@/app/(private)/register-payment/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await registerPaymentType(body);
  return NextResponse.json(result);
}
