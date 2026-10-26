import { defineConfig } from 'vite';

// Relative asset paths make the app work on GitHub Pages project URLs such as /repo-name/.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: true }
});
