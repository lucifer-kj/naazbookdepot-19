
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "./lib/providers";
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ErrorBoundary } from "./components/ui/error-boundary";
import Dashboard from "./pages/admin/Dashboard";
import OrderList from "./pages/admin/OrderList";
import OrderDetail from "./pages/admin/OrderDetail";
import Index from "./pages/Index";
import Books from "./pages/Books";
import Perfumes from "./pages/Perfumes";
import Essentials from "./pages/Essentials";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import AddressManagement from "./pages/AddressManagement";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductPage from "./pages/ProductPage";
import { ProductList } from "./components/admin/products/ProductList";
import OrderSuccess from "./pages/OrderSuccess";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <BrowserRouter>
          <TooltipProvider>
            <SidebarProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/books" element={<Books />} />
                <Route path="/perfumes" element={<Perfumes />} />
                <Route path="/essentials" element={<Essentials />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                
                {/* Auth Routes (only accessible if NOT logged in) */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
                
                {/* Protected Routes (only accessible if logged in) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/settings" element={<AccountSettings />} />
                  <Route path="/account/addresses" element={<AddressManagement />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:orderId" element={<OrderDetail />} />
                  </Route>
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </TooltipProvider>
        </BrowserRouter>
      </AppProviders>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
