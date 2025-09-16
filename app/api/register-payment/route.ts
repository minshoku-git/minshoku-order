import { NextRequest, NextResponse } from 'next/server';

import { registerPaymentType } from '@/app/(public)/register-payment/_lib/function';
import { sendPasswordResetMail } from '@/app/(public)/reset-password/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await registerPaymentType(body);
  return NextResponse.json(result);
}
