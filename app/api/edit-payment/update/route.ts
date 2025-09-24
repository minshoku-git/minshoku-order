import { NextRequest, NextResponse } from 'next/server';

import { updatePaymentType } from '@/app/(private)/edit-payment/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await updatePaymentType(body);
  return NextResponse.json(result);
}
