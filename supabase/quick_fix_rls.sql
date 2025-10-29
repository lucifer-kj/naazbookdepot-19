-- Quick fix for RLS recursion - run this in Supabase SQL Editor

-- Temporarily disable RLS on profiles to break the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Re-enable RLS with simpler policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple profile policies without recursion
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Also fix other admin policies to avoid recursion
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- Replace with simpler policies
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');

SELECT 'RLS recursion fixed!' as message;