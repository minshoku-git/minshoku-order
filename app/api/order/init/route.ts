import { NextRequest, NextResponse } from 'next/server';

import { getOrderInit } from '@/app/(private)/order/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getOrderInit(body);
  return NextResponse.json(result);
}
