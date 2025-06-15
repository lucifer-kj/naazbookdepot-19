
-- Create order status history table to track status changes
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order notes table for admin comments
CREATE TABLE public.order_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook logs table to track notification delivery
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  webhook_url TEXT,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add email notification preferences to profiles
ALTER TABLE profiles ADD COLUMN email_notifications JSONB DEFAULT '{"order_updates": true, "marketing": false, "newsletters": true}'::jsonb;

-- Add RLS policies for new tables
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for order_status_history
CREATE POLICY "Admins can view all order status history" 
  ON public.order_status_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can insert order status history" 
  ON public.order_status_history FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Policies for order_notes
CREATE POLICY "Admins can view all order notes" 
  ON public.order_notes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can insert order notes" 
  ON public.order_notes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can update order notes" 
  ON public.order_notes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Policies for webhook_logs
CREATE POLICY "Admins can view webhook logs" 
  ON public.webhook_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "System can insert webhook logs" 
  ON public.webhook_logs FOR INSERT 
  WITH CHECK (true);

-- Function to automatically create status history when order status changes
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
      order_id,
      status,
      previous_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      NEW.status,
      OLD.status,
      auth.uid(),
      CASE 
        WHEN NEW.tracking_number IS DISTINCT FROM OLD.tracking_number AND NEW.tracking_number IS NOT NULL 
        THEN 'Tracking number updated: ' || NEW.tracking_number
        ELSE 'Status updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic status history
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_status_history();

-- Create indexes for better performance
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);
CREATE INDEX idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
