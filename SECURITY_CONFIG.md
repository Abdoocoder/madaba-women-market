# Security Configuration Guide

## 1. Enable Leaked Password Protection

### What is it?

Supabase Auth can check passwords against the HaveIBeenPwned database to prevent users from using compromised passwords.

### How to Enable

1. **Via Supabase Dashboard:**
   - Go to: Authentication → Settings → Security and Protection
   - Find: "Leaked Password Protection"
   - Toggle: **Enable**

2. **Via Supabase CLI (if using local development):**

   ```bash
   # In your supabase/config.toml
   [auth.password]
   min_length = 8
   required_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
   
   [auth.security]
   # Enable leaked password protection
   leaked_password_protection = true
   ```

3. **Restart Supabase** (if using local development):

   ```bash
   supabase stop
   supabase start
   ```

### Benefits

- ✅ Prevents users from using passwords that have been leaked in data breaches
- ✅ Improves overall account security
- ✅ No performance impact (checks are done asynchronously)
- ✅ User-friendly error messages

### User Experience

When a user tries to register or change password with a compromised password:

```
Error: This password has been found in a data breach. 
Please choose a different password.
```

## 2. Function Search Path Security

The `is_admin()` function has been updated with:

- `SET search_path = public, pg_temp` - Prevents search path injection attacks
- `SECURITY DEFINER` - Runs with creator's privileges
- `STABLE` - Indicates function doesn't modify database

### Migration

Run the SQL migration:

```bash
# Apply the fix
supabase db push supabase/migrations/fix_function_search_path.sql
```

Or manually in Supabase SQL Editor:

- Copy contents of `supabase/migrations/fix_function_search_path.sql`
- Paste and run in SQL Editor

## Verification

### Check Function Security

```sql
SELECT 
    proname as function_name,
    prosecdef as security_definer,
    proconfig as config_settings
FROM pg_proc 
WHERE proname = 'is_admin';
```

Expected result:

- `security_definer`: true
- `config_settings`: `{search_path=public,pg_temp}`

### Test Leaked Password Protection

1. Try to register with a common password (e.g., "password123")
2. Should receive error about compromised password
3. Try with a strong unique password - should succeed

## Summary

| Security Feature | Status | Action Required |
|------------------|--------|-----------------|
| RLS Policies | ✅ Enabled | None |
| Function Search Path | ⚠️ Needs Fix | Run SQL migration |
| Leaked Password Protection | ⚠️ Disabled | Enable in Dashboard |
