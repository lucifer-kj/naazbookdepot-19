
import { supabase } from "@/integrations/supabase/client";

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states: string[];
  base_rate: number;
  per_kg_rate: number;
}

interface ShippingRateParams {
  weight: number; // in kg
  country: string;
  state: string;
  method?: 'standard' | 'express';
}

interface ShippingRate {
  rate: number;
  method: string;
  estimatedDays: string;
  carrier: string;
}

// Cache shipping zones to avoid repeated DB calls
let shippingZonesCache: ShippingZone[] | null = null;

/**
 * Fetch shipping zones from the database or cache
 */
async function getShippingZones(): Promise<ShippingZone[]> {
  if (shippingZonesCache) {
    return shippingZonesCache;
  }
  
  // For demo purposes, we'll use hardcoded shipping zones
  // In a real application, you would fetch this from the database
  const shippingZones: ShippingZone[] = [
    {
      id: "zone1",
      name: "North India",
      countries: ["India"],
      states: ["Delhi", "Haryana", "Punjab", "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh"],
      base_rate: 50,
      per_kg_rate: 20
    },
    {
      id: "zone2",
      name: "South India",
      countries: ["India"],
      states: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"],
      base_rate: 70,
      per_kg_rate: 25
    },
    {
      id: "zone3",
      name: "West India",
      countries: ["India"],
      states: ["Maharashtra", "Gujarat", "Rajasthan", "Goa"],
      base_rate: 60,
      per_kg_rate: 22
    },
    {
      id: "zone4",
      name: "East India",
      countries: ["India"],
      states: ["West Bengal", "Bihar", "Jharkhand", "Odisha", "Assam"],
      base_rate: 80,
      per_kg_rate: 30
    },
    {
      id: "zone5",
      name: "Default Zone",
      countries: ["*"],
      states: ["*"],
      base_rate: 100,
      per_kg_rate: 40
    }
  ];
  
  shippingZonesCache = shippingZones;
  return shippingZones;
}

/**
 * Calculate shipping rates based on weight and location
 */
export async function calculateShippingRates(params: ShippingRateParams): Promise<ShippingRate[]> {
  const { weight, country, state, method } = params;
  const shippingZones = await getShippingZones();
  
  // Find applicable shipping zone
  let zone = shippingZones.find(zone => 
    (zone.countries.includes(country) || zone.countries.includes("*")) && 
    (zone.states.includes(state) || zone.states.includes("*"))
  );
  
  // Use default zone if no matching zone found
  if (!zone) {
    zone = shippingZones.find(zone => zone.countries.includes("*") && zone.states.includes("*")) as ShippingZone;
  }
  
  // Calculate base shipping rate
  const baseRate = zone.base_rate + (weight * zone.per_kg_rate);
  
  // Create result array with available methods
  const rates: ShippingRate[] = [];
  
  // Only add requested method if specified, otherwise add all available methods
  if (!method || method === 'standard') {
    rates.push({
      rate: Math.round(baseRate),
      method: 'Standard Shipping',
      estimatedDays: '3-5',
      carrier: 'Delhivery'
    });
  }
  
  if (!method || method === 'express') {
    rates.push({
      rate: Math.round(baseRate * 1.5), // Express is 50% more expensive
      method: 'Express Shipping',
      estimatedDays: '1-2',
      carrier: 'BlueDart Express'
    });
  }
  
  return rates;
}

interface GenerateShippingLabelParams {
  orderId: string;
  shippingMethod: string;
  weight: number;
}

interface ShippingLabel {
  trackingNumber: string;
  carrier: string;
  labelUrl: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

/**
 * Generate a shipping label for an order
 * In a real application, this would integrate with a shipping API
 */
export async function generateShippingLabel(params: GenerateShippingLabelParams): Promise<ShippingLabel> {
  const { orderId, shippingMethod, weight } = params;
  
  // For demo purposes, we'll generate a fake tracking number and label
  const trackingNumber = `NAZ${Date.now().toString().substring(5)}IN`;
  const carrier = shippingMethod.includes('Express') ? 'BlueDart Express' : 'Delhivery';
  
  // In a real app, you would call your shipping provider's API here
  
  // Generate a future date for estimated delivery
  const today = new Date();
  const deliveryDays = shippingMethod.includes('Express') ? 2 : 5;
  const estimatedDelivery = new Date(today);
  estimatedDelivery.setDate(today.getDate() + deliveryDays);
  
  // Save the shipping information to the database
  try {
    const { error } = await supabase.from('order_shipments').insert({
      order_id: orderId,
      carrier,
      tracking_number: trackingNumber,
      shipping_method: shippingMethod,
      weight,
      estimated_delivery: estimatedDelivery.toISOString().split('T')[0]
    });
    
    if (error) {
      console.error('Error saving shipping information:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save shipping information:', error);
    throw error;
  }
  
  // Return the shipping label information
  return {
    trackingNumber,
    carrier,
    labelUrl: '/images/shipping-label.pdf', // This would be a real URL in production
    estimatedDelivery: estimatedDelivery.toLocaleDateString(),
    trackingUrl: carrier === 'BlueDart Express' 
      ? `https://www.bluedart.com/tracking?trackingNo=${trackingNumber}` 
      : `https://www.delhivery.com/track/?trackingNo=${trackingNumber}`
  };
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
    
    const carrier = data.carrier;
    const trackingNumber = data.tracking_number;
    const trackingUrl = carrier === 'BlueDart Express' 
      ? `https://www.bluedart.com/tracking?trackingNo=${trackingNumber}` 
      : `https://www.delhivery.com/track/?trackingNo=${trackingNumber}`;
    
    return {
      trackingNumber,
      carrier,
      labelUrl: '/images/shipping-label.pdf', // This would be a real URL in production
      estimatedDelivery: new Date(data.estimated_delivery).toLocaleDateString(),
      trackingUrl
    };
  } catch (error) {
    console.error('Failed to get tracking information:', error);
    return null;
  }
}
