import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderFeedbackForm from '@/components/order/OrderFeedbackForm';
import { orderTrackingService } from '@/lib/services/orderTrackingService';
import { OrderTrackingInfo, OrderStatus, OrderTimeline } from '@/types/order';

const OrderTracking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      loadTrackingInfo();
    }
  }, [orderNumber, loadTrackingInfo]);

  const loadTrackingInfo = useCallback(async () => {
    if (!orderNumber) return;

    try {
      setLoading(true);
      setError(null);
      const info = await orderTrackingService.getOrderTrackingInfo(orderNumber);
      
      if (!info) {
        setError('Order not found. Please check your order number.');
        return;
      }

      setTrackingInfo(info);
    } catch (err) {
      console.error('Error loading tracking info:', err);
      setError('Failed to load order tracking information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrackingInfo();
    setRefreshing(false);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'pending_payment_verification':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'pending_payment_verification':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
      case 'refunded':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'pending_payment_verification':
        return 'Payment Verification Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return 'Unknown Status';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadTrackingInfo}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trackingInfo) {
    return null;
  }

  const { order, timeline, delivery_estimate, tracking_number, carrier } = trackingInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  </div>
                  {tracking_number && (
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">{tracking_number}</p>
                        {carrier && (
                          <a
                            href={carrier.tracking_url_template.replace('{tracking_number}', tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {delivery_estimate && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delivery</p>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <p className="font-medium">
                          {formatDate(delivery_estimate.estimated_date)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {delivery_estimate.min_days}-{delivery_estimate.max_days} business days
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>{(order.shipping_address as unknown).name}</p>
                      <p>{(order.shipping_address as unknown).address_line_1}</p>
                      {(order.shipping_address as unknown).address_line_2 && (
                        <p>{(order.shipping_address as unknown).address_line_2}</p>
                      )}
                      <p>
                        {(order.shipping_address as unknown).city}, {(order.shipping_address as unknown).state} {(order.shipping_address as unknown).postal_code}
                      </p>
                      <p>{(order.shipping_address as unknown).country}</p>
                      {(order.shipping_address as unknown).phone && (
                        <p className="flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {(order.shipping_address as unknown).phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h2>
                <div className="space-y-6">
                  {timeline.map((event: OrderTimeline, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                          {getStatusIcon(event.status)}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 mx-auto mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {event.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </p>
                        )}
                        {event.carrier_info && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600">
                              Carrier: {event.carrier_info.name}
                            </p>
                            {event.carrier_info.tracking_url && (
                              <a
                                href={event.carrier_info.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                              >
                                Track with carrier
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.order_items.map((item: unknown) => (
                    <div key={item.id} className="flex items-center space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  {order.shipping_amount > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Shipping</span>
                      <span>{formatCurrency(order.shipping_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Need Help?</h3>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@naaz.com"
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </a>
                    <a
                      href="tel:+911234567890"
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Feedback Form - Show only for delivered orders */}
          {order.status === 'delivered' && (
            <div className="mt-6">
              <OrderFeedbackForm 
                orderId={order.id} 
                orderNumber={order.order_number} 
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
