import { Box, IconButton, Modal, SxProps, Theme, Typography, Collapse } from '@mui/material';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import closeIcon from '../../assets/images/modal-close.svg';

// -----------------------------------------------------------
// 1. Propsの型定義
// -----------------------------------------------------------

/**
 * 渡される店舗情報の型定義
 */
interface StoreInfo {
  name: string;
  desc: string;
  legalNotice?: string;
}

/**
 * StoreModal コンポーネントの Props の型定義
 */
interface StoreModalProps {
  open: boolean;
  handleClose: () => void;
  storeInfo: StoreInfo;
}

// -----------------------------------------------------------
// 2. スタイル定義（SxPropsで型付け）
// -----------------------------------------------------------

const style: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '640px',
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

// -----------------------------------------------------------
// 3. コンポーネントの型適用
// -----------------------------------------------------------

const StoreModal: React.FC<StoreModalProps> = ({ open, handleClose, storeInfo }) => {
  const [showLegal, setShowLegal] = useState(false);

  // モーダルが閉じられたらアコーディオンも閉じるようにする
  useEffect(() => {
    if (!open) {
      setShowLegal(false);
    }
  }, [open]);
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', width: 56, height: 56, right: -20, top: -20 }}>
          <Image
            src={closeIcon}
            alt="閉じる"
            width={56}
            height={56}
          />
        </IconButton>

        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{ fontSize: 20, color: '#333', fontWeight: 'bold' }}
        >
          {storeInfo.name}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, color: '#333', fontSize: 16, whiteSpace: 'pre-wrap' }}>
          {storeInfo.desc}
        </Typography>
        {/* 特定商取引法に基づく表記（アコーディオン形式） */}
        {/* 特定商取引法に基づく表記（内側スクロール版） */}
        {storeInfo.legalNotice && (
          <Box sx={{ mt: 4, borderTop: '1px solid #eee', pt: 2 }}>
            <Box
              onClick={() => setShowLegal(!showLegal)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#666',
                mb: 1,
                '&:hover': { color: '#ea5315' }
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 'bold', textDecoration: 'underline' }}>
                特定商取引法に基づく表記
              </Typography>
              {showLegal ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </Box>
            
            <Collapse in={showLegal}>
              {/* ★ここがポイント：maxHeight を設定してエリア内スクロールにする */}
              <Box sx={{ 
                mt: 1, 
                p: 2, 
                bgcolor: '#f9f9f9', 
                borderRadius: '8px',
                maxHeight: '250px', // 好みの高さに調整してください
                overflowY: 'auto',  // 内容が多いときだけスクロールバーを表示
                border: '1px solid #ddd'
              }}>
                <Typography sx={{ fontSize: 13, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {storeInfo.legalNotice}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default StoreModal;