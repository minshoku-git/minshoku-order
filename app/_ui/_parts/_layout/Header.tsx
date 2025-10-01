'use client';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import { Link } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { memo, useEffect, useState } from 'react';

import { getUserNameFetcher } from '@/app/_lib/getLoginUser/fetcher';
import { LoginUserResponse } from '@/app/_lib/getLoginUser/types';
import { UserRegistrationStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';

import { useApiQuery } from '../../tanstackQuery/useApiQuery';
import HeaderMenu from './HeaderMenu';

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPath = pathname.startsWith('/login/');
  const isProtectedPath = !['/', '/login', '/contact', '/about', '/forgot-password', '/reset-password'].includes(pathname) && !isLoginPath;

  const { data, isLoading, error } = useApiQuery<LoginUserResponse>({
    queryKey: [QUERY_KEYS.USER_NAME_SEARCH_RESULT],
    queryFn: getUserNameFetcher,
    enabled: isProtectedPath,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /** 注文画面遷移 */
  const moveToOrder = () => {
    return router.push('/order');
  };

  return (
    <Box sx={{ zIndex: 10, position: 'relative', mb: 0 }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 'none' }}>
        <Toolbar
          sx={{ maxWidth: 640, margin: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between' }}
        >
          {isLoading && !data ?
            <></>
            : (<>
              {/* 左ロゴ */}
              {data && data.userName ? (
                <Button onClick={() => moveToOrder()}>
                  <Link sx={{ textDecoration: 'none' }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1, color: '#ea5315', fontWeight: 'bold', fontSize: 28, fontFamily: 'Mobo Bold' }}
                    >
                      {data.restaurantName}
                    </Typography>
                  </Link>
                </Button>
              ) : (
                <Image
                  src="/logo.svg"
                  alt="みんなの社食"
                  width="200"
                  height="52"
                  priority={true}
                  fetchPriority={'auto'}
                />
              )}
            </>)
          }
          {data
            && data.userName
            && data.userRegistrationStatus === UserRegistrationStatus.REGISTERED && (
              <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
                <MenuIcon sx={{ color: '#ea5315' }} />
              </IconButton>
            )}
        </Toolbar>
        <HeaderMenu open={open} closeEvent={() => setOpen(false)} router={router} openSnackbar={undefined} username={data?.userName ?? ''} />
      </AppBar>
    </Box>
  );
}