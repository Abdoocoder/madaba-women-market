# Production Deployment Checklist

## 🔒 Security Configuration

### 1. Environment Variables
Ensure these are set in your production environment (NOT in your repository):

```env
# Firebase Client Configuration (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id

# Firebase Admin SDK (Server-side - Production)
FIREBASE_PROJECT_ID=your_production_project_id
FIREBASE_CLIENT_EMAIL=your_production_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_production_private_key\n-----END PRIVATE KEY-----\n"

# Cloudinary Configuration (Production)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# Additional Security
NODE_ENV=production
```

### 2. Firebase Security Rules
Update your Firestore security rules for production:

```javascript
// Firestore Security Rules (Production)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - sellers can manage their own, everyone can read approved ones
    match /products/{productId} {
      allow read: if resource.data.approved == true;
      allow create, update: if request.auth != null && 
        request.auth.uid == resource.data.sellerId;
    }
    
    // Orders - users can only access their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.customerId;
    }
  }
}
```

### 3. Firebase Authentication Settings
- Enable only required sign-in methods
- Set up proper redirect URLs for production domain
- Configure password requirements
- Enable email verification requirement

## 🚀 Production Optimizations

### 1. Next.js Configuration
Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig
```

### 2. Remove Development Dependencies
Remove all console.logs, debug components, and development tools before deployment.

### 3. Database Indexes
Create proper indexes in Firestore for production queries:
- `users` collection: index by `email`, `role`, `status`
- `products` collection: index by `category`, `approved`, `sellerId`
- `orders` collection: index by `customerId`, `status`, `createdAt`

## 🔐 Security Best Practices

### 1. Authentication Security
- ✅ Email verification required
- ✅ Strong password requirements
- ✅ Account lockout after failed attempts
- ✅ Secure session management
- ✅ Firebase Admin SDK properly configured with service account

### 2. Data Protection
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection prevention (using Firestore)

### 3. API Security
- ✅ Firebase Security Rules
- ✅ Authentication required for sensitive operations
- ✅ Rate limiting (Firebase handles this)
- ✅ HTTPS only in production

## 📊 Monitoring & Analytics

### 1. Error Tracking
Consider adding error tracking service like Sentry:

```bash
npm install @sentry/nextjs
```

### 2. Performance Monitoring
- Use Vercel Analytics if deploying on Vercel
- Monitor Firebase usage and costs
- Set up alerts for high usage

### 3. User Analytics
- Track user registration/login patterns
- Monitor authentication failures
- Track user engagement metrics

## 🚨 Critical Reminders

1. **Never commit .env files** to version control
2. **Use different Firebase projects** for development and production
3. **Test all authentication flows** in production environment
4. **Monitor Firebase usage** to avoid unexpected costs
5. **Backup your Firestore data** regularly
6. **Keep dependencies updated** for security patches
7. **Verify Firebase Admin SDK configuration** to prevent 401 errors
8. **Test API routes thoroughly** after deployment

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] Firebase security rules updated
- [ ] Firebase Admin SDK properly configured
- [ ] Cloudinary credentials configured
- [ ] Console logs removed or environment-gated
- [ ] Error handling tested
- [ ] Email verification flow tested
- [ ] Password reset flow tested
- [ ] Google OAuth configured for production domain
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Database indexes created
- [ ] Monitoring/analytics set up
- [ ] API routes tested for authentication
- [ ] Seller dashboard functionality verified