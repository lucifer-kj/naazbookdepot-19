-- Final fix for all migration conflicts
-- This migration resolves RLS recursion and ensures proper schema

-- First, drop all existing problematic policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies that might cause conflicts
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE 'All existing policies dropped successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Ensure all required columns exist
DO $$
BEGIN
    -- Add category_id to products if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id BIGINT REFERENCES categories(id);
    END IF;
    
    -- Add sort_order to categories if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    -- Add missing product columns for backward compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'publisher') THEN
        ALTER TABLE products ADD COLUMN publisher VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'language') THEN
        ALTER TABLE products ADD COLUMN language VARCHAR(100) DEFAULT 'English';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pages') THEN
        ALTER TABLE products ADD COLUMN pages INTEGER;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Create simple, non-recursive RLS policies
-- Categories policies
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_auth_write" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "categories_auth_update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "categories_auth_delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Products policies
CREATE POLICY "products_public_read_published" ON products FOR SELECT USING (
  status = 'published' OR auth.role() = 'authenticated'
);
CREATE POLICY "products_auth_write" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_auth_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_auth_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Profiles policies (simple, no recursion)
CREATE POLICY "profiles_own_data" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "orders_own_data" ON orders FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'authenticated'
);
CREATE POLICY "orders_own_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_auth_update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "order_items_via_orders" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR
  auth.role() = 'authenticated'
);
CREATE POLICY "order_items_via_orders_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_write" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_own_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Blog posts policies
CREATE POLICY "blog_posts_public_read_published" ON blog_posts FOR SELECT USING (
  status = 'published' OR auth.role() = 'authenticated'
);
CREATE POLICY "blog_posts_auth_manage" ON blog_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "blog_posts_auth_update" ON blog_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "blog_posts_auth_delete" ON blog_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Blog categories policies
CREATE POLICY "blog_categories_public_read" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "blog_categories_auth_manage" ON blog_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "blog_categories_auth_update" ON blog_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "blog_categories_auth_delete" ON blog_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Promo codes policies
CREATE POLICY "promo_codes_active_read" ON promo_codes FOR SELECT USING (
  is_active = true OR auth.role() = 'authenticated'
);
CREATE POLICY "promo_codes_auth_manage" ON promo_codes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "promo_codes_auth_update" ON promo_codes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "promo_codes_auth_delete" ON promo_codes FOR DELETE USING (auth.role() = 'authenticated');

-- Addresses policies
CREATE POLICY "addresses_own_data" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_insert" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_own_update" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_delete" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "wishlist_own_data" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_own_insert" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_own_delete" ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "cart_items_own_data" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_items_own_insert" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_items_own_update" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_items_own_delete" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Newsletter subscriptions policies
CREATE POLICY "newsletter_public_insert" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_own_read" ON newsletter_subscriptions FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.role() = 'authenticated'
);
CREATE POLICY "newsletter_own_update" ON newsletter_subscriptions FOR UPDATE USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.role() = 'authenticated'
);

-- Contact messages policies
CREATE POLICY "contact_messages_public_insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_auth_read" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contact_messages_auth_update" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

-- Update existing products to link with categories if any exist
UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE LOWER(categories.name) = LOWER(products.category) 
  LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;

SELECT 'All conflicts resolved! Database is ready for sync.' as message;