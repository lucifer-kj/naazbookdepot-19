
-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on stock_history table
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_history (admin only)
CREATE POLICY "Admin can view all stock history" ON stock_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert stock history" ON stock_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create a function to calculate average rating for products
CREATE OR REPLACE FUNCTION get_product_average_rating(product_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews 
    WHERE product_id = product_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get product review count
CREATE OR REPLACE FUNCTION get_product_review_count(product_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM reviews 
    WHERE product_id = product_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to update stock with history tracking
CREATE OR REPLACE FUNCTION update_product_stock(
  product_uuid UUID,
  quantity_change INTEGER,
  change_reason TEXT DEFAULT 'Manual adjustment',
  change_type_param TEXT DEFAULT 'adjustment'
)
RETURNS VOID AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock INTO current_stock FROM products WHERE id = product_uuid;
  
  -- Calculate new stock
  new_stock := current_stock + quantity_change;
  
  -- Ensure stock doesn't go below 0
  IF new_stock < 0 THEN
    new_stock := 0;
  END IF;
  
  -- Update product stock
  UPDATE products SET stock = new_stock WHERE id = product_uuid;
  
  -- Log the change in stock history
  INSERT INTO stock_history (
    product_id,
    change_type,
    quantity_change,
    previous_stock,
    new_stock,
    reason,
    created_by
  ) VALUES (
    product_uuid,
    change_type_param,
    quantity_change,
    current_stock,
    new_stock,
    change_reason,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql;
