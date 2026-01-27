import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3003,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'rewrite-root',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/') {
              req.url = '/settings.html';
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist/settings',
      rollupOptions: {
        input: {
          settings: path.resolve(__dirname, 'settings.html'),
        },
      },
    },
  };
});
