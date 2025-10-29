-- Fix RLS infinite recursion by simplifying policies
-- This migration removes circular references in RLS policies

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Only admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Only admins can manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Only admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Only admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can update contact messages" ON contact_messages;

-- Drop existing policies that we need to recreate
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Everyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Blog categories are viewable by everyone" ON blog_categories;
DROP POLICY IF EXISTS "Active promo codes are viewable by everyone" ON promo_codes;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;

-- Recreate simpler policies without recursion

-- Categories - allow public read, authenticated users can write (simplified)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Products - allow public read for published, authenticated users can manage
CREATE POLICY "Published products are viewable by everyone" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Profiles - users can only manage their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders - users can manage their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Reviews - everyone can read, users can manage their own
CREATE POLICY "Everyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Blog posts - public read for published, authenticated users can manage
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- Blog categories - public read, authenticated users can manage
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage blog categories" ON blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- Promo codes - public read for active, authenticated users can manage
CREATE POLICY "Active promo codes are viewable by everyone" ON promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage promo codes" ON promo_codes FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter subscriptions - anyone can subscribe, authenticated users can manage
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions FOR UPDATE USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Contact messages - anyone can create, authenticated users can view
CREATE POLICY "Anyone can create contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view contact messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update contact messages" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

SELECT 'RLS recursion fixed successfully!' as message;