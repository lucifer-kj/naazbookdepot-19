import { supabase } from '../supabase';

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  currency: string;
}

export interface PayPalOrderRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
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
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCapture {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  final_capture: boolean;
}

export interface PayPalWebhook {
  id: string;
  event_type: string;
  resource: any;
  summary: string;
  resource_type: string;
  event_version: string;
  create_time: string;
}

class PayPalService {
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
      baseUrl: import.meta.env.VITE_PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
      currency: 'USD'
    };
  }

  /**
   * Get PayPal access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

      return this.accessToken;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  /**
   * Convert amount to PayPal currency format
   */
  private convertCurrency(amountINR: number, targetCurrency: string = 'USD'): number {
    // Simple conversion rate - in production, use real-time rates
    const conversionRates: Record<string, number> = {
      'USD': 0.012, // 1 INR = 0.012 USD (approximate)
      'EUR': 0.011, // 1 INR = 0.011 EUR (approximate)
      'GBP': 0.0095, // 1 INR = 0.0095 GBP (approximate)
      'INR': 1
    };

    const rate = conversionRates[targetCurrency] || conversionRates['USD'];
    return Math.round(amountINR * rate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Create PayPal order
   */
  async createOrder(orderRequest: PayPalOrderRequest): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();
      const convertedAmount = this.convertCurrency(orderRequest.amount, orderRequest.currency);

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderRequest.orderId,
          amount: {
            currency_code: orderRequest.currency,
            value: convertedAmount.toFixed(2)
          },
          description: orderRequest.description,
          shipping: orderRequest.shippingAddress ? {
            address: {
              address_line_1: orderRequest.shippingAddress.addressLine1,
              address_line_2: orderRequest.shippingAddress.addressLine2 || '',
              admin_area_2: orderRequest.shippingAddress.city,
              admin_area_1: orderRequest.shippingAddress.state,
              postal_code: orderRequest.shippingAddress.postalCode,
              country_code: orderRequest.shippingAddress.countryCode
            }
          } : undefined
        }],
        payer: {
          name: {
            given_name: orderRequest.customerInfo.firstName,
            surname: orderRequest.customerInfo.lastName
          },
          email_address: orderRequest.customerInfo.email,
          phone: orderRequest.customerInfo.phone ? {
            phone_number: {
              national_number: orderRequest.customerInfo.phone
            }
          } : undefined
        },
        application_context: {
          return_url: `${window.location.origin}/payment/paypal/success`,
          cancel_url: `${window.location.origin}/payment/paypal/cancel`,
          brand_name: 'Naaz Books',
          locale: 'en-US',
          landing_page: 'BILLING',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'PAY_NOW'
        }
      };

      const response = await fetch(`${this.config.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `${orderRequest.orderId}-${Date.now()}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal order creation failed: ${errorData.message || response.statusText}`);
      }

      const order = await response.json();
      
      // Log the order creation
      await this.logPayPalTransaction(orderRequest.orderId, 'order_created', order.id, convertedAmount, orderRequest.currency);

      return order;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  /**
   * Capture PayPal payment
   */
  async capturePayment(paypalOrderId: string): Promise<PayPalCapture> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.config.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal capture failed: ${errorData.message || response.statusText}`);
      }

      const captureData = await response.json();
      const capture = captureData.purchase_units[0].payments.captures[0];

      // Log the capture
      await this.logPayPalTransaction(
        captureData.purchase_units[0].reference_id,
        'payment_captured',
        paypalOrderId,
        parseFloat(capture.amount.value),
        capture.amount.currency_code,
        capture.id
      );

      return capture;
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(paypalOrderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.config.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get order details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal get order details error:', error);
      throw error;
    }
  }

  /**
   * Handle PayPal webhook
   */
  async handleWebhook(webhookData: PayPalWebhook): Promise<{ success: boolean; message: string }> {
    try {
      const { event_type, resource } = webhookData;

      switch (event_type) {
        case 'CHECKOUT.ORDER.APPROVED':
          await this.handleOrderApproved(resource);
          break;
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCaptured(resource);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaymentDenied(resource);
          break;
        case 'CHECKOUT.ORDER.VOIDED':
          await this.handleOrderVoided(resource);
          break;
        default:
          console.log(`Unhandled PayPal webhook event: ${event_type}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('PayPal webhook handling error:', error);
      return { success: false, message: 'Failed to process webhook' };
    }
  }

  /**
   * Handle order approved webhook
   */
  private async handleOrderApproved(resource: any): Promise<void> {
    const orderId = resource.purchase_units[0].reference_id;
    await this.updateOrderStatus(orderId, 'approved', resource.id);
  }

  /**
   * Handle payment captured webhook
   */
  private async handlePaymentCaptured(resource: any): Promise<void> {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      await this.updateOrderStatus(orderId, 'completed', resource.id);
    }
  }

  /**
   * Handle payment denied webhook
   */
  private async handlePaymentDenied(resource: any): Promise<void> {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      await this.updateOrderStatus(orderId, 'denied', resource.id);
    }
  }

  /**
   * Handle order voided webhook
   */
  private async handleOrderVoided(resource: any): Promise<void> {
    const orderId = resource.purchase_units[0].reference_id;
    await this.updateOrderStatus(orderId, 'voided', resource.id);
  }

  /**
   * Update order status in database
   */
  private async updateOrderStatus(orderId: string, status: string, paypalTransactionId: string): Promise<void> {
    try {
      await supabase
        .from('orders')
        .update({
          payment_status: status,
          paypal_transaction_id: paypalTransactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }

  /**
   * Log PayPal transaction
   */
  private async logPayPalTransaction(
    orderId: string,
    action: string,
    paypalOrderId: string,
    amount: number,
    currency: string,
    captureId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('paypal_transactions')
        .insert([{
          order_id: orderId,
          paypal_order_id: paypalOrderId,
          action,
          amount,
          currency,
          capture_id: captureId,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Failed to log PayPal transaction:', error);
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(captureId: string, amount?: number, currency?: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount && currency) {
        refundData.amount = {
          value: amount.toFixed(2),
          currency_code: currency
        };
      }

      const response = await fetch(`${this.config.baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(refundData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal refund failed: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  }

  /**
   * Detect user's currency based on location
   */
  async detectUserCurrency(): Promise<string> {
    try {
      // Simple IP-based currency detection
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const currencyMap: Record<string, string> = {
        'US': 'USD',
        'GB': 'GBP',
        'CA': 'CAD',
        'AU': 'AUD',
        'JP': 'JPY',
        'IN': 'USD' // For Indian customers, use USD for international payments
      };

      return currencyMap[data.country_code] || 'USD';
    } catch (error) {
      console.error('Currency detection error:', error);
      return 'USD'; // Default to USD
    }
  }
}

export const paypalService = new PayPalService();