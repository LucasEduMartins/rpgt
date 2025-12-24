import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    },
    minify: false,
    sourcemap: false,
    target: 'es2020'
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
