# Supabase Migration & Setup Guide

This guide ensures your Supabase database is properly configured and populated with sample data for testing.

## 🚀 **Quick Setup**

### **Step 1: Verify Environment Configuration**

Your `.env` file should have:
```bash
VITE_SUPABASE_URL=https://tyjnywhsynuwgclpehtx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5am55d2hzeW51d2djbHBlaHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAwODMsImV4cCI6MjA3Njk4NjA4M30.opDu5zS7aQh17B-Mf7awqNo4DayPZx_fA4e3-SDXzqw
```

### **Step 2: Create Database Schema**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Run migrations in order**:
   - First: `supabase/migrations/002_fix_data_types.sql` (fixes foreign key issues)
   - Second: `supabase/migrations/003_setup_rls_policies.sql` (sets up security)
   - Third: `supabase/migrations/004_setup_storage.sql` (sets up file storage)
   - Finally: `supabase/seed.sql` (adds sample data)

### **Step 3: Verify Setup**

After running all migrations, verify your setup:
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT 
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM blog_posts) as blog_posts;
```

### **Step 4: Configure Row Level Security (RLS)**

Run these policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Public read access for published products
CREATE POLICY "Published products are viewable by everyone" ON products FOR SELECT USING (status = 'published');

-- Public read access for published blog posts
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');

-- Public read access for blog categories
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories FOR SELECT USING (true);

-- Public read access for active promo codes
CREATE POLICY "Active promo codes are viewable by everyone" ON promo_codes FOR SELECT USING (is_active = true);

-- User-specific policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Contact messages - anyone can create
CREATE POLICY "Anyone can create contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Newsletter subscriptions - anyone can create
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);

-- Storage policies
CREATE POLICY "Public read access for images" ON storage.objects FOR SELECT USING (bucket_id IN ('images', 'products', 'blog'));
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🗄️ **Database Schema Overview**

### **Core Tables**
- `categories` - Product categories
- `products` - Book inventory
- `profiles` - User profiles (extends auth.users)
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `addresses` - User shipping addresses

### **Content Tables**
- `blog_posts` - Blog articles
- `blog_categories` - Blog categories
- `reviews` - Product reviews
- `contact_messages` - Contact form submissions

### **E-commerce Tables**
- `promo_codes` - Discount codes
- `wishlist` - User wishlists
- `cart_items` - Persistent cart storage
- `newsletter_subscriptions` - Email subscriptions

## 📊 **Sample Data Included**

### **Categories (6 categories)**
- Islamic Books
- Fiction
- Educational
- Biography
- Children Books
- History

### **Products (16 books)**
- **Islamic Books**: The Sealed Nectar, Quran Translation, Fortress of the Muslim, Stories of the Prophets
- **Fiction**: The Alchemist, To Kill a Mockingbird, The Kite Runner
- **Educational**: Mathematics Class 10, Science Class 9, English Grammar
- **Biography**: Steve Jobs, Wings of Fire
- **Children**: The Jungle Book, Panchatantra Stories
- **History**: A Brief History of Time, The Discovery of India

### **Blog Content**
- 6 blog categories
- 4 sample blog posts with rich content
- SEO-optimized with tags and metadata

### **Promo Codes (5 active codes)**
- WELCOME10 - 10% off for new customers
- ISLAMIC25 - 25% off Islamic books
- STUDENT15 - 15% off educational books
- BULK50 - ₹50 off bulk orders
- RAMADAN20 - 20% Ramadan special

## 🔧 **Verification Steps**

### **1. Test Database Connection**
```javascript
// In browser console or test file
const { supabase } = await import('./src/lib/supabase.ts');
const { data, error } = await supabase.from('products').select('count');
console.log('Products count:', data);
```

### **2. Test Sample Data**
```sql
-- Run in Supabase SQL Editor
SELECT 
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM blog_posts) as blog_posts,
  (SELECT COUNT(*) FROM promo_codes) as promo_codes;
```

### **3. Test Authentication**
- Sign up for a new account
- Check if profile is created automatically
- Test login/logout functionality

### **4. Test E-commerce Features**
- Browse products by category
- Add items to cart
- Create a test order
- Apply promo codes

## 🚨 **Troubleshooting**

### **Connection Issues**
- Verify Supabase URL and API key in `.env`
- Check if Supabase project is active
- Ensure network connectivity

### **Missing Tables**
- Run the schema migration: `supabase/migrations/001_initial_schema.sql`
- Check for SQL errors in Supabase dashboard

### **No Sample Data**
- Run the seed script: `supabase/seed.sql`
- Check RLS policies aren't blocking inserts

### **Authentication Issues**
- Enable email authentication in Supabase Auth settings
- Configure email templates if needed
- Check RLS policies for user-specific tables

### **Storage Issues**
- Create storage buckets as shown above
- Set up storage policies for public access
- Verify CORS settings if needed

## 📝 **Next Steps After Setup**

1. **Test Core Features**:
   - User registration/login
   - Product browsing and search
   - Cart and checkout flow
   - Order management

2. **Admin Setup**:
   - Create admin user in Supabase Auth
   - Set `is_admin = true` in profiles table
   - Test admin dashboard access

3. **Payment Integration**:
   - Configure PayPal sandbox credentials
   - Set up PayU test environment
   - Test payment flows

4. **Email Configuration**:
   - Set up SMTP settings in `.env`
   - Configure email templates
   - Test contact form and notifications

5. **Production Deployment**:
   - Update environment variables for production
   - Configure custom domain
   - Set up SSL certificates
   - Enable production payment gateways

## 🔒 **Security Checklist**

- ✅ RLS enabled on all tables
- ✅ User-specific data policies
- ✅ Public read access for appropriate content
- ✅ Secure storage policies
- ✅ Input validation and sanitization
- ✅ API rate limiting configured
- ✅ Environment variables secured

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Authentication Setup](https://supabase.com/docs/guides/auth)

---

**Need Help?** If you encounter issues, check the console errors and Supabase dashboard logs for detailed error messages.