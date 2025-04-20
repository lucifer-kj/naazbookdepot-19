
export interface CheckoutInput {
  shippingAddress: Address;
  billingAddress: Address;
  sameAsBilling: boolean;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface Address {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}
