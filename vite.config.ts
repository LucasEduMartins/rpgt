import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'rpgt',
    rollupOptions: {
      input: 'index.html'
    },
    minify: false,
    sourcemap: false,
    target: 'es2020',
  },
   base: '/rpgt/',
  server: {
    port: 5173,
    strictPort: false
  }
});
