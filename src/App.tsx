
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/context/AuthContext';
import { CartProvider } from './lib/context/CartContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Books from './pages/Books';
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
import Catalog from './pages/Catalog';
import EnhancedCatalog from './pages/EnhancedCatalog';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Blog from './pages/Blog';
import ComingSoon from './pages/ComingSoon';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';

// Components
import AdminRoute from './components/admin/AdminRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
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
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/enhanced-catalog" element={<EnhancedCatalog />} />
              <Route path="/account" element={<Account />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/coming-soon" element={<ComingSoon />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/promo-codes" element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
