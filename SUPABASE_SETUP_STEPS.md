# 🚀 Supabase Setup - Step by Step

## ❌ **Error Fix: Foreign Key Constraint Issue**

If you're getting this error:
```
ERROR: 42804: foreign key constraint "wishlist_product_id_fkey" cannot be implemented
DETAIL: Key columns "product_id" and "id" are of incompatible types: bigint and uuid.
```

Follow these **exact steps** to fix it:

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Go to Supabase Dashboard**
1. Open https://supabase.com/dashboard
2. Select your project: `tyjnywhsynuwgclpehtx`
3. Click on **SQL Editor** in the left sidebar

### **Step 2: Run Migration 1 - Fix Data Types**
1. **Copy the entire content** from `supabase/migrations/002_fix_data_types.sql`
2. **Paste it** in the SQL Editor
3. **Click "Run"**
4. ✅ You should see: "Schema created successfully with correct data types!"

### **Step 3: Run Migration 2 - Setup Security**
1. **Copy the entire content** from `supabase/migrations/003_setup_rls_policies.sql`
2. **Paste it** in the SQL Editor
3. **Click "Run"**
4. ✅ You should see: "RLS policies created successfully!"

### **Step 4: Run Migration 3 - Setup Storage**
1. **Copy the entire content** from `supabase/migrations/004_setup_storage.sql`
2. **Paste it** in the SQL Editor
3. **Click "Run"**
4. ✅ You should see: "Storage buckets and policies created successfully!"

### **Step 5: Add Sample Data**
1. **Copy the entire content** from `supabase/seed_fixed.sql`
2. **Paste it** in the SQL Editor
3. **Click "Run"**
4. ✅ You should see: "Sample data inserted successfully!"

### **Step 6: Verify Setup**
Run this verification query:
```sql
SELECT 
  'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'promo_codes', COUNT(*) FROM promo_codes;
```

**Expected Results:**
- categories: 6
- products: 16
- blog_posts: 4
- promo_codes: 5

---

## 🎯 **What You'll Get After Setup**

### **📚 Sample Products (16 books)**
- **Islamic Books (4)**: The Sealed Nectar, Quran Translation, Fortress of the Muslim, Stories of the Prophets
- **Fiction (3)**: The Alchemist, To Kill a Mockingbird, The Kite Runner
- **Educational (3)**: Mathematics Class 10, Science Class 9, English Grammar
- **Biography (2)**: Steve Jobs, Wings of Fire
- **Children (2)**: The Jungle Book, Panchatantra Stories
- **History (2)**: A Brief History of Time, The Discovery of India

### **🏷️ Categories (6)**
- Islamic Books
- Fiction
- Educational
- Biography
- Children Books
- History

### **📝 Blog Content (4 posts)**
- The Importance of Reading in Islam
- Top 10 Islamic Books Every Muslim Should Read
- How to Develop a Daily Reading Habit
- The Benefits of Reading Fiction vs Non-Fiction

### **🎫 Promo Codes (5 active)**
- `WELCOME10` - 10% off for new customers
- `ISLAMIC25` - 25% off Islamic books
- `STUDENT15` - 15% off educational books
- `BULK50` - ₹50 off bulk orders
- `RAMADAN20` - 20% Ramadan special

---

## ✅ **After Setup - Test Your App**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test these features**:
   - ✅ Homepage loads with products
   - ✅ Categories work in navigation
   - ✅ Product pages display correctly
   - ✅ Blog posts are visible
   - ✅ Cart functionality works
   - ✅ Promo codes can be applied

3. **Check console** - should see:
   - ✅ "Environment validation passed"
   - ✅ "Database connection successful"
   - ❌ No more foreign key errors

---

## 🚨 **If You Still Get Errors**

### **Common Issues:**

1. **"Table already exists"**
   - The migration will handle this automatically
   - It drops and recreates tables with correct types

2. **"Permission denied"**
   - Make sure you're using the correct Supabase project
   - Check that your API key has the right permissions

3. **"Network error"**
   - Verify your internet connection
   - Check if Supabase is accessible

### **Need Help?**
- Check the browser console for specific error messages
- Look at the Supabase dashboard logs
- Verify your `.env` file has the correct URL and API key

---

## 🎉 **Success Indicators**

Your setup is complete when:
- ✅ No console errors about database connections
- ✅ Products load on homepage
- ✅ Categories show in navigation
- ✅ Blog posts are visible
- ✅ No foreign key constraint errors
- ✅ Sample data is visible in Supabase dashboard

**Ready to test your e-commerce features!** 🛒📚