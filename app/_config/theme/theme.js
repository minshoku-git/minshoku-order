import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: ['Noto Sans JP', 'Yu Gothic', '游ゴシック体', 'YuGothic', 'sans-serif'].join(','),
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: '6px',
          '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #707070' },
        },
      },
    },
  },
});

export default theme;
