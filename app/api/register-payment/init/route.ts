import { NextRequest, NextResponse } from 'next/server';

import { getEditPaymentTypeInitData } from '@/app/(private)/register-payment/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getEditPaymentTypeInitData(body);
  return NextResponse.json(result);
}
