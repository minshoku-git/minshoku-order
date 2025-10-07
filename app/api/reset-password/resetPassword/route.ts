import { NextRequest, NextResponse } from 'next/server';

import { resetPassword } from '@/app/(public)/reset-password/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await resetPassword(body);
  return NextResponse.json(result);
}
