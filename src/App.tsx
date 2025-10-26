import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/context/AuthContext';
import { CartProvider } from './lib/context/CartContext';
import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import { logError } from './lib/utils/errorLogging';
import { testDatabaseConnection, validateData } from './utils/databaseTest';
import { EnvChecker } from './components/debug/EnvChecker';
import './App.css';

// Log environment variables status
console.log('Environment Variables Check:', {
  SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
  NODE_ENV: import.meta.env.VITE_NODE_ENV,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});

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
import { LoadingBar } from './components/common/LoadingBar';

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
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Blog = lazy(() => import('./pages/Blog'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductNew = lazy(() => import('./pages/admin/ProductNew'));
const ProductEdit = lazy(() => import('./pages/admin/ProductEdit'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserProfiles = lazy(() => import('./pages/admin/UserProfiles'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminPromoCodes = lazy(() => import('./pages/admin/PromoCodes'));

// Components
import AdminRoute from './components/admin/AdminRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 30 * 60 * 1000, // Cache garbage collection after 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      networkMode: 'offlineFirst'
    }
  }
});

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <ToastProvider />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/books" element={<Products />} />
                <Route path="/catalog" element={<Products />} />
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
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/account" element={<Account />} />
                <Route path="/account/*" element={<Account />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/coming-soon" element={<ComingSoon section="perfumes" />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/products/new" element={<AdminRoute><ProductNew /></AdminRoute>} />
                <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductEdit /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/user-profiles" element={<AdminRoute><AdminUserProfiles /></AdminRoute>} />
                <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
                <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
                <Route path="/admin/promo-codes" element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
                
                {/* 404 Route - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {import.meta.env.DEV && <EnvChecker />}
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;