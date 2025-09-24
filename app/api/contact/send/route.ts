import { NextRequest, NextResponse } from 'next/server';

import { sendContactMail } from '@/app/(private)/contact/_lib/function';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await sendContactMail(body);
  return NextResponse.json(result);
}
