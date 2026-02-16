import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { App } from './App';
import { theme } from './theme';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
      window.location.reload();
    },
    onOfflineReady() {
      // no-op
    },
  });
}

if (typeof window !== 'undefined') {
  let pendingReload: number | undefined;
  window.addEventListener('finsync:sync-complete', () => {
    if (pendingReload) return;
    pendingReload = window.setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
