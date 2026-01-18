-- ============================================
-- RLS Security Optimization
-- ============================================
-- This script optimizes existing RLS policies for better performance
-- by using SELECT subqueries and combining multiple policies

-- First, drop all existing policies to recreate them optimized
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('products', 'orders', 'order_items', 'reviews', 'carts', 'success_stories', 'profiles'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- 1. PRODUCTS TABLE - Optimized
-- ============================================

-- Combined SELECT policy (replaces 3 separate policies)
CREATE POLICY "products_select_policy"
ON public.products FOR SELECT
USING (
  approved = true 
  OR (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- Sellers can insert their own products
CREATE POLICY "products_insert_policy"
ON public.products FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- Combined UPDATE policy
CREATE POLICY "products_update_policy"
ON public.products FOR UPDATE
USING (
  (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
)
WITH CHECK (
  (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- Combined DELETE policy
CREATE POLICY "products_delete_policy"
ON public.products FOR DELETE
USING (
  (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- ============================================
-- 2. ORDERS TABLE - Optimized
-- ============================================

-- Combined SELECT policy
CREATE POLICY "orders_select_policy"
ON public.orders FOR SELECT
USING (
  (SELECT auth.uid())::text = customer_id
  OR (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- Combined INSERT policy
CREATE POLICY "orders_insert_policy"
ON public.orders FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = customer_id
  OR public.is_admin()
);

-- Combined UPDATE policy
CREATE POLICY "orders_update_policy"
ON public.orders FOR UPDATE
USING (
  ((SELECT auth.uid())::text = customer_id AND status = 'pending')
  OR (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
)
WITH CHECK (
  ((SELECT auth.uid())::text = customer_id AND status = 'pending')
  OR (SELECT auth.uid())::text = seller_id
  OR public.is_admin()
);

-- ============================================
-- 3. ORDER_ITEMS TABLE - Optimized
-- ============================================

-- Combined SELECT policy
CREATE POLICY "order_items_select_policy"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = (SELECT auth.uid())::text OR orders.seller_id = (SELECT auth.uid())::text)
  )
  OR public.is_admin()
);

-- Combined INSERT policy
CREATE POLICY "order_items_insert_policy"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = (SELECT auth.uid())::text
  )
  OR public.is_admin()
);

-- ============================================
-- 4. REVIEWS TABLE - Optimized
-- ============================================

-- Combined SELECT policy (public + admin)
CREATE POLICY "reviews_select_policy"
ON public.reviews FOR SELECT
USING (true); -- Public read access

-- Combined INSERT policy
CREATE POLICY "reviews_insert_policy"
ON public.reviews FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- Combined UPDATE policy
CREATE POLICY "reviews_update_policy"
ON public.reviews FOR UPDATE
USING (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
)
WITH CHECK (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- Combined DELETE policy
CREATE POLICY "reviews_delete_policy"
ON public.reviews FOR DELETE
USING (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- ============================================
-- 5. CARTS TABLE - Optimized
-- ============================================

-- Combined SELECT policy
CREATE POLICY "carts_select_policy"
ON public.carts FOR SELECT
USING (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- Combined INSERT policy
CREATE POLICY "carts_insert_policy"
ON public.carts FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- Combined UPDATE policy
CREATE POLICY "carts_update_policy"
ON public.carts FOR UPDATE
USING (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
)
WITH CHECK (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- Combined DELETE policy
CREATE POLICY "carts_delete_policy"
ON public.carts FOR DELETE
USING (
  (SELECT auth.uid())::text = user_id
  OR public.is_admin()
);

-- ============================================
-- 6. SUCCESS_STORIES TABLE - Optimized
-- ============================================

-- Public read policy
CREATE POLICY "success_stories_select_policy"
ON public.success_stories FOR SELECT
USING (true);

-- Admin-only INSERT policy
CREATE POLICY "success_stories_insert_policy"
ON public.success_stories FOR INSERT
WITH CHECK (
  public.is_admin()
);

-- Admin-only UPDATE policy
CREATE POLICY "success_stories_update_policy"
ON public.success_stories FOR UPDATE
USING (
  public.is_admin()
);

-- Admin-only DELETE policy
CREATE POLICY "success_stories_delete_policy"
ON public.success_stories FOR DELETE
USING (
  public.is_admin()
);

-- ============================================
-- 7. PROFILES TABLE - Optimized
-- ============================================

-- Consolidate: Anyone can view approved sellers, individuals can view own profile, admins view all
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
USING (
  (role = 'seller' AND status = 'approved')
  OR (SELECT auth.uid())::text = id
  OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
);

-- Individuals can insert their own profile (initial setup)
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
WITH CHECK (
  (SELECT auth.uid())::text = id
  OR public.is_admin()
);

-- Individuals can update their own profile, admins can update all
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
USING (
  (SELECT auth.uid())::text = id
  OR public.is_admin()
);

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_policy"
ON public.profiles FOR DELETE
USING (
  public.is_admin()
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these to verify optimization:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
