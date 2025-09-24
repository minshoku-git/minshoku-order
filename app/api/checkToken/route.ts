import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/app/_lib/supabase/server';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CheckTokenRequest, CheckTokenResponse } from '@/app/(public)/update-password/_lib/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST(req: NextRequest) {
  const body: ApiRequest<CheckTokenRequest> = await req.json();
  const token_hash = body.request.token;
  const type = body.request.type as EmailOtpType | null;

  if (!token_hash || !type) {
    const res: ApiResponse<null> = {
      success: false,
      error: {
        code: ErrorCodes.INVALID_RECOVERY_LINK.code,
        message: ErrorCodes.INVALID_RECOVERY_LINK.message,
      },
    };
    console.log(ErrorCodes.INVALID_RECOVERY_LINK.message);
    return NextResponse.json(res);
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (error) {
    console.log(error);
    const res: ApiResponse<CheckTokenResponse> = {
      success: false,
      error: {
        code: ErrorCodes.AUTH_CODE_EXPIRED.code,
        message: ErrorCodes.AUTH_CODE_EXPIRED.message,
      },
    };
    return NextResponse.json(res);
  } else {
    const res: ApiResponse<CheckTokenResponse> = {
      success: true,
      data: { email: data.user!.email! },
    };
    return NextResponse.json(res);
  }
}
