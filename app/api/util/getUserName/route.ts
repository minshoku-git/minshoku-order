import { NextRequest, NextResponse } from 'next/server';

import { getLoginUser } from '@/app/_lib/getLoginUser/getLoginUser';

export async function POST(_req: NextRequest) {
  const result = await getLoginUser();
  return NextResponse.json(result);
}
