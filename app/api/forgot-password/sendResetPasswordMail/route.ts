import { NextRequest, NextResponse } from 'next/server';

import { sendPasswordResetMail } from '@/app/(public)/forgot-password/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await sendPasswordResetMail(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
