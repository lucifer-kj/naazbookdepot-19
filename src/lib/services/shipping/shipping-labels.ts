
import { supabase } from "@/integrations/supabase/client";
import { ShippingLabel, GenerateShippingLabelParams } from './types';

/**
 * Generate a shipping label for an order
 * In a real application, this would integrate with a shipping API
 */
export async function generateShippingLabel(params: GenerateShippingLabelParams): Promise<ShippingLabel> {
  const { orderId, shippingMethod, weight } = params;
  
  // For demo purposes, generate a fake tracking number
  const trackingNumber = `NAZ${Date.now().toString().substring(5)}IN`;
  const carrier = shippingMethod.includes('Express') ? 'BlueDart Express' : 'Delhivery';
  
  // Generate a future date for estimated delivery
  const today = new Date();
  const deliveryDays = shippingMethod.includes('Express') ? 2 : 5;
  const estimatedDelivery = new Date(today);
  estimatedDelivery.setDate(today.getDate() + deliveryDays);
  
  // Save the shipping information to the database
  try {
    const { data, error } = await supabase
      .from('order_shipments')
      .insert({
        order_id: orderId,
        carrier,
        tracking_number: trackingNumber,
        shipping_method: shippingMethod,
        weight,
        estimated_delivery: estimatedDelivery.toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the shipping label information
    return {
      trackingNumber: data.tracking_number,
      carrier: data.carrier,
      labelUrl: '/images/shipping-label.pdf', // This would be a real URL in production
      estimatedDelivery: new Date(data.estimated_delivery).toLocaleDateString(),
      trackingUrl: data.carrier === 'BlueDart Express' 
        ? `https://www.bluedart.com/tracking?trackingNo=${data.tracking_number}` 
        : `https://www.delhivery.com/track/?trackingNo=${data.tracking_number}`
    };
  } catch (error) {
    console.error('Failed to save shipping information:', error);
    throw error;
  }
}

/**
 * Get tracking information for an order
 */
export async function getOrderTracking(orderId: string): Promise<ShippingLabel | null> {
  try {
    const { data, error } = await supabase
      .from('order_shipments')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching tracking information:', error);
      return null;
    }
    
    return {
      trackingNumber: data.tracking_number,
      carrier: data.carrier,
      labelUrl: '/images/shipping-label.pdf',
      estimatedDelivery: new Date(data.estimated_delivery).toLocaleDateString(),
      trackingUrl: data.carrier === 'BlueDart Express'
        ? `https://www.bluedart.com/tracking?trackingNo=${data.tracking_number}`
        : `https://www.delhivery.com/track/?trackingNo=${data.tracking_number}`
    };
  } catch (error) {
    console.error('Failed to get tracking information:', error);
    return null;
  }
}
