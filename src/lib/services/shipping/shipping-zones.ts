
import { ShippingZone } from './types';

// Cache shipping zones to avoid repeated DB calls
let shippingZonesCache: ShippingZone[] | null = null;

/**
 * Fetch shipping zones from the database or cache
 */
export async function getShippingZones(): Promise<ShippingZone[]> {
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
