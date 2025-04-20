
import { supabase } from "@/integrations/supabase/client";

export interface CouponValidationResult {
  success: boolean;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
  };
  discountAmount: number;
  subtotal: number;
  error?: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  try {
    // Validate coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
      
    if (couponError) {
      throw new Error('Invalid coupon code');
    }
    
    // Check coupon validity
    const now = new Date();
    if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
      throw new Error('Coupon is expired or not yet active');
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit reached');
    }
    
    if (coupon.min_purchase > subtotal) {
      throw new Error(`Minimum purchase amount of ${coupon.min_purchase} required`);
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = subtotal * (coupon.discount_value / 100);
    } else {
      // Fixed amount
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }
    
    return {
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
      },
      discountAmount,
      subtotal
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      discountAmount: 0,
      subtotal
    };
  }
}
