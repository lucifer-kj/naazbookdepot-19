
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states: string[];
  base_rate: number;
  per_kg_rate: number;
}

export interface ShippingRate {
  rate: number;
  method: string;
  estimatedDays: string;
  carrier: string;
}

export interface ShippingRateParams {
  weight: number;
  country: string;
  state: string;
  method?: string;
}

export interface CreateShippingLabelParams {
  orderId: string;
  shippingMethod: string;
  weight: number;
  fromAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  toAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export interface ShippingLabel {
  id: string;
  trackingNumber: string;
  labelUrl: string;
  carrier: string;
  createdAt: string;
}
