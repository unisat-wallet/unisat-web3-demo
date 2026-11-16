import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function securityCspPlugin(): Plugin {
  return {
    name: 'inject-security-csp',
    transformIndexHtml: {
      order: 'pre',
      handler: () => [{
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: contentSecurityPolicy,
        },
        injectTo: 'head-prepend',
      }],
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'build' ? [securityCspPlugin()] : [])],
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1_200,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    clearMocks: true,
    restoreMocks: true,
  },
}));
