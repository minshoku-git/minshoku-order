'use client';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import { Link } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { getUserNameFetcher } from '@/app/_lib/getLoginUser/fetcher';
import { LoginUserResponse } from '@/app/_lib/getLoginUser/types';
import { PublicPaths } from '@/app/_types/constants';
import { UserRegistrationStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiResponse } from '@/app/_types/types';

import HeaderMenu from './HeaderMenu';

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /** 注文画面遷移 */
  const moveToOrder = () => {
    return router.push('/order');
  };

  /* initialize
  ------------------------------------------------------------------ */
  const pathname = usePathname();

  /* useQuery
  ------------------------------------------------------------------ */
  const { data: result, isError, isLoading } = useQuery<ApiResponse<LoginUserResponse>>({
    queryKey: [QUERY_KEYS.USER_NAME_SEARCH_RESULT],
    queryFn: getUserNameFetcher,
    enabled: true,
    refetchOnWindowFocus: true, // window がフォーカスされたら再取得してくれる
  });

  /* useEffect
  ------------------------------------------------------------------ */
  useEffect(() => {
    const isLoginPath = pathname.startsWith('/login/'); // /login/[id] を識別
    const isProtectedPath = !PublicPaths.some((path) => pathname === path) && !isLoginPath;

    if (!result) {
      return
    }
    if (!result.success || isError) {
      if (!isLoginPath) {
        router.push('/login');
        return;
      }
    } else if (result.success && !result.data.userName && !isProtectedPath) {
      if (isLoginPath) {
        // /login/[id] の場合、そのままリダイレクト（idを保持）
        router.push(pathname);
        return;
      } else {
        router.push('/login');
        return;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);


  return (
    <Box sx={{ zIndex: 10, position: 'relative', mb: 0 }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 'none' }}>
        <Toolbar
          sx={{ maxWidth: 640, margin: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between' }}
        >
          {isLoading ?
            <></>
            : (<>
              {/* 左ロゴ */}
              {result?.success && result.data.userName ? (
                <Button onClick={() => moveToOrder()}>
                  <Link sx={{ textDecoration: 'none' }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1, color: '#ea5315', fontWeight: 'bold', fontSize: 28, fontFamily: 'Mobo Bold' }}
                    >
                      {result.data.restaurantName}
                    </Typography>
                  </Link>
                </Button>
              ) : (
                <Image
                  src="/logo.svg"
                  alt="みんなの社食"
                  width="200"
                  height="52"
                  // Largest Contentful Paint (LCP) 要素として検出された画像だと警告がでるので、以下のように設定した
                  priority={true}
                  fetchPriority={'auto'}
                />
              )}
            </>)
          }
          {result?.success
            && result.data.userName
            && result.data.userRegistrationStatus === UserRegistrationStatus.REGISTERED && (
              <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
                <MenuIcon sx={{ color: '#ea5315' }} />
              </IconButton>
            )}
        </Toolbar>
        <HeaderMenu open={open} closeEvent={() => setOpen(false)} router={router} openSnackbar={undefined} />
      </AppBar>
    </Box>
  );
}
