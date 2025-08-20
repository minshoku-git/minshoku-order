import { NextRequest, NextResponse } from 'next/server';

import { sendPasswordResetMail } from '@/app/(public)/resetPassword/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await sendPasswordResetMail(body);
  return NextResponse.json(result);
}
