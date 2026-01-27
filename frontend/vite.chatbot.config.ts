import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 3004,
        host: '0.0.0.0',
    },
    plugins: [
        react(),
        {
            name: 'rewrite-root',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/') {
                        req.url = '/chatbot.html';
                    }
                    next();
                });
            }
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    },
    build: {
        outDir: 'dist/chatbot',
        rollupOptions: {
            input: {
                chatbot: path.resolve(__dirname, 'chatbot.html'),
            },
        },
    },
});
