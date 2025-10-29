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
      // @ts-expect-error - allowedHosts type issue with conditional assignment
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
              // Core React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              
              // UI library chunks
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons';
              }
              
              // Data and API libraries
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              
              // Form and validation libraries
              if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
                return 'vendor-forms';
              }
              
              // Animation and motion libraries
              if (id.includes('framer-motion') || id.includes('embla-carousel')) {
                return 'vendor-animation';
              }
              
              // Admin-specific heavy libraries
              if (id.includes('recharts') || id.includes('@tanstack/react-table')) {
                return 'vendor-admin';
              }
              
              // Utility libraries
              if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
                return 'vendor-utils';
              }
              
              // Security and monitoring
              if (id.includes('@sentry') || id.includes('dompurify')) {
                return 'vendor-security';
              }
              
              // Payment libraries
              if (id.includes('paypal') || id.includes('stripe')) {
                return 'vendor-payment';
              }
              
              // Other vendor libraries
              return 'vendor-misc';
            }
            
            // Application chunks
            if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
              return 'admin';
            }
            if (id.includes('src/pages/checkout') || id.includes('src/components/checkout')) {
              return 'checkout';
            }
            if (id.includes('src/pages/auth') || id.includes('src/components/auth')) {
              return 'auth';
            }
            if (id.includes('src/lib/services/payment')) {
              return 'payment';
            }
            if (id.includes('src/lib/services/image') || id.includes('src/lib/hooks/useImage')) {
              return 'image-optimization';
            }
          },
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