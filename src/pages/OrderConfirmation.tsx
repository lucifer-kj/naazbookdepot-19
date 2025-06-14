
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Clock, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const paymentType = searchParams.get('payment');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-8">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-2">
                {paymentType === 'upi' ? 'Payment Submitted!' : 'Order Confirmed!'}
              </h1>
              {paymentType === 'upi' ? (
                <p className="text-gray-600">
                  Your payment has been submitted and is pending verification
                </p>
              ) : (
                <p className="text-gray-600">
                  Thank you for your order. We're preparing your items for shipment.
                </p>
              )}
            </div>

            <div className="bg-naaz-gold/10 p-6 rounded-lg mb-8">
              <h2 className="text-lg font-semibold text-naaz-green mb-2">
                Order Number
              </h2>
              <p className="text-2xl font-mono font-bold text-naaz-gold">
                {orderNumber}
              </p>
            </div>

            {paymentType === 'upi' ? (
              <div className="space-y-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="text-yellow-600 mr-2" size={20} />
                    <span className="font-medium text-yellow-800">Verification Pending</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Our team is verifying your UPI payment. You will receive a confirmation email within 2-4 hours.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-naaz-green/5 p-4 rounded-lg">
                    <CreditCard className="text-naaz-green mb-2" size={24} />
                    <h3 className="font-semibold text-naaz-green mb-1">Payment Status</h3>
                    <p className="text-sm text-gray-600">
                      Under verification by our admin team
                    </p>
                  </div>
                  <div className="bg-naaz-green/5 p-4 rounded-lg">
                    <Package className="text-naaz-green mb-2" size={24} />
                    <h3 className="font-semibold text-naaz-green mb-1">Next Steps</h3>
                    <p className="text-sm text-gray-600">
                      Order will be processed after payment verification
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-naaz-green/5 p-4 rounded-lg">
                    <Package className="text-naaz-green mb-2" size={24} />
                    <h3 className="font-semibold text-naaz-green mb-1">Processing</h3>
                    <p className="text-sm text-gray-600">
                      Your order is being prepared for shipment
                    </p>
                  </div>
                  <div className="bg-naaz-green/5 p-4 rounded-lg">
                    <CreditCard className="text-naaz-green mb-2" size={24} />
                    <h3 className="font-semibold text-naaz-green mb-1">Payment</h3>
                    <p className="text-sm text-gray-600">
                      Cash on Delivery - Pay when you receive
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-naaz-gold/10 p-4 rounded-lg mb-8">
              <p className="text-naaz-green font-medium text-center">
                "And it is He who sends down rain from the sky, and We produce thereby the vegetation of every kind" - Quran 6:99
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                May Allah bless your purchase and increase your knowledge
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/account')}
                className="w-full bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
              >
                Track Your Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-naaz-green text-naaz-green py-3 rounded-lg hover:bg-naaz-green/5 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
