import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, Typography } from '@mui/material';
import { JSX } from 'react';

type Props = {
  menuDate: string;
};

/**
 * 日付ナビゲーション
 * @returns {JSX.Element} JSX
 */
export const MenuDateNavigation = (props: Props): JSX.Element => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <IconButton>
        <ArrowBackIosNewIcon />
      </IconButton>
      <Typography variant="h6" fontWeight="bold">
        {props.menuDate} のメニュー
      </Typography>
      <IconButton>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};
