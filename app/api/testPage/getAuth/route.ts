import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/app/(test)/testPage/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getAuth(body);
  return NextResponse.json(result);
}
