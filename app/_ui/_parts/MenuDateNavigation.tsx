import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Grid2 as Grid, IconButton, Typography } from '@mui/material';
import { JSX } from 'react';

type Props = {
  /** 納品日 */
  menuDate: string;
  /** メニュー移動 */
  moveMenu: (id: number) => void
  /** 前の日付のスケジュールID */
  previousScheduleId?: number;
  /** 次の日付のスケジュールID */
  nextScheduleId?: number;
};

/**
 * 日付ナビゲーション
 * @returns {JSX.Element} JSX
 */
export const MenuDateNavigation = (props: Props): JSX.Element => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      {/* 戻るボタンの代わりに同じサイズの透明な要素を配置 */}
      <Box sx={{ width: 48, height: 48 }}>
        {props.previousScheduleId && (
          <IconButton onClick={() => props.moveMenu(props.previousScheduleId!)}>
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
      </Box>

      <Typography variant="h6" fontWeight="bold">
        {props.menuDate} のメニュー
      </Typography>

      {/* 進むボタンの代わりに同じサイズの透明な要素を配置 */}
      <Box sx={{ width: 48, height: 48 }}>
        {props.nextScheduleId && (
          <IconButton onClick={() => props.moveMenu(props.nextScheduleId!)}>
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
