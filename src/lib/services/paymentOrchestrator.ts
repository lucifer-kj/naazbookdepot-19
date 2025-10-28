import { payuService } from './payuService';
import { paypalService } from './paypalService';
import { supabase } from '../supabase';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'domestic' | 'international';
  provider: 'payu' | 'paypal' | 'cod';
  supportedCurrencies: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
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
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  conversionRate: number;
  fraudDetectionAlerts: number;
}

class PaymentOrchestrator {
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'domestic',
      provider: 'cod',
      supportedCurrencies: ['INR'],
      fees: { percentage: 0, fixed: 0 },
      processingTime: 'On delivery',
      description: 'Pay when you receive your order',
      icon: '💵',
      enabled: true
    },
    {
      id: 'payu_upi',
      name: 'UPI Payment',
      type: 'domestic',
      provider: 'payu',
      supportedCurrencies: ['INR'],
      fees: { percentage: 1.5, fixed: 0 },
      processingTime: 'Instant',
      description: 'Pay instantly using UPI',
      icon: '📱',
      enabled: true
    },
    {
      id: 'payu_card',
      name: 'Credit/Debit Card',
      type: 'domestic',
      provider: 'payu',
      supportedCurrencies: ['INR'],
      fees: { percentage: 2.5, fixed: 0 },
      processingTime: 'Instant',
      description: 'Pay with your card via PayU',
      icon: '💳',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'international',
      provider: 'paypal',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      fees: { percentage: 3.5, fixed: 0.30 },
      processingTime: 'Instant',
      description: 'Secure international payments',
      icon: '🌐',
      enabled: true
    }
  ];

  /**
   * Get available payment methods based on user location and preferences
   */
  getAvailablePaymentMethods(userLocation: string, currency: string = 'INR'): PaymentMethod[] {
    const isDomestic = userLocation === 'IN' || currency === 'INR';
    
    return this.paymentMethods.filter(method => {
      if (!method.enabled) return false;
      
      if (isDomestic) {
        return method.type === 'domestic' && method.supportedCurrencies.includes(currency);
      } else {
        return method.type === 'international' && method.supportedCurrencies.includes(currency);
      }
    });
  }

  /**
   * Detect user location for payment method selection
   */
  async detectUserLocation(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'IN';
    } catch (error) {
      console.error('Location detection error:', error);
      return 'IN'; // Default to India
    }
  }

  /**
   * Calculate payment fees
   */
  calculateFees(amount: number, paymentMethodId: string): { fees: number; total: number } {
    const method = this.paymentMethods.find(m => m.id === paymentMethodId);
    if (!method) {
      return { fees: 0, total: amount };
    }

    const percentageFee = (amount * method.fees.percentage) / 100;
    const totalFees = percentageFee + method.fees.fixed;
    
    return {
      fees: Math.round(totalFees * 100) / 100,
      total: Math.round((amount + totalFees) * 100) / 100
    };
  }

  /**
   * Process payment with retry logic and fallback options
   */
  async processPayment(
    paymentRequest: PaymentRequest,
    paymentMethodId: string,
    retryCount: number = 0
  ): Promise<PaymentResult> {
    const maxRetries = 3;
    
    try {
      // Log payment attempt
      await this.logPaymentAttempt(paymentRequest, paymentMethodId);

      // Fraud detection
      const fraudCheck = await this.performFraudDetection(paymentRequest);
      if (fraudCheck.isHighRisk) {
        return {
          success: false,
          paymentMethod: paymentMethodId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: 'failed',
          error: 'Payment blocked due to security concerns'
        };
      }

      // Route to appropriate payment provider
      const result = await this.routePayment(paymentRequest, paymentMethodId);
      
      // Log payment result
      await this.logPaymentResult(paymentRequest.orderId, result);
      
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying payment (attempt ${retryCount + 1}/${maxRetries})`);
        await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        return this.processPayment(paymentRequest, paymentMethodId, retryCount + 1);
      }

      // Try fallback payment method
      const fallbackMethod = await this.getFallbackPaymentMethod(paymentMethodId, paymentRequest.customerInfo.country);
      if (fallbackMethod && fallbackMethod.id !== paymentMethodId) {
        console.log(`Trying fallback payment method: ${fallbackMethod.id}`);
        return this.processPayment(paymentRequest, fallbackMethod.id);
      }

      return {
        success: false,
        paymentMethod: paymentMethodId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Route payment to appropriate provider
   */
  private async routePayment(paymentRequest: PaymentRequest, paymentMethodId: string): Promise<PaymentResult> {
    const method = this.paymentMethods.find(m => m.id === paymentMethodId);
    if (!method) {
      throw new Error('Invalid payment method');
    }

    switch (method.provider) {
      case 'cod':
        return this.processCODPayment(paymentRequest);
      
      case 'payu':
        return this.processPayUPayment(paymentRequest, paymentMethodId);
      
      case 'paypal':
        return this.processPayPalPayment(paymentRequest);
      
      default:
        throw new Error('Unsupported payment provider');
    }
  }

  /**
   * Process Cash on Delivery payment
   */
  private async processCODPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    // COD is always successful at this stage
    return {
      success: true,
      transactionId: `COD_${paymentRequest.orderId}_${Date.now()}`,
      paymentMethod: 'cod',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending'
    };
  }

  /**
   * Process PayU payment
   */
  private async processPayUPayment(paymentRequest: PaymentRequest, paymentMethodId: string): Promise<PaymentResult> {
    if (paymentMethodId === 'payu_upi') {
      const result = await payuService.processUPIPayment({
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        upiId: paymentRequest.metadata?.upiId || ''
      });

      return {
        success: result.success,
        paymentMethod: 'payu_upi',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: result.success ? 'pending' : 'failed',
        error: result.error,
        metadata: {
          qrCode: result.qrCode,
          deepLink: result.deepLink
        }
      };
    } else {
      // Card payment - redirect to PayU
      const { formData } = await payuService.createPayment({
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        productInfo: paymentRequest.productInfo,
        firstName: paymentRequest.customerInfo.firstName,
        email: paymentRequest.customerInfo.email,
        phone: paymentRequest.customerInfo.phone
      });

      return {
        success: true,
        paymentMethod: 'payu_card',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: 'pending',
        redirectUrl: `${(import.meta.env as any).VITE_PAYU_BASE_URL || 'https://test.payu.in'}/_payment`,
        metadata: { formData }
      };
    }
  }

  /**
   * Process PayPal payment
   */
  private async processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const paypalOrder = await paypalService.createOrder({
      orderId: paymentRequest.orderId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      description: paymentRequest.productInfo,
      customerInfo: {
        firstName: paymentRequest.customerInfo.firstName,
        lastName: paymentRequest.customerInfo.lastName,
        email: paymentRequest.customerInfo.email,
        phone: paymentRequest.customerInfo.phone
      },
      shippingAddress: paymentRequest.shippingAddress
    });

    const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

    return {
      success: true,
      transactionId: paypalOrder.id,
      paymentMethod: 'paypal',
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending',
      redirectUrl: approvalUrl
    };
  }

  /**
   * Perform fraud detection
   */
  private async performFraudDetection(paymentRequest: PaymentRequest): Promise<{ isHighRisk: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns
    if (paymentRequest.amount > 50000) {
      riskScore += 20;
      reasons.push('High transaction amount');
    }

    // Check email domain
    const emailDomain = paymentRequest.customerInfo.email.split('@')[1];
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    if (suspiciousDomains.includes(emailDomain)) {
      riskScore += 30;
      reasons.push('Suspicious email domain');
    }

    // Check for rapid successive transactions
    const recentTransactions = await this.getRecentTransactions(paymentRequest.customerInfo.email, 10);
    if (recentTransactions.length > 5) {
      riskScore += 25;
      reasons.push('Multiple recent transactions');
    }

    return {
      isHighRisk: riskScore > 50,
      riskScore,
      reasons
    };
  }

  /**
   * Get fallback payment method
   */
  private async getFallbackPaymentMethod(failedMethodId: string, userCountry: string): Promise<PaymentMethod | null> {
    const availableMethods = this.getAvailablePaymentMethods(userCountry);
    
    // Remove the failed method and return the next best option
    const fallbackMethods = availableMethods.filter(m => m.id !== failedMethodId);
    
    // Prioritize COD for domestic users as ultimate fallback
    if (userCountry === 'IN') {
      return fallbackMethods.find(m => m.id === 'cod') || fallbackMethods[0] || null;
    }
    
    return fallbackMethods[0] || null;
  }

  /**
   * Get recent transactions for fraud detection
   */
  private async getRecentTransactions(email: string, minutes: number): Promise<any[]> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .eq('customer_email', email)
        .gte('created_at', cutoffTime);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  /**
   * Log payment attempt
   */
  private async logPaymentAttempt(paymentRequest: PaymentRequest, paymentMethodId: string): Promise<void> {
    try {
      await supabase
        .from('payment_logs')
        .insert([{
          order_id: paymentRequest.orderId,
          payment_method: paymentMethodId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          customer_email: paymentRequest.customerInfo.email,
          customer_country: paymentRequest.customerInfo.country,
          status: 'initiated',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Failed to log payment attempt:', error);
    }
  }

  /**
   * Log payment result
   */
  private async logPaymentResult(orderId: string, result: PaymentResult): Promise<void> {
    try {
      await supabase
        .from('payment_logs')
        .update({
          status: result.status,
          transaction_id: result.transactionId,
          error_message: result.error,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);
    } catch (error) {
      console.error('Failed to log payment result:', error);
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(startDate: Date, endDate: Date): Promise<PaymentAnalytics> {
    try {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const transactions = data || [];
      const successful = transactions.filter(t => t.status === 'completed');
      const failed = transactions.filter(t => t.status === 'failed');

      const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = successful.length > 0 ? totalAmount / successful.length : 0;

      // Calculate top payment methods
      const methodCounts: Record<string, number> = {};
      transactions.forEach(t => {
        methodCounts[t.payment_method] = (methodCounts[t.payment_method] || 0) + 1;
      });

      const topPaymentMethods = Object.entries(methodCounts)
        .map(([method, count]) => ({
          method,
          count,
          percentage: (count / transactions.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalTransactions: transactions.length,
        successfulTransactions: successful.length,
        failedTransactions: failed.length,
        totalAmount,
        averageAmount,
        topPaymentMethods,
        conversionRate: transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0,
        fraudDetectionAlerts: transactions.filter(t => t.fraud_score > 50).length
      };
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verify payment status across all providers
   */
  async verifyPaymentStatus(orderId: string, paymentMethodId: string): Promise<PaymentResult> {
    const method = this.paymentMethods.find(m => m.id === paymentMethodId);
    if (!method) {
      throw new Error('Invalid payment method');
    }

    switch (method.provider) {
      case 'payu':
        const payuResult = await payuService.verifyPayment('', orderId);
        return {
          success: payuResult.status === 'success',
          transactionId: payuResult.transactionId,
          paymentMethod: paymentMethodId,
          amount: payuResult.amount,
          currency: 'INR',
          status: payuResult.status === 'success' ? 'completed' : 'failed',
          error: payuResult.error
        };

      case 'paypal':
        // PayPal verification would be handled through webhooks
        // This is a placeholder for manual verification
        return {
          success: false,
          paymentMethod: paymentMethodId,
          amount: 0,
          currency: 'USD',
          status: 'pending',
          error: 'PayPal verification requires webhook handling'
        };

      default:
        return {
          success: true,
          paymentMethod: paymentMethodId,
          amount: 0,
          currency: 'INR',
          status: 'completed'
        };
    }
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();