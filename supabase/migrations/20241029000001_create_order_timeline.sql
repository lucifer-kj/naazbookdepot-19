-- Create order_timeline table for tracking order status changes
CREATE TABLE IF NOT EXISTS order_timeline (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  carrier_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_timestamp ON order_timeline(timestamp);

-- Add RLS policies
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own order timeline
CREATE POLICY "Users can view their own order timeline" ON order_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_timeline.order_id 
      AND (orders.user_id = auth.uid() OR orders.email = auth.email())
    )
  );

-- Policy for admins to read all timelines
CREATE POLICY "Admins can view all order timelines" ON order_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy for admins to insert timeline entries
CREATE POLICY "Admins can insert order timeline entries" ON order_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy for admins to update timeline entries
CREATE POLICY "Admins can update order timeline entries" ON order_timeline
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Function to automatically create timeline entry when order status changes
CREATE OR REPLACE FUNCTION create_order_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create timeline entry if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_timeline (order_id, status, message, timestamp)
    VALUES (
      NEW.id,
      NEW.status,
      CASE NEW.status
        WHEN 'pending' THEN 'Order placed and awaiting confirmation'
        WHEN 'confirmed' THEN 'Order confirmed and being processed'
        WHEN 'processing' THEN 'Order is being prepared for shipment'
        WHEN 'shipped' THEN 'Order has been shipped'
        WHEN 'delivered' THEN 'Order delivered successfully'
        WHEN 'cancelled' THEN 'Order has been cancelled'
        WHEN 'refunded' THEN 'Order has been refunded'
        WHEN 'pending_payment_verification' THEN 'Payment verification pending'
        ELSE 'Order status updated'
      END,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timeline creation
DROP TRIGGER IF EXISTS order_status_timeline_trigger ON orders;
CREATE TRIGGER order_status_timeline_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_timeline_entry();