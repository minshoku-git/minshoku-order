import { NextRequest, NextResponse } from 'next/server';

import { updateProfile } from '@/app/(private)/edit-profile/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await updateProfile(body);
  return NextResponse.json(result);
}
