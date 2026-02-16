import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/finsync/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'pwa/icon.svg',
        'pwa/apple-touch-icon-180x180.png',
        'pwa/favicon.ico',
      ],
      manifest: {
        id: '/finsync/?v=20260216',
        name: 'Finsync - budżet osobisty',
        short_name: 'Finsync',
        version: '2026.02.16.1',
        description:
          'Porządkuj finanse osobiste w jednym miejscu. Rejestruj transakcje, planuj budżety, sprawdzaj raporty i miej pełną kontrolę nad wydatkami.',
        lang: 'pl',
        start_url: '/finsync/login',
        scope: '/finsync/',
        display: 'standalone',
        background_color: '#eceff1',
        theme_color: '#1565c0',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: 'pwa/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/finsync/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/finsync\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (/^\/(auth|users|budgets|categories|transactions|reports|recurring|subscriptions|admin|audit|ai)\b/.test(
                url.pathname,
              ) ||
                /^\/api\/(auth|users|budgets|categories|transactions|reports|recurring|subscriptions|admin|audit|ai)\b/.test(
                  url.pathname,
                ) ||
                /^\/finsync\/api\/(auth|users|budgets|categories|transactions|reports|recurring|subscriptions|admin|audit|ai)\b/.test(
                  url.pathname,
                )),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-get',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 3,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
