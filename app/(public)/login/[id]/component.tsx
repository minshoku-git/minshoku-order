'use client';
import { Box, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { JSX } from 'react';

import { Btn } from '@/app/_ui/_parts/Btn';

import { LoginForm } from '../_lib/loginForm';

/**
 * ログインComponent
 * @returns {JSX.Element} JSX
 */
export const UserLoginComp = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const token = useParams().id?.toString() ?? '';

  /* functions 
  ------------------------------------------------------------------ */
  const moveSignUpPage = () => {
    router.push(`/kakunin/${token}`);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ pb: 8 }}>
        {/* 上部リンク */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            初めての方はこちら
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <Btn label={'新規登録'} eventhandler={() => moveSignUpPage()} />
        </Box>
      </Box>
      <LoginForm router={router} />
    </>
  );
};
