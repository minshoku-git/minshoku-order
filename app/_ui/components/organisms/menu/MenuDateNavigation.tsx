import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, Typography } from '@mui/material';
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
      <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
        {props.previousScheduleId && (
          <IconButton onClick={() => props.moveMenu(props.previousScheduleId!)}>
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold" sx={{
          fontSize: {
            xs: 'clamp(1rem, 4vw, 1.2rem)', // 画面幅に応じて伸縮
          },
        }}>
          {props.menuDate} のメニュー
        </Typography>
      </Box>

      {/* 進むボタンの代わりに同じサイズの透明な要素を配置 */}
      <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
        {props.nextScheduleId && (
          <IconButton onClick={() => props.moveMenu(props.nextScheduleId!)}>
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
