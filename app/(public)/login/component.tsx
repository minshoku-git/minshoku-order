'use client';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';

import { LoginForm } from './_lib/loginForm';

/**
 * ログインComponent
 * @returns {JSX.Element} JSX
 */
export const UserLogin = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();

  /* JSX
  ------------------------------------------------------------------ */
  return <LoginForm router={router} />;
};
