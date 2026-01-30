import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import hotReloadExtension from 'hot-reload-extension-vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Plugin to copy manifest.json and icons to dist
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const distPath = resolve(__dirname, 'dist');
      const manifestPath = resolve(__dirname, 'public', 'manifest.json');
      const distManifestPath = resolve(distPath, 'manifest.json');
      const iconsSourcePath = resolve(__dirname, 'public', 'icons');
      const iconsDestPath = resolve(distPath, 'icons');
      
      if (!existsSync(distPath)) {
        mkdirSync(distPath, { recursive: true });
      }
      
      if (existsSync(manifestPath)) {
        copyFileSync(manifestPath, distManifestPath);
      }
      
      // Copy icons directory if it exists
      if (existsSync(iconsSourcePath)) {
        if (!existsSync(iconsDestPath)) {
          mkdirSync(iconsDestPath, { recursive: true });
        }
        readdirSync(iconsSourcePath).forEach((file: string) => {
          const sourceFile = resolve(iconsSourcePath, file);
          const destFile = resolve(iconsDestPath, file);
          if (statSync(sourceFile).isFile()) {
            copyFileSync(sourceFile, destFile);
          }
        });
      }
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    copyManifest(),
    hotReloadExtension({
      log: true,
      backgroundPath: 'src/background/index.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'typeutils': resolve(__dirname, './src/types'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: process.env.NODE_ENV !== 'development',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo: { name: string }) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
});
