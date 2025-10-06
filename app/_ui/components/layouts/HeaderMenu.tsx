import CloseIcon from '@mui/icons-material/Close';
import { Box, Divider, IconButton, Link, Slide, Typography } from '@mui/material';
import React, { JSX } from 'react';

import { useAuth } from '@/app/_ui/contexts/auth/AuthContext';

type Props = {
  open: boolean;
  closeEvent: () => void;
}

const HeaderMenu = (props: Props): JSX.Element => {
  // Contextから必要な機能を取得
  const { userName, logout, } = useAuth();

  const translucentWhiteBg = { bgcolor: 'rgba(255,255,255,0.5)' };

  // ログアウト処理：AuthContextのlogout関数を呼び出す
  const logoutHandler = async () => {
    props.closeEvent(); // メニューを閉じる
    await logout(); // AuthContextで定義されたログアウト処理を実行
  };

  return (
    <>
      {/* スライドインメニュー */}
      <Slide direction="down" in={props.open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            height: '100lvh',
            width: '100%',
            bgcolor: '#ea5315',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1200,
            py: 2,
          }}
        >
          <Box
            sx={{
              maxWidth: 640,
              width: '90%',
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {/* 閉じるアイコン */}
            <Box />
            <IconButton size="large" edge="end" onClick={() => props.closeEvent()} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* メニュー本体 */}
          <Box
            sx={{
              maxWidth: 640,
              width: '90%',
              mx: 'auto',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* ユーザー名 */}
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
              {userName} さま
            </Typography>
            <Divider sx={translucentWhiteBg} />

            {/* メニューリンク群 */}
            {/* Next.jsのLinkコンポーネントを使用することを推奨します */}
            {/* 例：<NextLink href={'/order'} passHref>...</NextLink> */}
            {/* ここではMUI Linkをそのまま維持しつつ、Next.jsのLink機能を持つと仮定 */}

            <Box>
              <Link href={'/order'} underline="none" sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}>
                {'注文・予約'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/order-history'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'注文履歴'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/edit-profile'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'会員情報の変更'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/edit-payment'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'支払い方法の変更'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/edit-password'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'パスワードの変更'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/privacy'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'個人情報保護方針'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link href={'/terms'} underline="none" sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}>
                {'特定商取引法に基づく表記'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                href={'/contact'}
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
              >
                {'お問い合わせ'}
              </Link>
              <Divider sx={translucentWhiteBg} />
            </Box>
            <Box>
              <Link
                underline="none"
                sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1, cursor: 'pointer' }}
                onClick={logoutHandler}>
                {'ログアウト'}
              </Link>
            </Box>
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default HeaderMenu;