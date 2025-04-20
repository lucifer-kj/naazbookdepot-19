
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserMenu from '../components/auth/UserMenu';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
        
        // Fetch wishlist count
        const { count: wishlistItems, error: wishlistError } = await supabase
          .from('wishlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (wishlistError) throw wishlistError;
        setWishlistCount(wishlistItems || 0);
        
        // Fetch cart count
        const { count: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (cartError) throw cartError;
        setCartCount(cartItems || 0);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-10">My Account</h1>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <UserMenu activeItem="dashboard" />
            </div>
            
            {/* Content Area */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div>
                  <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-naaz-cream p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-naaz-green">Orders</h3>
                        <Package size={20} className="text-naaz-gold" />
                      </div>
                      <p className="text-3xl font-bold text-naaz-green">{orders.length}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                    </div>
                    
                    <div className="bg-naaz-cream p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-naaz-green">Wishlist</h3>
                        <Heart size={20} className="text-naaz-gold" />
                      </div>
                      <p className="text-3xl font-bold text-naaz-green">{wishlistCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Saved Items</p>
                    </div>
                    
                    <div className="bg-naaz-cream p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-naaz-green">Cart</h3>
                        <ShoppingBag size={20} className="text-naaz-gold" />
                      </div>
                      <p className="text-3xl font-bold text-naaz-green">{cartCount}</p>
                      <p className="text-sm text-gray-600 mt-1">Items in Cart</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-naaz-green">Recent Orders</h3>
                      <Link to="/account/orders" className="text-sm text-naaz-gold hover:underline">
                        View All
                      </Link>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-naaz-green"></div>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orders.slice(0, 3).map((order: any) => (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-naaz-green">
                                  {order.id.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    order.status === 'delivered' 
                                      ? 'bg-green-100 text-green-800' 
                                      : order.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ₹{order.total_amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 text-center rounded-lg">
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        <Link to="/books" className="mt-4 inline-block text-naaz-gold hover:underline">
                          Start Shopping
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-naaz-green mb-4">Account Information</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                          <p className="text-gray-600">{profile?.first_name} {profile?.last_name}</p>
                          <p className="text-gray-600">{profile?.email}</p>
                          <p className="text-gray-600">{profile?.phone || 'No phone number added'}</p>
                          <Link to="/account/settings" className="text-naaz-gold hover:underline mt-3 inline-block text-sm">
                            Edit
                          </Link>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Default Shipping Address</h4>
                          <p className="text-gray-600">Add a shipping address to speed up checkout</p>
                          <Link to="/account/settings" className="text-naaz-gold hover:underline mt-3 inline-block text-sm">
                            Add Address
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
