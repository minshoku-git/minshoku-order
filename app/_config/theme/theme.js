import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    allVariants: { color: '#333' },
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
