import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: '/',
    server: {
      host: "::",
      port: 8080,
      allowedHosts: process.env.TEMPO === "true" ? true : undefined
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          chunkFileNames: (chunkInfo) => {
            // Use more descriptive chunk names
            if (chunkInfo.name.startsWith('vendor-')) {
              return `assets/vendor/[name]-[hash].js`;
            }
            if (['admin', 'checkout', 'auth', 'payment'].includes(chunkInfo.name)) {
              return `assets/features/[name]-[hash].js`;
            }
            return `assets/chunks/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
        external: [],
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
      },
      chunkSizeWarningLimit: 500,
      reportCompressedSize: isProduction,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        '@tanstack/react-query'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      legalComments: 'none',
    },
    define: {
      __DEV__: !isProduction,
    }
  };
});