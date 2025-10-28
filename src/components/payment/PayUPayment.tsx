import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CreditCard, Smartphone, QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import { payuService, PayUPaymentRequest } from '../../lib/services/payuService';
import { toast } from 'sonner';

interface PayUPaymentProps {
  orderId: string;
  amount: number;
  customerInfo: {
    firstName: string;
    email: string;
    phone: string;
  };
  productInfo: string;
  onSuccess: (transactionId: string) => void;
  onFailure: (error: string) => void;
}

export const PayUPayment: React.FC<PayUPaymentProps> = ({
  orderId,
  amount,
  customerInfo,
  productInfo,
  onSuccess,
  onFailure
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const handleCardPayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const paymentData: PayUPaymentRequest = {
        orderId,
        amount,
        productInfo,
        firstName: customerInfo.firstName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        udf1: 'card_payment'
      };

      const { formData } = await payuService.createPayment(paymentData);

      // Create and submit form to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${import.meta.env.VITE_PAYU_BASE_URL || 'https://test.payu.in'}/_payment`;

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

    } catch (error) {
      console.error('Card payment error:', error);
      setPaymentStatus('failed');
      onFailure('Failed to initiate card payment');
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    if (!payuService.validateUPIId(upiId)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const result = await payuService.processUPIPayment({
        orderId,
        amount,
        upiId
      });

      if (result.success) {
        setQrCode(result.qrCode || null);
        setDeepLink(result.deepLink || null);
        toast.success('UPI payment initiated. Please complete the payment in your UPI app.');
        
        // Start polling for payment status
        startPaymentStatusPolling();
      } else {
        throw new Error(result.error || 'UPI payment failed');
      }
    } catch (error) {
      console.error('UPI payment error:', error);
      setPaymentStatus('failed');
      onFailure('Failed to process UPI payment');
      toast.error('Failed to process UPI payment');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await payuService.verifyPayment('', orderId);
        
        if (status.status === 'success') {
          clearInterval(pollInterval);
          setPaymentStatus('success');
          onSuccess(status.transactionId);
          toast.success('Payment completed successfully!');
        } else if (status.status === 'failure') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          onFailure(status.error || 'Payment failed');
          toast.error('Payment failed');
        }
      } catch (error) {
        console.error('Payment status polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('failed');
        onFailure('Payment timeout - please check your payment status');
        toast.error('Payment verification timeout');
      }
    }, 300000);
  };

  const openUPIApp = () => {
    if (deepLink) {
      window.open(deepLink, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            PayU Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card Payment
              </Button>
              <Button
                variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('upi')}
                className="flex-1"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                UPI Payment
              </Button>
            </div>

            {/* Payment Amount Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-2xl font-bold text-green-600">₹{amount.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Order ID: {orderId}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <Card>
          <CardHeader>
            <CardTitle>Credit/Debit Card Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment</p>
                    <p>You will be redirected to PayU's secure payment page to complete your transaction.</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCardPayment}
                disabled={loading || paymentStatus === 'processing'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to PayU...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{amount.toFixed(2)} with Card
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UPI Payment Form */}
      {paymentMethod === 'upi' && (
        <Card>
          <CardHeader>
            <CardTitle>UPI Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!qrCode ? (
                <>
                  <div>
                    <Label htmlFor="upiId">Enter your UPI ID</Label>
                    <Input
                      id="upiId"
                      type="text"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Example: yourname@paytm, yourname@phonepe, yourname@googlepay
                    </p>
                  </div>

                  <Button
                    onClick={handleUPIPayment}
                    disabled={loading || !upiId || paymentStatus === 'processing'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        Pay ₹{amount.toFixed(2)} with UPI
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800">UPI Payment Initiated</p>
                    <p className="text-sm text-green-700">Scan the QR code or open in your UPI app</p>
                  </div>

                  {qrCode && (
                    <div className="flex flex-col items-center space-y-4">
                      <img
                        src={qrCode}
                        alt="UPI QR Code"
                        className="w-64 h-64 border rounded-lg"
                      />
                      
                      {deepLink && (
                        <Button
                          onClick={openUPIApp}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Open in UPI App
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>Waiting for payment confirmation...</p>
                    <p>This may take a few moments.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      {paymentStatus === 'processing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing payment...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === 'success' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Payment completed successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === 'failed' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Payment failed. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};