# 🔄 دليل إنشاء مشروع Supabase جديد

> ⚠️ **تحذير**: استخدم هذا الدليل فقط إذا فشلت تماماً في استرجاع الحساب القديم

## 📝 الخطوات المطلوبة

### 1️⃣ إنشاء المشروع الجديد

1. اذهب إلى: https://supabase.com/dashboard
2. انقر **"New Project"**
3. اختر اسم للمشروع: `madaba-women-market`
4. اختر كلمة مرور قوية للـ Database
5. اختر المنطقة: `West EU (Ireland)` أو الأقرب لك

### 2️⃣ تحديث `.env.local`

بعد إنشاء المشروع، انسخ المعلومات التالية:

**من Settings → API:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### 3️⃣ تشغيل Database Migrations

يجب تشغيل جميع ملفات SQL بالترتيب:

```bash
# في Supabase SQL Editor، شغل الملفات بهذا الترتيب:
1. supabase/migrations/enable_rls_security.sql
2. supabase/migrations/sync_roles_to_auth.sql
3. supabase/migrations/fix_function_search_path.sql
4. supabase/migrations/optimize_rls_policies.sql
```

### 4️⃣ إنشاء حساب Admin

```bash
# عدّل البيانات في scripts/create-auth-user.ts
# ثم شغّل:
npm run tsx scripts/create-auth-user.ts
```

### 5️⃣ إعدادات Authentication

في Supabase Dashboard → Authentication → Settings:
- ✅ Enable Email confirmations
- ✅ Enable Leaked Password Protection
- ✅ Configure Google OAuth (اختياري)

### 6️⃣ إعدادات Storage

في Storage → Create new bucket:
- اسم الـ bucket: `product-images`
- Public: ✅ Yes
- Allowed MIME types: `image/*`

---

## ⏱️ الوقت المتوقع

- إنشاء المشروع: 2 دقائق
- تشغيل Migrations: 5-10 دقائق
- الإعدادات: 5 دقائق
- **المجموع**: ~20 دقيقة

---

## 📊 ما ستخسره؟

- ❌ جميع المستخدمين المسجلين
- ❌ جميع المنتجات المضافة
- ❌ جميع الطلبات والمبيعات
- ❌ الصور المرفوعة
- ❌ الإحصائيات والتحليلات

## ✅ ما ستحتفظ به؟

- ✅ الكود البرمجي (Frontend + Backend)
- ✅ التصميم والواجهات
- ✅ نظام الترجمة
- ✅ جميع المكونات (Components)

---

## 🎯 التوصية النهائية

**جرب استرجاع الحساب القديم أولاً!** 

إذا فشل كل شيء بعد 24-48 ساعة، استخدم هذا الدليل لإنشاء مشروع جديد.
