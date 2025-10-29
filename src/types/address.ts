
export interface DefaultAddress {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export function isDefaultAddress(obj: unknown): obj is DefaultAddress {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}
