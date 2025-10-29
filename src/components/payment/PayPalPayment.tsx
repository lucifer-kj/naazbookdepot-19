import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, CreditCard, Globe, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { paypalService, PayPalOrderRequest } from '../../lib/services/paypalService';
import { toast } from 'sonner';

interface PayPalPaymentProps {
  orderId: string;
  amount: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  };
  productInfo: string;
  onSuccess: (transactionId: string) => void;
  onFailure: (error: string) => void;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  orderId,
  amount,
  customerInfo,
  shippingAddress,
  productInfo,
  onSuccess,
  onFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'pending' | 'success' | 'failed'>('idle');
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  const supportedCurrencies = paypalService.getSupportedCurrencies();

  // Currency conversion rates (in production, use real-time rates)
  const conversionRates: Record<string, number> = {
    'USD': 0.012,
    'EUR': 0.011,
    'GBP': 0.0095,
    'CAD': 0.016,
    'AUD': 0.018,
    'JPY': 1.8
  };

  useEffect(() => {
    // Detect user's currency on component mount
    paypalService.detectUserCurrency().then(currency => {
      if (supportedCurrencies.includes(currency)) {
        setSelectedCurrency(currency);
      }
    });
  }, []);

  useEffect(() => {
    // Update converted amount when currency changes
    const rate = conversionRates[selectedCurrency] || conversionRates['USD'];
    const converted = Math.round(amount * rate * 100) / 100;
    setConvertedAmount(converted);
  }, [amount, selectedCurrency]);

  const createPayPalOrder = async () => {
    setLoading(true);
    setPaymentStatus('creating');

    try {
      const orderRequest: PayPalOrderRequest = {
        orderId,
        amount,
        currency: selectedCurrency,
        description: productInfo,
        customerInfo,
        shippingAddress
      };

      const paypalOrder = await paypalService.createOrder(orderRequest);
      setPaypalOrderId(paypalOrder.id);

      // Find approval URL
      const approvalLink = paypalOrder.links.find(link => link.rel === 'approve');
      if (approvalLink) {
        setApprovalUrl(approvalLink.href);
        setPaymentStatus('pending');
        toast.success('PayPal order created. Please complete the payment.');
      } else {
        throw new Error('No approval URL found in PayPal response');
      }
    } catch (error) {
      console.error('PayPal order creation error:', error);
      setPaymentStatus('failed');
      onFailure(error instanceof Error ? error.message : 'Failed to create PayPal order');
      toast.error('Failed to create PayPal order');
    } finally {
      setLoading(false);
    }
  };

  const openPayPalCheckout = () => {
    if (approvalUrl) {
      // Open PayPal in a new window
      const paypalWindow = window.open(
        approvalUrl,
        'paypal-checkout',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for window closure to detect completion
      const pollTimer = setInterval(() => {
        if (paypalWindow?.closed) {
          clearInterval(pollTimer);
          // Check payment status after window closes
          checkPaymentStatus();
        }
      }, 1000);

      // Stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollTimer);
        if (paypalWindow && !paypalWindow.closed) {
          paypalWindow.close();
        }
      }, 600000);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paypalOrderId) return;

    try {
      const orderDetails = await paypalService.getOrderDetails(paypalOrderId);
      
      if (orderDetails.status === 'APPROVED') {
        // Capture the payment
        const capture = await paypalService.capturePayment(paypalOrderId);
        
        if (capture.status === 'COMPLETED') {
          setPaymentStatus('success');
          onSuccess(capture.id);
          toast.success('PayPal payment completed successfully!');
        } else {
          throw new Error('Payment capture failed');
        }
      } else if (orderDetails.status === 'CANCELLED') {
        setPaymentStatus('failed');
        onFailure('Payment was cancelled');
        toast.error('Payment was cancelled');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setPaymentStatus('failed');
      onFailure('Failed to verify payment status');
      toast.error('Failed to verify payment status');
    }
  };

  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥'
    };
    return symbols[currency] || '$';
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* PayPal Payment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            PayPal International Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Currency</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      <div className="flex items-center">
                        <span className="mr-2">{getCurrencySymbol(currency)}</span>
                        <span>{currency}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Original Amount (INR):</span>
                <span className="font-medium">₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatAmount(convertedAmount, selectedCurrency)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Exchange rate is approximate and may vary at the time of payment
              </div>
            </div>

            {/* Order Information */}
            <div className="text-sm text-gray-600">
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Description:</strong> {productInfo}</p>
            </div>

            {/* Payment Status */}
            {paymentStatus === 'idle' && (
              <Button
                onClick={createPayPalOrder}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating PayPal Order...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pay {formatAmount(convertedAmount, selectedCurrency)} with PayPal
                  </>
                )}
              </Button>
            )}

            {paymentStatus === 'pending' && approvalUrl && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">PayPal Order Created</p>
                      <p>Click the button below to complete your payment on PayPal's secure checkout page.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={openPayPalCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Complete Payment on PayPal
                </Button>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={checkPaymentStatus}
                    className="text-sm"
                  >
                    Check Payment Status
                  </Button>
                </div>
              </div>
            )}

            {paymentStatus === 'creating' && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Creating PayPal order...</span>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Payment Successful!</p>
                    <p>Your PayPal payment has been processed successfully.</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Payment Failed</p>
                    <p>There was an issue processing your PayPal payment. Please try again.</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setPaymentStatus('idle');
                    setPaypalOrderId(null);
                    setApprovalUrl(null);
                  }}
                  variant="outline"
                  className="mt-3 w-full"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* PayPal Benefits */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Why choose PayPal?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Secure international payments</li>
                <li>• Buyer protection included</li>
                <li>• Multiple currency support</li>
                <li>• No need to share card details</li>
                <li>• Instant payment confirmation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
