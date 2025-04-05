import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { User, Package, Heart, CreditCard, LogOut, Settings, ShoppingBag } from 'lucide-react';

const Account = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock user data
  const user = {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+91 98765 43210',
  };

  // Mock orders
  const orders = [
    {
      id: 'ORD-12345',
      date: 'April 2, 2025',
      status: 'Delivered',
      total: 2050,
      items: 3
    },
    {
      id: 'ORD-12098',
      date: 'March 25, 2025',
      status: 'Processing',
      total: 1450,
      items: 2
    },
    {
      id: 'ORD-11765',
      date: 'March 10, 2025',
      status: 'Delivered',
      total: 2300,
      items: 4
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-10">My Account</h1>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 mx-auto bg-naaz-green rounded-full flex items-center justify-center text-white text-2xl font-playfair mb-3">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-medium text-naaz-green">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'dashboard' 
                        ? 'bg-naaz-green text-white' 
                        : 'hover:bg-naaz-cream text-naaz-green'
                    }`}
                  >
                    <User size={18} className="mr-3" />
                    Dashboard
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'orders' 
                        ? 'bg-naaz-green text-white' 
                        : 'hover:bg-naaz-cream text-naaz-green'
                    }`}
                  >
                    <Package size={18} className="mr-3" />
                    My Orders
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('wishlist')} 
                    className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'wishlist' 
                        ? 'bg-naaz-green text-white' 
                        : 'hover:bg-naaz-cream text-naaz-green'
                    }`}
                  >
                    <Heart size={18} className="mr-3" />
                    Wishlist
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('payment')} 
                    className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'payment' 
                        ? 'bg-naaz-green text-white' 
                        : 'hover:bg-naaz-cream text-naaz-green'
                    }`}
                  >
                    <CreditCard size={18} className="mr-3" />
                    Payment Methods
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'settings' 
                        ? 'bg-naaz-green text-white' 
                        : 'hover:bg-naaz-cream text-naaz-green'
                    }`}
                  >
                    <Settings size={18} className="mr-3" />
                    Account Settings
                  </button>
                  
                  <Link 
                    to="/login" 
                    className="w-full flex items-center px-4 py-2 text-naaz-burgundy hover:bg-naaz-cream rounded-md transition-colors"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </Link>
                </nav>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
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
                        <p className="text-3xl font-bold text-naaz-green">7</p>
                        <p className="text-sm text-gray-600 mt-1">Saved Items</p>
                      </div>
                      
                      <div className="bg-naaz-cream p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-naaz-green">Cart</h3>
                          <ShoppingBag size={20} className="text-naaz-gold" />
                        </div>
                        <p className="text-3xl font-bold text-naaz-green">3</p>
                        <p className="text-sm text-gray-600 mt-1">Items in Cart</p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-naaz-green">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-sm text-naaz-gold hover:underline">
                          View All
                        </button>
                      </div>
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
                            {orders.slice(0, 2).map((order) => (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-naaz-green">
                                  {order.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {order.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    order.status === 'Delivered' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ₹{order.total.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-naaz-green mb-4">Account Information</h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                            <p className="text-gray-600">{user.name}</p>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-gray-600">{user.phone}</p>
                            <button onClick={() => setActiveTab('settings')} className="text-naaz-gold hover:underline mt-3 text-sm">
                              Edit
                            </button>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Default Shipping Address</h4>
                            <p className="text-gray-600">123 Main Street</p>
                            <p className="text-gray-600">Park Avenue</p>
                            <p className="text-gray-600">Kolkata, West Bengal, 700001</p>
                            <p className="text-gray-600">India</p>
                            <button onClick={() => setActiveTab('settings')} className="text-naaz-gold hover:underline mt-3 text-sm">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">My Orders</h2>
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
                              Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-naaz-green">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'Delivered' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.items} items
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{order.total.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-naaz-gold hover:text-naaz-green">View</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Other tabs can be implemented similarly */}
                {activeTab === 'wishlist' && (
                  <div>
                    <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">My Wishlist</h2>
                    <p className="text-gray-600">Your saved items will appear here.</p>
                    {/* Wishlist content */}
                  </div>
                )}
                
                {activeTab === 'payment' && (
                  <div>
                    <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Payment Methods</h2>
                    <p className="text-gray-600">Your saved payment methods will appear here.</p>
                    {/* Payment methods content */}
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Account Settings</h2>
                    <p className="text-gray-600">Update your account information and preferences.</p>
                    {/* Settings content */}
                  </div>
                )}
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
