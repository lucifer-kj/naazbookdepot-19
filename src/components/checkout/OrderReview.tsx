
import React from 'react';
import { Loader2 } from 'lucide-react';

interface OrderReviewProps {
  shippingData: any;
  paymentData: any;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
}

const OrderReview: React.FC<OrderReviewProps> = ({ 
  shippingData, 
  paymentData, 
  onBack, 
  onPlaceOrder,
  isPlacingOrder = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
        Review Your Order
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-naaz-green mb-2">Shipping Address</h3>
          <div className="text-gray-700">
            <p>{shippingData?.name}</p>
            <p>{shippingData?.address}</p>
            <p>{shippingData?.city}, {shippingData?.state} {shippingData?.pincode}</p>
            <p>{shippingData?.phone}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-naaz-green mb-2">Payment Method</h3>
          <p className="text-gray-700">{paymentData?.method}</p>
        </div>
        
        <div className="bg-naaz-gold/10 p-4 rounded-lg">
          <p className="text-naaz-green font-medium text-center">
            "And it is He who sends down rain from the sky, and We produce thereby the vegetation of every kind" - Quran 6:99
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">
            May Allah bless your purchase and increase your knowledge
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 border border-naaz-green text-naaz-green py-3 rounded-lg hover:bg-naaz-green/5 transition-colors disabled:opacity-50"
          disabled={isPlacingOrder}
        >
          Back to Payment
        </button>
        <button
          onClick={onPlaceOrder}
          className="flex-1 bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderReview;
