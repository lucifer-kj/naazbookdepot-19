
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Clock, CreditCard, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const paymentType = searchParams.get('payment');
  const status = searchParams.get('status');

  const isPendingVerification = paymentType === 'upi' && status === 'pending';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 md:py-16 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <div className="mb-6 md:mb-8">
              {isPendingVerification ? (
                <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
              ) : (
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              )}
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green mb-2">
                {isPendingVerification ? 'Order Submitted!' : 'Order Confirmed!'}
              </h1>
              {isPendingVerification ? (
                <p className="text-gray-600 text-sm md:text-base px-2">
                  Your order has been submitted and is awaiting payment verification
                </p>
              ) : (
                <p className="text-gray-600 text-sm md:text-base px-2">
                  Thank you for your order. We're preparing your items for shipment.
                </p>
              )}
            </div>

            <div className="bg-naaz-gold/10 p-4 md:p-6 rounded-lg mb-6 md:mb-8">
              <h2 className="text-base md:text-lg font-semibold text-naaz-green mb-2">
                Order Number
              </h2>
              <p className="text-xl md:text-2xl font-mono font-bold text-naaz-gold break-all">
                {orderNumber}
              </p>
            </div>

            {isPendingVerification ? (
              <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="text-yellow-600 mr-2" size={18} />
                    <span className="font-medium text-yellow-800 text-sm md:text-base">Payment Verification Pending</span>
                  </div>
                  <p className="text-xs md:text-sm text-yellow-700 px-2">
                    Our team is verifying your UPI payment. You will receive a confirmation email within 2-4 hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-naaz-green/5 p-3 md:p-4 rounded-lg">
                    <CreditCard className="text-naaz-green mb-2 mx-auto md:mx-0" size={20} />
                    <h3 className="font-semibold text-naaz-green mb-1 text-sm md:text-base">Payment Status</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Under verification by our admin team
                    </p>
                  </div>
                  <div className="bg-naaz-green/5 p-3 md:p-4 rounded-lg">
                    <Package className="text-naaz-green mb-2 mx-auto md:mx-0" size={20} />
                    <h3 className="font-semibold text-naaz-green mb-1 text-sm md:text-base">Next Steps</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Order will be processed after payment verification
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-naaz-green/5 p-3 md:p-4 rounded-lg">
                    <Package className="text-naaz-green mb-2 mx-auto md:mx-0" size={20} />
                    <h3 className="font-semibold text-naaz-green mb-1 text-sm md:text-base">Processing</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Your order is being prepared for shipment
                    </p>
                  </div>
                  <div className="bg-naaz-green/5 p-3 md:p-4 rounded-lg">
                    <CreditCard className="text-naaz-green mb-2 mx-auto md:mx-0" size={20} />
                    <h3 className="font-semibold text-naaz-green mb-1 text-sm md:text-base">Payment</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Cash on Delivery - Pay when you receive
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-naaz-gold/10 p-3 md:p-4 rounded-lg mb-6 md:mb-8">
              <p className="text-naaz-green font-medium text-center text-sm md:text-base px-2">
                "And it is He who sends down rain from the sky, and We produce thereby the vegetation of every kind" - Quran 6:99
              </p>
              <p className="text-xs md:text-sm text-gray-600 text-center mt-2 px-2">
                May Allah bless your purchase and increase your knowledge
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <button
                onClick={() => navigate('/account')}
                className="w-full bg-naaz-green text-white py-2 md:py-3 rounded-lg hover:bg-naaz-green/90 transition-colors text-sm md:text-base"
              >
                Track Your Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-naaz-green text-naaz-green py-2 md:py-3 rounded-lg hover:bg-naaz-green/5 transition-colors text-sm md:text-base"
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
