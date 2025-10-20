import { Box, IconButton, Modal, SxProps, Theme, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

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
      </Box>
    </Modal>
  );
};

export default StoreModal;