'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Fade, Grow, IconButton, Link, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react'; // useEffect, useStateをReactからインポート

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
  } = useAuth();

  const isLoginPath = pathname.startsWith('/login/');
  const nonProtectedPaths = ['/', '/login', '/contact', '/about', '/forgot-password', '/reset-password'];
  // ユーザーがログイン不要な公開ページにいるかどうか
  const isOnPublicPath = nonProtectedPaths.includes(pathname) || isLoginPath;

  /** 注文画面遷移 */
  const moveToOrder = () => {
    router.push('/order');
  };

  /** ヘッダー左側のコンテンツをレンダリング */
  const renderLeftContent = () => {
    // レストラン名が取得できていればFadeInで表示
    const showRestaurantName = isAuthenticated && restaurantName && restaurantName.length > 0;

    // 1. 認証情報が確定し、レストラン名がある場合 -> FadeInでレストラン名を表示
    if (showRestaurantName) {
      return (
        // Logoと同じサイズを確保するコンテナ
        <Box sx={{ width: 200, height: 52, position: 'relative' }}>
          <Fade in={showRestaurantName} timeout={500} unmountOnExit>
            <Button onClick={moveToOrder} sx={{ height: 52, p: 0 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: '#ea5315',
                  fontWeight: 'bold',
                  fontSize: 28,
                }}
              >
                {restaurantName}
              </Typography>
            </Button>
          </Fade>
        </Box>
      );
    }

    // 2. 公開ページにいる場合 -> ロゴを表示
    if (isOnPublicPath) {
      return (
        <Image
          src="/logo.svg"
          alt="みんなの社食"
          width={200}
          height={52}
          priority
          sizes="(max-width: 768px) 100vw, 200px"
        />
      );
    }

    // 3. 保護されたページにいるが、まだデータがない（ロード中/非認証状態）の場合 -> ブランク（空のBox）を表示
    // これにより、ロゴが表示されることなく、ブランクからレストラン名へ切り替わる
    return <Box sx={{ width: 200, height: 52 }} />;
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
            {/* renderLeftContentの戻り値はロゴまたはFadeでラップされたレストラン名になる */}
            {renderLeftContent()}
          </Box>

          {/* メニューボタン (Growを適用 - 中央から穏やかに拡大) */}
          <Grow in={isMenuVisible} timeout={500} unmountOnExit>
            <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
              <MenuIcon sx={{ color: '#ea5315' }} />
            </IconButton>
          </Grow>
        </Toolbar>

        <HeaderMenu open={open} closeEvent={() => setOpen(false)} />
      </AppBar>
    </Box>
  );
}
