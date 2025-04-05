
import fetchAPI from './wordpress-client';
import { toast } from "sonner";

export interface OrderInput {
  paymentMethod: string;
  paymentMethodTitle: string;
  customerNote?: string;
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  lineItems: {
    productId: number;
    quantity: number;
    variationId?: number;
  }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: string;
  lineItems: {
    nodes: {
      productId: number;
      quantity: number;
      total: string;
      product: {
        node: {
          name: string;
          slug: string;
        };
      };
    }[];
  };
}

// Create a new order
export async function createOrder(orderData: OrderInput) {
  try {
    // Transform order data to match the GraphQL input format
    const lineItems = orderData.lineItems.map(item => {
      const lineItem: any = {
        productId: item.productId,
        quantity: item.quantity
      };
      
      if (item.variationId) {
        lineItem.variationId = item.variationId;
      }
      
      return lineItem;
    });

    const query = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          order {
            id
            orderNumber
            status
            total
          }
        }
      }
    `;

    const variables = {
      input: {
        clientMutationId: Date.now().toString(),
        paymentMethod: orderData.paymentMethod,
        paymentMethodTitle: orderData.paymentMethodTitle,
        customerNote: orderData.customerNote,
        billing: orderData.billing,
        shipping: orderData.shipping,
        lineItems
      }
    };

    const data = await fetchAPI(query, variables);
    
    if (data.createOrder?.order) {
      toast.success("Order placed successfully!");
      return data.createOrder.order;
    } else {
      throw new Error("Failed to create order");
    }
  } catch (error) {
    toast.error("Failed to place order. Please try again.");
    console.error('Order creation error:', error);
    throw error;
  }
}

// Get customer orders
export async function getCustomerOrders() {
  try {
    const query = `
      query GetCustomerOrders {
        customer {
          orders {
            nodes {
              id
              orderNumber
              date
              status
              total
              lineItems {
                nodes {
                  productId
                  quantity
                  total
                  product {
                    node {
                      name
                      slug
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchAPI(query);
    return data.customer?.orders?.nodes || [];
  } catch (error) {
    toast.error("Failed to retrieve orders.");
    console.error('Get orders error:', error);
    return [];
  }
}

// Get order by ID
export async function getOrder(id: string) {
  try {
    const query = `
      query GetOrder {
        order(id: "${id}") {
          id
          orderNumber
          date
          status
          total
          subtotal
          totalTax
          shippingTotal
          paymentMethodTitle
          customerNote
          lineItems {
            nodes {
              productId
              quantity
              total
              product {
                node {
                  name
                  slug
                }
              }
            }
          }
          billing {
            firstName
            lastName
            address1
            address2
            city
            state
            postcode
            country
            email
            phone
          }
          shipping {
            firstName
            lastName
            address1
            address2
            city
            state
            postcode
            country
          }
        }
      }
    `;

    const data = await fetchAPI(query);
    return data.order;
  } catch (error) {
    toast.error("Failed to retrieve order details.");
    console.error('Get order error:', error);
    return null;
  }
}
