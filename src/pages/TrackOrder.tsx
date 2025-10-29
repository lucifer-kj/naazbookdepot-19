import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTrackingSearch from '@/components/order/OrderTrackingSearch';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const TrackOrder = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-gray-600">
              Enter your order number below to get real-time updates on your order status and delivery information.
            </p>
          </div>

          {/* Order Tracking Search */}
          <OrderTrackingSearch className="mb-8" />

          {/* How it works */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How Order Tracking Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Order Placed</h3>
                <p className="text-xs text-gray-600">Your order is confirmed and being processed</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Processing</h3>
                <p className="text-xs text-gray-600">Your items are being prepared for shipment</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Shipped</h3>
                <p className="text-xs text-gray-600">Your order is on its way to you</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Delivered</h3>
                <p className="text-xs text-gray-600">Your order has been delivered</p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Order numbers are typically 8-12 characters long and start with "ORD"</p>
              <p>• You can find your order number in your confirmation email</p>
              <p>• Tracking information is updated every few hours</p>
              <p>• For urgent queries, contact our support team</p>
            </div>
            <div className="mt-4">
              <a
                href="/contact"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
