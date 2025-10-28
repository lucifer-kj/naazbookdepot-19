import { supabase } from '../supabase';

export interface PayUConfig {
  merchantKey: string;
  merchantSalt: string;
  baseUrl: string;
  successUrl: string;
  failureUrl: string;
}

export interface PayUPaymentRequest {
  orderId: string;
  amount: number;
  productInfo: string;
  firstName: string;
  email: string;
  phone: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUResponse {
  status: 'success' | 'failure' | 'pending';
  transactionId: string;
  payuMoneyId?: string;
  amount: number;
  orderId: string;
  hash: string;
  error?: string;
}

export interface UPIPaymentData {
  orderId: string;
  amount: number;
  upiId: string;
  qrCode?: string;
  deepLink?: string;
}

class PayUService {
  private config: PayUConfig;

  constructor() {
    this.config = {
      merchantKey: import.meta.env.VITE_PAYU_MERCHANT_KEY || 'test_key',
      merchantSalt: import.meta.env.VITE_PAYU_MERCHANT_SALT || 'test_salt',
      baseUrl: import.meta.env.VITE_PAYU_BASE_URL || 'https://test.payu.in',
      successUrl: `${window.location.origin}/payment/success`,
      failureUrl: `${window.location.origin}/payment/failure`,
    };
  }

  /**
   * Generate hash for PayU payment request
   */
  private async generateHash(paymentData: PayUPaymentRequest): Promise<string> {
    const hashString = `${this.config.merchantKey}|${paymentData.orderId}|${paymentData.amount}|${paymentData.productInfo}|${paymentData.firstName}|${paymentData.email}|||||||||||${this.config.merchantSalt}`;
    
    // In production, this should be done on the server side for security
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate UPI ID format
   */
  validateUPIId(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  }

  /**
   * Generate UPI QR code for payment
   */
  async generateUPIQR(orderId: string, amount: number, merchantVPA: string): Promise<string> {
    const upiString = `upi://pay?pa=${merchantVPA}&pn=Naaz%20Books&am=${amount}&tn=Order%20${orderId}&mc=5411&mode=02&purpose=00`;
    
    // Generate QR code using a service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
    
    return qrCodeUrl;
  }

  /**
   * Create PayU payment request
   */
  async createPayment(paymentData: PayUPaymentRequest): Promise<{ hash: string; formData: Record<string, string> }> {
    const hash = await this.generateHash(paymentData);
    
    const formData = {
      key: this.config.merchantKey,
      txnid: paymentData.orderId,
      amount: paymentData.amount.toString(),
      productinfo: paymentData.productInfo,
      firstname: paymentData.firstName,
      email: paymentData.email,
      phone: paymentData.phone,
      surl: this.config.successUrl,
      furl: this.config.failureUrl,
      hash: hash,
      udf1: paymentData.udf1 || '',
      udf2: paymentData.udf2 || '',
      udf3: paymentData.udf3 || '',
      udf4: paymentData.udf4 || '',
      udf5: paymentData.udf5 || '',
    };

    return { hash, formData };
  }

  /**
   * Process UPI payment
   */
  async processUPIPayment(data: UPIPaymentData): Promise<{ success: boolean; qrCode?: string; deepLink?: string; error?: string }> {
    try {
      // Log payment attempt
      await this.logPaymentAttempt(data.orderId, 'upi', data.amount);

      const merchantVPA = import.meta.env.VITE_PAYU_UPI_VPA || 'merchant@payu';
      const qrCode = await this.generateUPIQR(data.orderId, data.amount, merchantVPA);
      
      const deepLink = `upi://pay?pa=${merchantVPA}&pn=Naaz%20Books&am=${data.amount}&tn=Order%20${data.orderId}&mc=5411&mode=02&purpose=00`;

      return {
        success: true,
        qrCode,
        deepLink
      };
    } catch (error) {
      console.error('UPI payment processing error:', error);
      return {
        success: false,
        error: 'Failed to process UPI payment'
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string, orderId: string): Promise<PayUResponse> {
    try {
      // In production, this should call PayU's verification API
      const response = await fetch(`${this.config.baseUrl}/merchant/postservice?form=2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key: this.config.merchantKey,
          command: 'verify_payment',
          var1: transactionId,
          hash: await this.generateVerificationHash(transactionId)
        })
      });

      const result = await response.json();
      
      return {
        status: result.status === 'success' ? 'success' : 'failure',
        transactionId: result.txnid,
        payuMoneyId: result.payuMoneyId,
        amount: parseFloat(result.amount),
        orderId: result.txnid,
        hash: result.hash,
        error: result.error
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        status: 'failure',
        transactionId,
        amount: 0,
        orderId,
        hash: '',
        error: 'Verification failed'
      };
    }
  }

  /**
   * Generate verification hash
   */
  private async generateVerificationHash(transactionId: string): Promise<string> {
    const hashString = `${this.config.merchantKey}|verify_payment|${transactionId}|${this.config.merchantSalt}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log payment attempt for tracking
   */
  private async logPaymentAttempt(orderId: string, method: string, amount: number): Promise<void> {
    try {
      await supabase
        .from('payment_logs')
        .insert([{
          order_id: orderId,
          payment_method: method,
          amount: amount,
          status: 'initiated',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Failed to log payment attempt:', error);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, status: string, transactionId?: string, payuMoneyId?: string): Promise<void> {
    try {
      await supabase
        .from('payment_logs')
        .update({
          status,
          transaction_id: transactionId,
          payu_money_id: payuMoneyId,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      // Also update the order status
      await supabase
        .from('orders')
        .update({
          payment_status: status,
          transaction_id: transactionId
        })
        .eq('id', orderId);
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  }

  /**
   * Handle payment callback from PayU
   */
  async handlePaymentCallback(callbackData: Record<string, string>): Promise<{ success: boolean; orderId: string; error?: string }> {
    try {
      const { status, txnid, amount, hash } = callbackData;
      
      // Verify hash to ensure authenticity
      const expectedHash = await this.generateCallbackHash(callbackData);
      if (hash !== expectedHash) {
        throw new Error('Invalid hash - possible tampering detected');
      }

      await this.updatePaymentStatus(
        txnid,
        status === 'success' ? 'completed' : 'failed',
        callbackData.mihpayid,
        callbackData.payuMoneyId
      );

      return {
        success: status === 'success',
        orderId: txnid
      };
    } catch (error) {
      console.error('Payment callback handling error:', error);
      return {
        success: false,
        orderId: callbackData.txnid || '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate callback hash for verification
   */
  private async generateCallbackHash(callbackData: Record<string, string>): Promise<string> {
    const { status, firstname, amount, txnid, hash, productinfo, email } = callbackData;
    const hashString = `${this.config.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${this.config.merchantKey}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const payuService = new PayUService();