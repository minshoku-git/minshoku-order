import { NextRequest, NextResponse } from 'next/server';

import { insertOrder } from '@/app/(private)/order/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await insertOrder(body);
  return NextResponse.json(result);
}
