# Quick Supabase Setup Instructions

## 🚨 **IMPORTANT: Fix for Foreign Key Error**

If you're getting the error:
```
ERROR: 42804: foreign key constraint "wishlist_product_id_fkey" cannot be implemented
DETAIL: Key columns "product_id" and "id" are of incompatible types: bigint and uuid.
```

This means there's a data type mismatch. Follow these steps to fix it:

## 🔧 **Step-by-Step Fix**

### **1. Go to Supabase Dashboard**
- Open https://supabase.com/dashboard
- Select your project: `tyjnywhsynuwgclpehtx`
- Navigate to **SQL Editor**

### **2. Run Migrations in Order**

Copy and paste each file content into SQL Editor and run them **one by one**:

#### **Migration 1: Fix Data Types**
```sql
-- Copy entire content from: supabase/migrations/002_fix_data_types.sql
-- This will drop existing tables and recreate them with correct data types
```

#### **Migration 2: Setup Security**
```sql
-- Copy entire content from: supabase/migrations/003_setup_rls_policies.sql
-- This sets up Row Level Security policies
```

#### **Migration 3: Setup Storage**
```sql
-- Copy entire content from: supabase/migrations/004_setup_storage.sql
-- This creates storage buckets for images
```

#### **Migration 4: Add Sample Data**
```sql
-- Copy entire content from: supabase/seed.sql
-- This adds sample products, categories, and blog posts
```

### **3. Verify Setup**

Run this query to verify everything is working:
```sql
-- Check tables and data
SELECT 
  'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'promo_codes', COUNT(*) FROM promo_codes;
```

You should see:
- categories: 6
- products: 16
- blog_posts: 4
- promo_codes: 5

### **4. Test Your Application**

After running all migrations:
1. **Restart your development server**: `npm run dev`
2. **Clear browser cache**
3. **Test the application features**:
   - Browse products by category
   - View product details
   - Add items to cart
   - Read blog posts
   - Try promo codes during checkout

## 🎯 **What This Fixes**

- ✅ **Data Type Consistency**: All foreign keys now use correct data types
- ✅ **Complete Schema**: All 13 tables with proper relationships
- ✅ **Security Policies**: Row Level Security for data protection
- ✅ **Storage Setup**: Image upload capabilities
- ✅ **Sample Data**: 16 books, 6 categories, 4 blog posts, 5 promo codes

## 🚨 **If You Still Get Errors**

1. **Check Console Errors**: Look for specific error messages
2. **Verify Environment**: Ensure `.env` has correct Supabase URL and key
3. **Check Network**: Ensure you can access Supabase dashboard
4. **Contact Support**: If issues persist, check Supabase dashboard logs

## 📝 **Sample Data Overview**

After setup, you'll have:

### **Products (16 books)**:
- Islamic Books: The Sealed Nectar, Quran Translation, Fortress of the Muslim
- Fiction: The Alchemist, To Kill a Mockingbird, The Kite Runner
- Educational: Mathematics Class 10, Science Class 9, English Grammar
- Biography: Steve Jobs, Wings of Fire
- Children: The Jungle Book, Panchatantra Stories
- History: A Brief History of Time, The Discovery of India

### **Promo Codes**:
- `WELCOME10` - 10% off for new customers
- `ISLAMIC25` - 25% off Islamic books
- `STUDENT15` - 15% off educational books
- `BULK50` - ₹50 off bulk orders
- `RAMADAN20` - 20% Ramadan special

## ✅ **Success Indicators**

Your setup is successful when:
- No console errors about database connections
- Products load on the homepage
- Categories show in navigation
- Blog posts are visible
- Cart functionality works
- Promo codes can be applied

---

**Need help?** Check the full documentation in `docs/SUPABASE_MIGRATION_GUIDE.md`