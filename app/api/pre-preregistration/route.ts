import { NextRequest, NextResponse } from 'next/server';

import { preregister } from '@/app/(public)/pre-registration/[token]/_lib/function';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const result = await preregister(body);
  return NextResponse.json(result);
}
