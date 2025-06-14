
-- Add tags column to products table for better search and filtering
ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable real-time for orders table
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

-- Update search function to include tags
CREATE OR REPLACE FUNCTION search_products(search_query text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  stock integer,
  category_id uuid,
  images text[],
  tags text[],
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, p.images, p.tags, p.created_at
  FROM products p
  WHERE 
    p.name ILIKE '%' || search_query || '%' OR
    p.description ILIKE '%' || search_query || '%' OR
    EXISTS (
      SELECT 1 FROM unnest(p.tags) AS tag 
      WHERE tag ILIKE '%' || search_query || '%'
    );
END;
$$ LANGUAGE plpgsql;
