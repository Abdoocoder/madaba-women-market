-- ============================================
-- RLS Security Implementation
-- ============================================
-- This script enables Row Level Security on all public tables
-- and creates appropriate policies for each table

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved products
CREATE POLICY "Public can view approved products"
ON public.products FOR SELECT
USING (approved = true);

-- Sellers can view their own products (including unapproved)
CREATE POLICY "Sellers can view own products"
ON public.products FOR SELECT
USING (auth.uid()::text = seller_id);

-- Sellers can insert their own products
CREATE POLICY "Sellers can insert own products"
ON public.products FOR INSERT
WITH CHECK (auth.uid()::text = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products"
ON public.products FOR UPDATE
USING (auth.uid()::text = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products"
ON public.products FOR DELETE
USING (auth.uid()::text = seller_id);

-- Admins have full access
CREATE POLICY "Admins have full access to products"
ON public.products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 2. ORDERS TABLE
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
ON public.orders FOR SELECT
USING (auth.uid()::text = customer_id);

-- Sellers can view orders containing their products
CREATE POLICY "Sellers can view orders for their products"
ON public.orders FOR SELECT
USING (
  auth.uid()::text = seller_id
);

-- Customers can create their own orders
CREATE POLICY "Customers can create own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid()::text = customer_id);

-- Customers can update their own pending orders
CREATE POLICY "Customers can update own pending orders"
ON public.orders FOR UPDATE
USING (auth.uid()::text = customer_id AND status = 'pending');

-- Sellers can update orders for their products
CREATE POLICY "Sellers can update their orders"
ON public.orders FOR UPDATE
USING (auth.uid()::text = seller_id);

-- Admins have full access
CREATE POLICY "Admins have full access to orders"
ON public.orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 3. ORDER_ITEMS TABLE
-- ============================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for orders they can see
CREATE POLICY "Users can view their order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid()::text OR orders.seller_id = auth.uid()::text)
  )
);

-- Customers can insert order items for their orders
CREATE POLICY "Customers can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()::text
  )
);

-- Admins have full access
CREATE POLICY "Admins have full access to order_items"
ON public.order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 4. REVIEWS TABLE
-- ============================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Public can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid()::text = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid()::text = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to reviews"
ON public.reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 5. CARTS TABLE
-- ============================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart
CREATE POLICY "Users can view own cart"
ON public.carts FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert to own cart"
ON public.carts FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own cart"
ON public.carts FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete from own cart"
ON public.carts FOR DELETE
USING (auth.uid()::text = user_id);

-- Admins have full access
CREATE POLICY "Admins have full access to carts"
ON public.carts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 6. SUCCESS_STORIES TABLE
-- ============================================
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Anyone can view success stories
CREATE POLICY "Public can view success stories"
ON public.success_stories FOR SELECT
USING (true);

-- Only admins can create/update/delete success stories
CREATE POLICY "Admins can manage success stories"
ON public.success_stories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
