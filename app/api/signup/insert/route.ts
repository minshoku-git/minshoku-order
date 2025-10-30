import { NextRequest, NextResponse } from 'next/server';

import { insertUserProfile } from '@/app/(public)/signup/[id]/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await insertUserProfile(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
