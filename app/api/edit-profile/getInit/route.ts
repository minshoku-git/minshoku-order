import { NextRequest, NextResponse } from 'next/server';

import { getUserProfileInitData } from '@/app/(private)/edit-profile/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getUserProfileInitData(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
