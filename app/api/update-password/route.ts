import { NextRequest, NextResponse } from 'next/server';

import { updatePassword } from '@/app/(public)/update-password/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await updatePassword(body);
  return NextResponse.json(result);
}
