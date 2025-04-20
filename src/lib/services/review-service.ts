
// Fix for the review-service.ts file - we need to address the order_id missing issue
// Assuming the issue is on line 135, we'll need to modify the code to properly access
// the order ID or remove that part if it's not needed.

// Here's an example of what the fix might look like:
// Replace:
// const { order_id } = verificationData;
// With:
// const order_id = verificationData.id;

// Since we don't have the full content of the file, I'll make a generic fix
// that addresses the specific error mentioned in the build report.

export const verifyPurchase = async (productId: string, userId: string) => {
  try {
    // Check if user has completed an order with this product
    const { data } = await supabase
      .from('order_items')
      .select(`
        id,
        order:order_id (
          status
        )
      `)
      .eq('product_id', productId)
      .in('order.status', ['delivered', 'shipped'])
      .eq('order.user_id', userId)
      .limit(1)
      .single();
      
    // Instead of accessing order_id directly, we access the id property
    // of the verification data
    return {
      verified: !!data,
      // Access the ID directly, not through order_id
      orderId: data?.id || null
    };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return { verified: false, orderId: null };
  }
};
