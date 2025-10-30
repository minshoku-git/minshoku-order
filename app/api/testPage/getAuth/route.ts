import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/app/(test)/testPage/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getAuth(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
