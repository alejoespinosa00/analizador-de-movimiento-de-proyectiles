import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Si despliegan en GitHub Pages, agreguen: base: '/nombre-del-repo/'
// y cambien BrowserRouter por HashRouter en src/main.tsx.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
