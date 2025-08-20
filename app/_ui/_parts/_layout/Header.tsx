'use client';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import { Link } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import HeaderMenu from './HeaderMenu';

type Props = {
  /** ログイン状態 */
  isLogin: boolean;
};

export default function Header(props: Props) {
  const router = useRouter();
  const currentPathname = usePathname();
  const [open, setOpen] = useState(false);

  /** TopPage遷移 */
  const moveToTopPage = () => {
    return router.push('/order');
  };

  return (
    <Box sx={{ zIndex: 10, position: 'relative', mb: 0 }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 'none' }}>
        <Toolbar
          sx={{ maxWidth: 640, margin: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between' }}
        >
          {/* 左ロゴ */}
          <Button onClick={() => moveToTopPage()}>
            <Link sx={{ textDecoration: 'none' }}>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, color: '#ea5315', fontWeight: 'bold', fontSize: 28, fontFamily: 'Mobo Bold' }}
              >
                ABC建設食堂
              </Typography>
            </Link>
          </Button>
          {props.isLogin && (
            <IconButton size="large" edge="end" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
              <MenuIcon sx={{ color: '#ea5315' }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <HeaderMenu open={open} closeEvent={() => setOpen(false)} />
    </Box>
  );
}
