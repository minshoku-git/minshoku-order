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
  const isSignupPath = pathname.startsWith('/signup/');
  const nonProtectedPaths = ['/', '/login', '/signup', '/contact', '/about', '/forgot-password', '/reset-password'];
  // ユーザーがログイン不要な公開ページにいるかどうか
  const isOnPublicPath = nonProtectedPaths.includes(pathname) || isLoginPath || isSignupPath;

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
      const name = restaurantName ?? '';
      // 表示幅を全角換算で算出する。実測値は全角=1.00em、半角=0.46〜0.58em(大文字中心のとき最大)のため、
      // 半角は安全側に倒して0.6文字分として扱う
      const emWidth = Math.max(
        Array.from(name).reduce((width, char) => width + (/[ -~｡-ﾟ]/.test(char) ? 0.6 : 1), 0),
        1
      );
      // 「28px」と「ヘッダーの利用可能幅 ÷ 全角換算文字数」の小さい方を採用し、端末幅によらず溢れさせない。
      // 88px = Toolbarの左右padding(16px * 2) + メニューアイコンの実効幅(40px) + 余白(16px)
      const fontSize = `clamp(11px, calc((min(100vw, 640px) - 88px) / ${emWidth}), 28px)`;

      return (
        // Logoと同じ高さを確保しつつ、幅は残り領域いっぱいまで使うコンテナ
        <Box sx={{ width: '100%', minWidth: 0, height: 52, position: 'relative' }}>
          <Fade in={showRestaurantName} timeout={500} unmountOnExit>
            <Button
              onClick={moveToOrder}
              sx={{ height: 52, p: 0, minWidth: 0, maxWidth: '100%', justifyContent: 'flex-start' }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: '#ea5315',
                  fontWeight: 'bold',
                  fontSize,
                  lineHeight: 1.2,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {name}
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
          {/* 食堂名が長い場合に備え、幅は固定せず残り領域いっぱいまで使う(minWidth:0がないと縮まず横スクロールが出る) */}
          <Box sx={{ flex: 1, minWidth: 0, height: 52, display: 'flex', alignItems: 'center' }}>
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
