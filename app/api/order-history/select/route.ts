import { NextRequest, NextResponse } from 'next/server';

import { getOrderHistory } from '@/app/(private)/order-history/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getOrderHistory(body);
  return NextResponse.json(result);
}
