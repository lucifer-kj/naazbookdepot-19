
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Package, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get('orderNumber');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!orderNumber) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green mx-auto mb-4"></div>
            <p className="text-naaz-green font-medium">Processing your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle size={48} className="text-green-600" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">
              Alhamdulillah! Order Confirmed
            </h1>
            
            <p className="text-xl text-gray-700 mb-2">
              Thank you for your order with Naaz Book Depot
            </p>
            
            <div className="bg-naaz-gold/20 p-4 rounded-lg inline-block mb-8">
              <p className="text-naaz-green font-medium">
                "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth." - Quran 6:73
              </p>
              <p className="text-sm text-gray-600 mt-2">
                May Allah bless your journey of seeking knowledge
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-2">
                Order Details
              </h2>
              <div className="text-3xl font-bold text-naaz-gold">
                {orderNumber}
              </div>
              <p className="text-gray-600 mt-2">
                Order placed on {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-naaz-green/5 rounded-lg">
                <Package className="mx-auto text-naaz-green mb-2" size={32} />
                <h3 className="font-semibold text-naaz-green mb-1">Processing</h3>
                <p className="text-sm text-gray-600">Order being prepared</p>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <Package className="mx-auto text-gray-400 mb-2" size={32} />
                <h3 className="font-semibold text-gray-400 mb-1">Shipped</h3>
                <p className="text-sm text-gray-600">In 1-2 business days</p>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <Package className="mx-auto text-gray-400 mb-2" size={32} />
                <h3 className="font-semibold text-gray-400 mb-1">Delivered</h3>
                <p className="text-sm text-gray-600">Within 5-7 business days</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-naaz-green mb-4">What's Next?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-naaz-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                  <span>You'll receive an email confirmation with your order details within 5 minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-naaz-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                  <span>We'll send you tracking information once your order ships</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-naaz-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                  <span>Your Islamic books will be carefully packaged with a blessing note</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-playfair font-semibold text-naaz-green mb-4">Order Actions</h3>
              <div className="space-y-3">
                <button className="flex items-center justify-between w-full p-3 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green/5 transition-colors">
                  <span>Download Invoice</span>
                  <Download size={18} />
                </button>
                <button className="flex items-center justify-between w-full p-3 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green/5 transition-colors">
                  <span>Track Order</span>
                  <Package size={18} />
                </button>
                <button className="flex items-center justify-between w-full p-3 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green/5 transition-colors">
                  <span>Share Order</span>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-playfair font-semibold text-naaz-green mb-4">Need Help?</h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-medium">Customer Support</p>
                  <p className="text-sm">+91 98765 43210</p>
                </div>
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm">orders@naazbookdepot.com</p>
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">
                Continue Your Journey of Knowledge
              </h3>
              <p className="text-gray-600 mb-6">
                Discover more Islamic books and continue building your library
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/books')}
                  className="flex items-center justify-center px-6 py-3 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors"
                >
                  Browse More Books
                  <ArrowRight size={18} className="ml-2" />
                </button>
                <button
                  onClick={() => navigate('/account')}
                  className="flex items-center justify-center px-6 py-3 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green/5 transition-colors"
                >
                  View My Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
