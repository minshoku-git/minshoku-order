import { NextRequest, NextResponse } from 'next/server';

import { getSignUpInitData } from '@/app/(public)/signup/[id]/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getSignUpInitData(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
