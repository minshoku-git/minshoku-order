import { NextRequest, NextResponse } from 'next/server';

import { updatePassword } from '@/app/(private)/edit-password/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await updatePassword(body);
  return NextResponse.json(result);
}
