import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toaster';
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';
import { testDatabaseConnection, validateData } from '@/utils/databaseTest';
import { EnvChecker } from '@/components/debug/EnvChecker';
import { ErrorMonitoringPanel } from '@/components/debug/ErrorMonitoringPanel';
import { initializePerformanceOptimizations } from '@/lib/utils/performanceOptimization';
import { productionMonitoring } from '@/lib/services/ProductionMonitoring';
import { healthCheckService } from '@/lib/services/HealthCheck';
import '@/lib/utils/consoleErrorFixes'; // Initialize error fixes
import './App.css';

// Type for API errors
interface ApiError {
  status?: number;
  message?: string;
}

// Initialize environment validation
import { environmentService } from '@/lib/services/environmentService';
environmentService.initialize();

// Initialize performance optimizations
initializePerformanceOptimizations();

// Initialize production monitoring
if (import.meta.env.PROD) {
  // Set up health check interval
  setInterval(async () => {
    const health = await healthCheckService.getHealthStatus();
    if (health.status === 'unhealthy') {
      console.error('Application health check failed:', health);
    }
  }, 60000); // Check every minute
}

// Test database connection on startup
testDatabaseConnection().then((success) => {
  if (success) {
    validateData().then((counts) => {
      console.log('Data validation results:', counts);
    }).catch((error) => {
      console.error('Data validation failed:', error);
    });
  }
});

import { lazy, Suspense } from 'react';
import { LoadingBar } from '@/components/common/LoadingBar';

// Core Pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const UpiPayment = lazy(() => import('./pages/UpiPayment'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Blog = lazy(() => import('./pages/Blog'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Routes (lazy loaded as a chunk)
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes'));

import { createOptimizedQueryClient } from '@/lib/config/cacheConfig';

const queryClient = createOptimizedQueryClient();

// Enhanced ScrollToTop component that handles all navigation types
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname, search]);
  
  return null;
};

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <ToastProvider />
              <Suspense fallback={<LoadingBar />}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                {/* Legacy route redirects */}
                <Route path="/books" element={<Navigate to="/products" replace />} />
                <Route path="/catalog" element={<Navigate to="/products" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/upi-payment" element={<UpiPayment />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/track-order/:orderNumber" element={<OrderTracking />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/account" element={<Account />} />
                <Route path="/account/*" element={<Account />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/coming-soon" element={<ComingSoon section="perfumes" />} />

                {/* Admin Routes - Lazy loaded as separate chunk */}
                <Route path="/admin/*" element={<AdminRoutes />} />
                
                {/* 404 Route - Must be last */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              {import.meta.env.DEV && <EnvChecker />}
              {import.meta.env.DEV && (
                <Suspense fallback={null}>
                  <ErrorMonitoringPanel />
                </Suspense>
              )}
              {import.meta.env.DEV && (
                <Suspense fallback={null}>
                  {(() => {
                    const MonitoringDashboard = lazy(() => import('@/components/debug/MonitoringDashboard'));
                    return <MonitoringDashboard />;
                  })()}
                </Suspense>
              )}
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
