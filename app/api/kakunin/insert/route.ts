import { NextRequest, NextResponse } from 'next/server';

import { insertUserProfile } from '@/app/(public)/kakunin/[id]/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await insertUserProfile(body);
  return NextResponse.json(result);
}
