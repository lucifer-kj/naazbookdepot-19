
import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, Wallet } from 'lucide-react';

interface PaymentFormProps {
  shippingData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ shippingData, onComplete, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Smartphone,
      description: 'Pay instantly with UPI apps',
      blessing: 'Swift and secure, Alhamdulillah'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when you receive your order',
      blessing: 'Honest trade, blessed by Allah'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Secure card payment',
      blessing: 'Protected by divine providence'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Paytm, PhonePe, Google Pay',
      blessing: 'Digital ease with Allah\'s grace'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    onComplete({ 
      method: selectedMethod?.name,
      type: paymentMethod,
      ...cardData
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="text-naaz-green mr-3" size={24} />
        <h2 className="text-xl font-playfair font-semibold text-naaz-green">
          Payment Method
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === method.id
                    ? 'border-naaz-green bg-naaz-green/5'
                    : 'border-gray-200 hover:border-naaz-green/50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-naaz-green"
                  />
                  <Icon className="ml-3 text-naaz-green" size={20} />
                  <div className="ml-3">
                    <div className="font-medium text-naaz-green">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.description}
                    </div>
                    <div className="text-xs text-naaz-gold italic">
                      {method.blessing}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {paymentMethod === 'upi' && (
          <div className="bg-naaz-green/5 p-4 rounded-lg">
            <h3 className="font-medium text-naaz-green mb-2">UPI Payment</h3>
            <p className="text-gray-700 text-sm">
              You will be redirected to a secure UPI payment page where you can scan a QR code 
              or use your UPI app to complete the payment instantly.
            </p>
            <p className="text-naaz-gold text-xs mt-2 italic">
              "And whoever relies upon Allah - then He is sufficient for him" - Quran 65:3
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-naaz-green">Card Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name as on card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="bg-naaz-gold/10 p-4 rounded-lg">
            <h3 className="font-medium text-naaz-green mb-2">Cash on Delivery</h3>
            <p className="text-gray-700 text-sm">
              You will pay ₹25 additional handling fee for Cash on Delivery orders.
              Please keep exact change ready for a smooth transaction.
            </p>
            <p className="text-naaz-gold text-xs mt-2 italic">
              "And give full measure when you measure, and weigh with an even balance" - Quran 17:35
            </p>
          </div>
        )}

        <div className="bg-naaz-green/5 p-4 rounded-lg">
          <div className="flex items-center justify-center text-naaz-green mb-2">
            <CreditCard size={20} className="mr-2" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-naaz-green text-naaz-green py-3 rounded-lg hover:bg-naaz-green/5 transition-colors"
          >
            Back to Shipping
          </button>
          <button
            type="submit"
            className="flex-1 bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
          >
            {paymentMethod === 'upi' ? 'Proceed to UPI Payment' : 'Review Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
