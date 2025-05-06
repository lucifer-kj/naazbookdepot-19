
import { fetchStrapi } from '../strapi-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StrapiOrderItem {
  id: string;
  product: string; // Product ID
  quantity: number;
  price: number;
  variant?: string;
}

export interface StrapiAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface StrapiOrder {
  id: string;
  user?: {
    data: {
      id: number;
    };
  };
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: StrapiOrderItem[];
  shippingAddress: StrapiAddress;
  billingAddress: StrapiAddress;
  subTotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new order
export async function createOrder(orderData: Omit<StrapiOrder, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>) {
  try {
    return fetchStrapi<StrapiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify({ data: orderData }),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get orders for the current user
export async function fetchUserOrders() {
  // Use the 'me' endpoint to get current user's orders
  try {
    return fetchStrapi<StrapiOrder[]>('/orders/me?populate=items,items.product');
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

// Get a specific order by ID
export async function fetchOrderById(id: string) {
  try {
    return fetchStrapi<StrapiOrder>(`/orders/${id}?populate=items,items.product`);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Query hooks for orders
export function useUserOrders() {
  return useQuery({
    queryKey: ['orders', 'user'],
    queryFn: fetchUserOrders,
  });
}

export function useOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id || ''),
    enabled: !!id,
  });
}

// Mutation hook for creating an order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      toast.success(`Order #${data.orderNumber} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
}
