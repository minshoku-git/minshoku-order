import React from 'react';
import { Box, Typography, Divider, Link, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HeaderMenu = ({ open, closeEvent }) => {
  return (
    <>
      {/* スライドインメニュー */}
      <Slide direction="down" in={open} mountOnEnter unmountOnExit>
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
            <IconButton size="large" edge="end" onClick={() => closeEvent()} sx={{ color: '#fff' }}>
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
            {/* ユーザー名（リンクでない） */}
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
              ◯◯ ◯◯さま
            </Typography>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.5)' }} />

            {/* メニューリンク */}
            {[
              {
                text: '注文・予約',
                link: '/order',
              },
              {
                text: '注文履歴',
                link: '/orderHistory',
              },
              {
                text: '会員情報の変更',
                link: '/editProfile',
              },
              {
                text: '支払い情報の変更',
                link: '/payment',
              },
              {
                text: '個人情報保護方針',
                link: '/privacy',
              },
              {
                text: '特定商取引法に基づく表記',
                link: '/terms',
              },
              {
                text: 'お問い合わせ',
                link: '/contact',
              },
              {
                text: 'ログアウト',
                link: '/logout',
              },
            ].map((item, index, arr) => (
              <Box key={index}>
                <Link
                  href={item.link}
                  underline="none"
                  sx={{ color: '#fff', fontSize: '1rem', display: 'block', py: 1 }}
                >
                  {item.text}
                </Link>
                {index !== arr.length - 1 && <Divider sx={{ bgcolor: 'rgba(255,255,255,0.5)' }} />}
              </Box>
            ))}
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default HeaderMenu;
