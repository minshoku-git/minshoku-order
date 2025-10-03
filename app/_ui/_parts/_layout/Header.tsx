'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Link, Toolbar, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { getUserNameFetcher } from '@/app/_lib/getLoginUser/fetcher';
import { LoginUserResponse } from '@/app/_lib/getLoginUser/types';
import { UserRegistrationStatus } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';

import { queryClientInstance } from '../../tanstackQuery/queryClient';
import { useApiQuery } from '../../tanstackQuery/useApiQuery';
import HeaderMenu from './HeaderMenu';

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPath = pathname.startsWith('/login/');
  const isProtectedPath =
    !['/', '/login', '/contact', '/about', '/forgot-password', '/reset-password'].includes(pathname) &&
    !isLoginPath;

  // React Queryでのデータ取得
  const { data, isLoading } = useApiQuery<LoginUserResponse>({
    queryKey: [QUERY_KEYS.USER_NAME_SEARCH_RESULT],
    queryFn: getUserNameFetcher,
    enabled: isProtectedPath,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // CSRマウント判定 (Hydration回避ロジック)
  const [isMounted, setIsMounted] = useState(false);

  // クライアントマウント時にキャッシュからも取得
  const [cachedData, setCachedData] = useState<LoginUserResponse | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    const cached = queryClientInstance.getQueryData<LoginUserResponse>([QUERY_KEYS.USER_NAME_SEARCH_RESULT]);
    setCachedData(cached);
  }, []);

  // Hydration回避ロジック: SSR時は必ずundefined。CSR時（isMounted=true）に初めてキャッシュ or dataを使う
  const displayData = isMounted ? data ?? cachedData : undefined;

  /** 注文画面遷移 */
  const moveToOrder = () => {
    router.push('/order');
  };

  // 💡 [ロジック整理] 優先度順で一つだけ要素を返す関数を定義

  /** ヘッダー左側のコンテンツをレンダリング */
  const renderLeftContent = () => {
    // 1. データがある場合 (最優先)
    if (displayData) {
      return (
        <Button onClick={moveToOrder} sx={{ height: 52, p: 0 }}>
          <Link sx={{ textDecoration: 'none', height: '100%', display: 'flex', alignItems: 'center' }}>
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
              {displayData.restaurantName}
            </Typography>
          </Link>
        </Button>
      );
    }

    // 2. 保護されたパスで、結果が確定していない場合 (ブランク表示)
    // 💡 [修正] showBlankの判定を簡素化。データが必要だがまだない状態。
    // isProtectedPathがtrueで、displayDataがundefinedの間はブランク
    if (isProtectedPath && !displayData) {
      // ロゴと同じサイズの空Boxを返してブランクを維持
      return <Box sx={{ width: 200, height: 52 }} />;
    }

    // 3. データがないことが確定した場合 or 保護されていないパスの場合 (ロゴ表示)
    // 💡 [修正] 上記2つの条件に当てはまらない、つまりロゴ表示が確定した場合
    return (
      <Image src="/logo.svg" alt="みんなの社食" width={200} height={52} priority fetchPriority="auto" />
    );
  };

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
          {/* 💡 [修正点] Boxラッパーを外し、単一の要素を返す関数を呼び出す */}
          <Box sx={{ width: 200, height: 52, display: 'flex', alignItems: 'center' }}>
            {renderLeftContent()}
          </Box>


          {/* メニューボタン (データがある場合のみ表示) */}
          {displayData?.userName && displayData.userRegistrationStatus === UserRegistrationStatus.REGISTERED && (
            <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
              <MenuIcon sx={{ color: '#ea5315' }} />
            </IconButton>
          )}
        </Toolbar>

        <HeaderMenu
          open={open}
          closeEvent={() => setOpen(false)}
          router={router}
          openSnackbar={undefined}
          username={displayData?.userName ?? ''}
        />
      </AppBar>
    </Box>
  );
}