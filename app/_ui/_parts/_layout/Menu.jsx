import React from 'react';
import { Box } from '@mui/material';
import { Btn } from './parts/Btn';
import { Inputitem } from './parts/InputItem';
import MenuCard from './parts/MenuCard';

export default function Menu({ setCurrentPage, setIsLogin }) {
  return (
    <Box
      sx={{
        maxWidth: 640,
        width: '90%',
        mx: 'auto',
        pt: 5,
        pb: 10,
      }}
    >
      <MenuCard />
    </Box>
  );
}
