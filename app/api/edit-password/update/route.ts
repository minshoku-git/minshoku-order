import { NextRequest, NextResponse } from 'next/server';

import { updatePassword } from '@/app/(private)/edit-password/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await updatePassword(body);
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result.error, { status: result.error.status });
}
