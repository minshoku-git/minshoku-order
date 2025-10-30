import { NextRequest, NextResponse } from 'next/server';

import { updateProfile } from '@/app/(private)/edit-profile/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await updateProfile(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
