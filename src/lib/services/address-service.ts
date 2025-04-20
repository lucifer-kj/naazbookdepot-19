
import { supabase } from "@/integrations/supabase/client";
import type { Address } from "../types/checkout";

export async function saveAddresses(userId: string, input: { 
  shippingAddress: Address, 
  billingAddress: Address, 
  sameAsBilling: boolean 
}) {
  // Save shipping address
  const shippingAddressData = {
    ...input.shippingAddress,
    user_id: userId
  };
  
  const { data: shippingAddress, error: shippingAddressError } = await supabase
    .from('addresses')
    .insert(shippingAddressData)
    .select()
    .single();

  if (shippingAddressError) throw shippingAddressError;

  // Handle billing address
  let billingAddress;
  if (input.sameAsBilling) {
    billingAddress = shippingAddress;
  } else {
    const billingAddressInput = {
      ...input.billingAddress,
      user_id: userId
    };
    const { data: billingData, error: billingAddressError } = await supabase
      .from('addresses')
      .insert(billingAddressInput)
      .select()
      .single();

    if (billingAddressError) throw billingAddressError;
    billingAddress = billingData;
  }

  return { shippingAddress, billingAddress };
}
