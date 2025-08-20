import { Box, IconButton, Modal, Typography } from '@mui/material';
import Image from 'next/image';

import closeIcon from '../_images/modal-close.svg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '640px',
  maxHeight: '90vh',

  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

type Props = {
  /** children */
  children: React.ReactNode;
  /** title、デフォルト："" */
  title?: string;
  /** 表示状態 */
  open: boolean;
  /** closeイベント */
  onClose: VoidFunction;
};

function UserCustomModal(props: Props) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton onClick={props.onClose} sx={{ position: 'absolute', width: 56, height: 56, right: -20, top: -20 }}>
          <Image src={closeIcon} alt="閉じる" fill />
        </IconButton>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{ fontSize: 20, color: '#333', fontWeight: 'bold', mb: 2 }}
        >
          {props.title}
        </Typography>
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            minHeight: 0, // flexの中でスクロール可能にするため必要
            whiteSpace: 'pre-wrap',
          }}
        >
          {props.children}
        </Box>
      </Box>
    </Modal>
  );
}

export default UserCustomModal;
