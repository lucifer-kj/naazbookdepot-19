
-- Add UPI payment support to orders table
ALTER TABLE orders ADD COLUMN upi_reference_code text;
ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN payment_expires_at timestamp with time zone;

-- Update order status to include payment verification states
ALTER TABLE orders ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'paid_claimed', 'verified', 'failed', 'expired'));

-- Create index for UPI reference codes for quick lookups
CREATE INDEX idx_orders_upi_reference ON orders(upi_reference_code) WHERE upi_reference_code IS NOT NULL;

-- Create index for payment status filtering
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Function to generate unique UPI reference codes
CREATE OR REPLACE FUNCTION generate_upi_reference(order_id_param uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'NBD' || TO_CHAR(NOW(), 'YYYYMMDD') || SUBSTR(order_id_param::text, 1, 8);
END;
$$;

-- Function to auto-expire unpaid orders
CREATE OR REPLACE FUNCTION expire_unpaid_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders 
  SET payment_status = 'expired'
  WHERE payment_status = 'pending' 
    AND payment_method = 'upi'
    AND payment_expires_at < NOW();
END;
$$;
