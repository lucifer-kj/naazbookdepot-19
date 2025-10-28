import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Shield, AlertTriangle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { PayUPayment } from './PayUPayment';
import { PayPalPayment } from './PayPalPayment';
import { paymentOrchestrator, PaymentMethod, PaymentRequest } from '../../lib/services/paymentOrchestrator';
import { toast } from 'sonner';

interface UnifiedPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
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
  onSuccess: (transactionId: string, paymentMethod: string) => void;
  onFailure: (error: string) => void;
}

export const UnifiedPayment: React.FC<UnifiedPaymentProps> = ({
  orderId,
  amount,
  currency,
  customerInfo,
  shippingAddress,
  productInfo,
  onSuccess,
  onFailure
}) => {
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [userLocation, setUserLocation] = useState<string>('IN');

  useEffect(() => {
    initializePaymentMethods();
  }, [currency, customerInfo.country]);

  const initializePaymentMethods = async () => {
    setLoading(true);
    try {
      // Detect user location
      const location = await paymentOrchestrator.detectUserLocation();
      setUserLocation(location);

      // Get available payment methods
      const methods = paymentOrchestrator.getAvailablePaymentMethods(location, currency);
      setAvailablePaymentMethods(methods);

      // Auto-select the first available method
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Error initializing payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentStatus('idle');
  };

  const calculateTotalWithFees = (methodId: string) => {
    const { fees, total } = paymentOrchestrator.calculateFees(amount, methodId);
    return { fees, total };
  };

  const handleCODPayment = async () => {
    setProcessing(true);
    setPaymentStatus('processing');

    try {
      const paymentRequest: PaymentRequest = {
        orderId,
        amount,
        currency,
        customerInfo,
        shippingAddress,
        productInfo
      };

      const result = await paymentOrchestrator.processPayment(paymentRequest, 'cod');
      
      if (result.success) {
        setPaymentStatus('success');
        onSuccess(result.transactionId || '', 'cod');
        toast.success('Order placed successfully! Pay on delivery.');
      } else {
        throw new Error(result.error || 'COD payment failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      onFailure(error instanceof Error ? error.message : 'COD payment failed');
      toast.error('Failed to place COD order');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const iconMap: Record<string, React.ReactNode> = {
      'cod': <span className="text-2xl">💵</span>,
      'payu_upi': <span className="text-2xl">📱</span>,
      'payu_card': <CreditCard className="w-6 h-6" />,
      'paypal': <span className="text-2xl">🌐</span>
    };
    return iconMap[method.id] || <CreditCard className="w-6 h-6" />;
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    const colorMap: Record<string, string> = {
      'cod': 'bg-green-50 border-green-200 hover:bg-green-100',
      'payu_upi': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      'payu_card': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      'paypal': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    };
    return colorMap[method.id] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availablePaymentMethods.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods Available</h3>
            <p className="text-gray-600">Please contact support for assistance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedMethod = availablePaymentMethods.find(m => m.id === selectedPaymentMethod);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Choose Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {availablePaymentMethods.map((method) => {
              const { fees, total } = calculateTotalWithFees(method.id);
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : getPaymentMethodColor(method)
                  }`}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(method)}
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {method.processingTime}
                          </Badge>
                          {method.type === 'international' && (
                            <Badge variant="secondary" className="text-xs">
                              International
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {currency} {total.toFixed(2)}
                      </div>
                      {fees > 0 && (
                        <div className="text-xs text-gray-500">
                          +{currency} {fees.toFixed(2)} fees
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Payment Method Details */}
      {selectedMethod && (
        <div>
          {selectedMethod.id === 'cod' && (
            <Card>
              <CardHeader>
                <CardTitle>Cash on Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Pay on Delivery</p>
                        <p>You can pay in cash when your order is delivered to your doorstep.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Order Amount:</span>
                      <span className="font-semibold">{currency} {amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment Fees:</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Amount:</span>
                      <span>{currency} {amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCODPayment}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - ${currency} ${amount.toFixed(2)}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(selectedMethod.id === 'payu_upi' || selectedMethod.id === 'payu_card') && (
            <PayUPayment
              orderId={orderId}
              amount={amount}
              customerInfo={{
                firstName: customerInfo.firstName,
                email: customerInfo.email,
                phone: customerInfo.phone
              }}
              productInfo={productInfo}
              onSuccess={(transactionId) => onSuccess(transactionId, selectedMethod.id)}
              onFailure={onFailure}
            />
          )}

          {selectedMethod.id === 'paypal' && (
            <PayPalPayment
              orderId={orderId}
              amount={amount}
              customerInfo={customerInfo}
              shippingAddress={shippingAddress}
              productInfo={productInfo}
              onSuccess={(transactionId) => onSuccess(transactionId, 'paypal')}
              onFailure={onFailure}
            />
          )}
        </div>
      )}

      {/* Security Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-2" />
            <span>
              Your payment information is secure and encrypted. We use industry-standard security measures to protect your data.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};