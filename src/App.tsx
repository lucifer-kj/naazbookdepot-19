import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/context/AuthContext';
import { CartProvider } from './lib/context/CartContext';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UpiPayment from './pages/UpiPayment';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductPage from './pages/ProductPage';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Blog from './pages/Blog';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';

// Components
import AdminRoute from './components/admin/AdminRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
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
              <Toaster 
                position="top-right" 
                richColors 
                closeButton
                duration={4000}
              />
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
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/promo-codes" element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
                
                {/* 404 Route - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;