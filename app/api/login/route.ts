import { NextRequest, NextResponse } from 'next/server';

import { login } from '@/app/(public)/login/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await login(body);
  return NextResponse.json(result);
}
