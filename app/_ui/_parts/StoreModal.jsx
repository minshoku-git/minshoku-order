import { Box, IconButton, Modal, Typography } from '@mui/material';
import closeIcon from '../_images/modal-close.svg';
import React from 'react';
import Image from 'next/image';

const style = {
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
function StoreModal({ open, handleClose, storeInfo }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', width: 56, height: 56, right: -20, top: -20 }}>
          <Image component="img" src={closeIcon} alt="閉じる" width="100%" />
        </IconButton>
        <Image
          src={storeInfo.logo}
          alt={storeInfo.alt}
          style={{
            display: 'block',
            margin: 'auto',
            maxWidth: '100%',
          }}
        />
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{ fontSize: 20, color: '#333', fontWeight: 'bold', mt: 2 }}
        >
          {storeInfo.name}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, color: '#333', fontSize: 16 }}>
          {storeInfo.desc}
        </Typography>
      </Box>
    </Modal>
  );
}

export default StoreModal;
