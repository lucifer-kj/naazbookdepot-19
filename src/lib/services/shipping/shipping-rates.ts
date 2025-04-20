
import { ShippingRateParams, ShippingRate, ShippingZone } from './types';
import { getShippingZones } from './shipping-zones';

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
  
  // If still no zone found (which shouldn't happen with proper default zone setup), return empty array
  if (!zone) {
    console.error("No shipping zone found and no default zone available");
    return [];
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
