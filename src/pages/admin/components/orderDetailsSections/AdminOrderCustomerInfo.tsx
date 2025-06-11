import React from 'react';
import { User } from 'lucide-react'; // Assuming User icon is needed
import type { OrderWithItems } from '@/lib/hooks/useOrders'; // Adjust path as needed

interface AdminOrderCustomerInfoProps {
  order: OrderWithItems; // Or a more specific type containing customer related fields
}

const AdminOrderCustomerInfo: React.FC<AdminOrderCustomerInfoProps> = ({ order }) => {
  const shippingAddress = order.shipping_address as any; // Type assertion for easier access
  const billingAddress = order.billing_address as any;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
        <User className="mr-3 h-6 w-6 text-naaz-green" /> Customer Details
      </h2>
      {order.users && (
        <p className="text-sm text-gray-700 mb-2">
          <strong>Registered User:</strong> {order.users.full_name || order.users.email} (ID: {order.users.id})
        </p>
      )}
      <p className="text-sm text-gray-700"><strong>Name:</strong> {shippingAddress?.name || 'N/A'}</p>
      <p className="text-sm text-gray-700"><strong>Email:</strong> {order.customer_email || shippingAddress?.email || 'N/A'}</p>
      <p className="text-sm text-gray-700"><strong>Phone:</strong> {order.customer_phone || shippingAddress?.phone || 'N/A'}</p>

      <div className="mt-3">
        <h3 className="text-md font-semibold text-gray-600 mb-1">Shipping Address:</h3>
        <address className="text-sm text-gray-700 not-italic">
          {shippingAddress?.name && <>{shippingAddress.name}<br /></>}
          {shippingAddress?.address || 'N/A'}<br />
          {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.pincode}<br />
          {shippingAddress?.country || 'India'}
        </address>
      </div>

      {billingAddress && (Object.keys(billingAddress).length > 0 && JSON.stringify(shippingAddress) !== JSON.stringify(billingAddress)) && (
        <div className="mt-3">
          <h3 className="text-md font-semibold text-gray-600 mb-1">Billing Address:</h3>
          <address className="text-sm text-gray-700 not-italic">
            {billingAddress?.name && <>{billingAddress.name}<br /></>}
            {billingAddress?.address}<br />
            {billingAddress?.city}, {billingAddress?.state} {billingAddress?.pincode}<br />
            {billingAddress?.country || 'India'}
          </address>
        </div>
      )}
    </div>
  );
};

export default AdminOrderCustomerInfo;
