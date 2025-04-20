
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states: string[];
  base_rate: number;
  per_kg_rate: number;
}

export interface ShippingRateParams {
  weight: number;
  country: string;
  state: string;
  method?: 'standard' | 'express';
}

export interface ShippingRate {
  rate: number;
  method: string;
  estimatedDays: string;
  carrier: string;
}

export interface ShippingLabel {
  trackingNumber: string;
  carrier: string;
  labelUrl: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

export interface GenerateShippingLabelParams {
  orderId: string;
  shippingMethod: string;
  weight: number;
}
