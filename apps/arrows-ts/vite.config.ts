/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/arrows-ts',

  // The embed entry is opt-in via BUILD_EMBED=1 so production `nx build
  // arrows-ts` (deployed to arrows.app) never ships /embed.html. The
  // arrows-code extension build sets the env var when packaging the .vsix.
  build: {
    rollupOptions: {
      input: process.env.BUILD_EMBED === '1'
        ? {
            main: resolve(__dirname, 'index.html'),
            embed: resolve(__dirname, 'embed.html'),
          }
        : { main: resolve(__dirname, 'index.html') },
    },
    // VS Code webviews are local-only; modulepreload eagerly fetches async
    // chunks and defeats the lazy-load. Web app build keeps the default.
    modulePreload: process.env.BUILD_EMBED === '1' ? false : true,
  },

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: ['../../'],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
