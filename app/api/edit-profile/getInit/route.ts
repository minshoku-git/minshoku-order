import { NextRequest, NextResponse } from 'next/server';

import { getUserProfileInitData } from '@/app/(private)/edit-profile/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getUserProfileInitData(body);
  return NextResponse.json(result);
}
