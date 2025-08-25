import { NextRequest, NextResponse } from 'next/server';

import { getSingUpInitData } from '@/app/(public)/signUp/[id]/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getSingUpInitData(body);
  return NextResponse.json(result);
}
