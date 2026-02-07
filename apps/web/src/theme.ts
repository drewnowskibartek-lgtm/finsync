import { createTheme } from '@mui/material/styles';

const palette = {
  blue: '#1565c0',
  teal: '#2ed6a1',
  navy: '#0a2540',
  light: '#eceff1',
  green: '#179d46',
  orange: '#ff9800',
  red: '#e53935',
  grey: '#b0bec5',
};

export const theme = createTheme({
  palette: {
    primary: { main: palette.blue },
    secondary: { main: palette.teal },
    success: { main: palette.green },
    warning: { main: palette.orange },
    error: { main: palette.red },
    background: { default: palette.light, paper: '#ffffff' },
    text: { primary: palette.navy },
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.6rem', fontWeight: 700 },
    h3: { fontSize: '1.3rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(135deg, rgba(10,37,64,0.08), rgba(46,214,161,0.15))',
          backdropFilter: 'blur(6px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:
            'linear-gradient(180deg, rgba(10,37,64,0.08), rgba(21,101,192,0.04))',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(10,37,64,0.06)',
          boxShadow:
            '0 10px 30px rgba(10,37,64,0.08), 0 2px 8px rgba(10,37,64,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
