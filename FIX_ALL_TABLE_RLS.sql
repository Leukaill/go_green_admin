-- Fix RLS policies for all main tables
-- Run this in Supabase SQL Editor

-- ============================================
-- PRODUCTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

CREATE POLICY "Authenticated users can read products"
ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE TO authenticated USING (true);

-- ============================================
-- ORDERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

CREATE POLICY "Authenticated users can read orders"
ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert orders"
ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
ON orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete orders"
ON orders FOR DELETE TO authenticated USING (true);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;

CREATE POLICY "Authenticated users can read customers"
ON customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers"
ON customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
ON customers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete customers"
ON customers FOR DELETE TO authenticated USING (true);

-- ============================================
-- BLOG_POSTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog_posts" ON blog_posts;

CREATE POLICY "Authenticated users can read blog_posts"
ON blog_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert blog_posts"
ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog_posts"
ON blog_posts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete blog_posts"
ON blog_posts FOR DELETE TO authenticated USING (true);

-- Done! All tables now allow authenticated admins full access
