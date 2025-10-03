'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Fade, IconButton, Link, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { UserRegistrationStatus } from '@/app/_types/enum';

import { useAuth } from '../../contexts/auth/AuthContext';
import HeaderMenu from './HeaderMenu';

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    isAuthenticated,
    restaurantName,
    userRegistrationStatus,
    isLoading: isAuthLoading,
  } = useAuth();

  console.log("isAuthenticated:", isAuthenticated);
  console.log("restaurantName:", restaurantName);
  console.log("isAuthLoading:", isAuthLoading);

  const isLoginPath = pathname.startsWith('/login/');
  const isProtectedPath =
    !['/', '/login', '/contact', '/about', '/forgot-password', '/reset-password'].includes(pathname) &&
    !isLoginPath;

  /** 注文画面遷移 */
  const moveToOrder = () => {
    router.push('/order');
  };

  /** ヘッダー左側のコンテンツをレンダリング */
  const renderLeftContent = () => {
    // ローディング中はロゴと同じサイズの空Boxを返してブランクを維持
    if (isAuthLoading) {
      return <Box sx={{ width: 200, height: 52 }} />;
    }

    // 1. データがある場合
    if (isAuthenticated && restaurantName) {
      // Fade コンポーネントでラップ
      // Fadeの直下は<Button>という単一の要素であるため、エラーは発生しないはずです。
      return (
        <Fade in={isAuthenticated} timeout={500}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: '#ea5315',
              fontWeight: 'bold',
              fontSize: 28,
              fontFamily: 'Mobo Bold',
            }}
          >
            {restaurantName}
          </Typography>
        </Fade>
      );
    }

    // ロゴ表示 (ロゴはそのまま表示)
    return <Image
      src="/logo.svg"
      alt="みんなの社食"
      width={200}
      height={52}
      priority
      sizes="(max-width: 768px) 100vw, 200px"
    />;
  };

  // ★ メニューアイコンの表示条件を定数として定義
  const isMenuVisible = isAuthenticated && userRegistrationStatus === UserRegistrationStatus.REGISTERED.toString();

  return (
    <Box sx={{ zIndex: 10, position: 'relative', mb: 0 }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 'none' }}>
        <Toolbar
          sx={{
            maxWidth: 640,
            margin: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: 200, height: 52, display: 'flex', alignItems: 'center' }}>
            {renderLeftContent()}
          </Box>

          {/* メニューボタン (Fadeを適用) */}
          {/* isMenuVisibleがtrueになったときに、IconButtonがふわっと表示されます */}
          <Fade in={isMenuVisible} timeout={500} unmountOnExit>
            <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
              <MenuIcon sx={{ color: '#ea5315' }} />
            </IconButton>
          </Fade>
        </Toolbar>

        <HeaderMenu open={open} closeEvent={() => setOpen(false)} />
      </AppBar>
    </Box>
  );
}