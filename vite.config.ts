import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
      // @ts-ignore
      allowedHosts: process.env.TEMPO === "true" ? true : undefined
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
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
          manualChunks: (id) => {
            // Vendor chunk for core React libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor';
              }
              // UI library chunk for Radix UI components
              if (id.includes('@radix-ui')) {
                return 'ui';
              }
              // Supabase and query libraries
              if (id.includes('@supabase') || id.includes('@tanstack')) {
                return 'data';
              }
              // Admin-specific libraries
              if (id.includes('recharts') || id.includes('react-table')) {
                return 'admin';
              }
              // Other vendor libraries
              return 'vendor-misc';
            }
            // Admin routes chunk
            if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
              return 'admin';
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/[name]-[hash].js`;
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
            return `assets/[name]-[hash][extname]`;
          },
        },
        external: [],
      },
      chunkSizeWarningLimit: 1000,
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