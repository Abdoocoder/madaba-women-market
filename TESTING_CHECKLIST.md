# Testing Checklist

## 1. Performance Testing

### Auth Performance

- [ ] Refresh the homepage - should load instantly (< 1 second)
- [ ] Login as a user - verify no 5-second delay
- [ ] Check browser console - no timeout errors

### Homepage Performance

- [ ] Visit homepage - products should appear immediately (no skeleton)
- [ ] Check Network tab - verify products loaded server-side
- [ ] Test filters and sorting - should work smoothly

## 2. Security Testing (RLS)

### Anonymous User

- [ ] View products - should see only approved products ✅
- [ ] Try to access `/api/orders` - should fail ❌
- [ ] Try to view cart without login - should fail ❌

### Customer Role

- [ ] Login as customer
- [ ] View own orders - should work ✅
- [ ] Try to view another customer's orders - should fail ❌
- [ ] Add items to cart - should work ✅
- [ ] Create a review - should work ✅

### Seller Role

- [ ] Login as seller
- [ ] View own products (including unapproved) - should work ✅
- [ ] Try to edit another seller's product - should fail ❌
- [ ] View orders for own products - should work ✅
- [ ] Update order status - should work ✅

### Admin Role

- [ ] Login as admin
- [ ] View all products - should work ✅
- [ ] View all orders - should work ✅
- [ ] Manage success stories - should work ✅
- [ ] Approve/suspend products - should work ✅

## 3. Supabase Verification

### Run in SQL Editor

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'orders', 'order_items', 'reviews', 'carts', 'success_stories');

-- Should show rowsecurity = true for all tables

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Should show optimized policies (1 per action per table)
```

### Linter Check

- [ ] Run Database Linter in Supabase Dashboard
- [ ] Verify no ERROR level issues
- [ ] WARN level issues should be minimal or acceptable

## 4. Application Flow Testing

### Complete User Journey

1. [ ] Visit homepage (anonymous)
2. [ ] Browse products
3. [ ] Register as customer
4. [ ] Add product to cart
5. [ ] Create order
6. [ ] View order in dashboard
7. [ ] Leave a review

### Seller Journey

1. [ ] Register as seller
2. [ ] Wait for admin approval (or manually approve in DB)
3. [ ] Add new product
4. [ ] View product in seller dashboard
5. [ ] Receive order
6. [ ] Update order status

## 5. Performance Metrics

### Before vs After

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Auth Load | ~5s | <1s | ✅ |
| Homepage Load | Client fetch | SSR | ✅ |
| RLS Enabled | ❌ | ✅ | ✅ |
| Policy Count | 0 | ~20 optimized | ✅ |

## Notes

- If any test fails, check browser console for errors
- For RLS issues, verify user role in `profiles` table
- For performance issues, check Network tab in DevTools
