import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          clientPort: 9000,
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY), // Ensure VITE_ prefix is used if accessing via import.meta.env client-side, but here we map for process.env compatibility if needed.
        // If you use import.meta.env.VITE_GEMINI_API_KEY in client code, Vite handles it automatically if it's in .env with VITE_ prefix.
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      assetsInclude: ['**/*.md'],
    };
});
