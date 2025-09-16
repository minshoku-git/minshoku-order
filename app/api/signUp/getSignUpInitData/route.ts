import { NextRequest, NextResponse } from 'next/server';

import { getSignUpInitData } from '@/app/(public)/signup/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getSignUpInitData(body);
  return NextResponse.json(result);
}
