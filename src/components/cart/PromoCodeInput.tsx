
import React, { useState } from 'react';
import { Tag } from 'lucide-react';

interface PromoCodeInputProps {
  onApplyPromo: (code: string) => void;
  appliedPromo?: string;
  discount?: number;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ 
  onApplyPromo, 
  appliedPromo, 
  discount = 0 
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplying(true);
    try {
      await onApplyPromo(promoCode);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <Tag size={16} className="text-naaz-green mr-2" />
        <span className="font-medium text-naaz-green">Promo Code</span>
      </div>
      
      {appliedPromo ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
          <div>
            <span className="text-green-800 font-medium">{appliedPromo}</span>
            <p className="text-green-600 text-sm">Discount: ₹{discount}</p>
          </div>
          <button
            onClick={() => onApplyPromo('')}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-naaz-green"
          />
          <button
            onClick={handleApplyPromo}
            disabled={!promoCode.trim() || isApplying}
            className="px-4 py-2 bg-naaz-green text-white rounded hover:bg-naaz-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
