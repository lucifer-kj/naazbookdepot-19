import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { verifyPayment } from "@/lib/services/payment-service";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useClearCart } from "@/lib/services/cart";

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const clearCartMutation = useClearCart();
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function verifyOrder() {
      if (!sessionId) {
        setError("Missing session information");
        setLoading(false);
        return;
      }
      
      try {
        const paymentData = await verifyPayment(sessionId);
        setOrderData(paymentData.order);
        
        // Clear the cart after successful payment
        clearCartMutation.mutate();
      } catch (err) {
        console.error("Verification error:", err);
        setError("Could not verify payment status. Please contact customer support.");
      } finally {
        setLoading(false);
      }
    }
    
    verifyOrder();
  }, [sessionId, clearCartMutation]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-10 px-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-naaz-green mb-4" />
                <CardTitle className="text-2xl mb-2">Verifying Your Order</CardTitle>
                <CardDescription>Please wait while we confirm your payment...</CardDescription>
              </div>
            ) : error ? (
              <div className="text-center">
                <CardTitle className="text-2xl text-red-600 mb-2">Payment Verification Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-2xl mb-2">Order Placed Successfully!</CardTitle>
                <CardDescription>Thank you for your purchase.</CardDescription>
              </div>
            )}
          </CardHeader>
          
          {!loading && !error && orderData && (
            <>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Order Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium">{orderData.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(orderData.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">{orderData.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">₹{orderData.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                  <div className="border rounded-md divide-y">
                    {orderData.order_items.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center">
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    A confirmation email has been sent to your email address.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center gap-4 pt-6">
                <Button onClick={() => navigate("/")}>
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          )}
          
          {!loading && error && (
            <CardFooter className="flex justify-center pt-6">
              <Button onClick={() => navigate("/checkout")}>
                Return to Checkout
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
