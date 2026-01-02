# Madaba Women Market | سوق مادبا للسيدات

🌟 **A leading platform in Madaba aimed at empowering women and supporting them to achieve success through e-commerce, built with Next.js 16, Firebase, and TypeScript**

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-cyan)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

## 🔥 Recent Updates & Improvements

### 🛡️ Security & Core Updates (Latest)

- **Next.js 16.1.1 Upgrade**: Updated core framework to the latest stable version 16.1.1, resolving CVE-2025-66478 and unblocking Vercel deployments.
- **Dependency Cleanup**: Removed unused dependencies like `vue-router` and fixed all ESLint errors/warnings.
- **Stories API Fix**: Resolved 503 errors by correcting Firebase Admin SDK credentials configuration.

### 🎨 UX/UI Overhaul (New)

- **Mobile-First Experience**: Implemented a **2-column product grid** for mobile devices (up from 1), significantly improving browseability on small screens.
- **Polished Loading States**: Replaced generic text with modern **Skeleton UI** animations for a smoother visual experience.
- **Performance Optimization**: Fixed browser "Intervention" warnings by prioritizing Hero image loading (improved LCP).

### 🔍 SEO & Social Presence (New)

- **Rich Metadata**: Added comprehensive Open Graph and Twitter Card tags for professional social sharing previews.
- **Smart SEO**: Optimized `layout.tsx` with keywords, authors, and proper robots directives.

### ✅ Firestore Internal Error Fix (Previous)

- **Fixed Firestore Internal Assertion Error**: Resolved "Unexpected state (ID: ca9)" error by improving listener cleanup
- **Enhanced Error Handling**: Improved auth and cart context to handle network issues and permission errors gracefully
- **Race Condition Prevention**: Added timeouts to prevent race conditions in Firestore listeners
- **Environment Configuration**: Added sample .env.local file with placeholder values

### ✅ Firebase Admin SDK Integration (Previous)

- **Build Error Resolution**: Fixed "Service account object must contain a string 'private_key' property" error
- **Safe Initialization**: Updated Firebase Admin SDK to handle build-time scenarios gracefully with singleton pattern
- **API Route Compatibility**: All API routes updated with safe Firebase Admin getter functions
- **Environment Handling**: Added proper environment variable validation and fallbacks
- **Enhanced Error Handling**: Improved error messages and debugging capabilities
- **Production Build**: Successfully builds without Firebase credential errors

### ✅ Next.js 15+ Compatibility

- **Dynamic Route Parameters**: Updated all API routes to handle `Promise<{ id: string }>` pattern
- **Authentication Modernization**: Migrated from deprecated `token` property to async `getAuthToken()` function
- **Type Safety**: Resolved all TypeScript compilation errors with strict mode
- **Component Updates**: Fixed prop requirements and interface compatibility

### 🎨 UI Components Enhanced

- **Custom Carousel**: Built responsive carousel component for success stories
- **Theme Provider**: Fixed Next-themes integration with proper TypeScript support
- **Badge Components**: Updated variants to use supported options
- **Form Validation**: Enhanced with proper error handling

### 🛠️ Development Experience

- **Zero Build Errors**: All TypeScript compilation issues resolved
- **Successful Production Build**: Firebase Admin SDK errors completely fixed
- **Hot Reload**: Development server starts successfully with fast refresh
- **Code Quality**: Comprehensive linting and type checking
- **Performance**: Optimized component rendering and data fetching
- **Environment Safety**: Proper handling of environment variables during build

---

## 🚀 Live Demo

**Ready for deployment** - The application is fully production-ready with all compatibility issues resolved!

🔧 **Current Status**:

- ✅ Development server running successfully
- ✅ All TypeScript compilation errors fixed
- ✅ **Production build completes successfully** ✨ (19/19 pages generated)
- ⚠️ **Configuration Required** - Firebase Admin and Cloudinary credentials need setup
- ✅ Next.js 16.1.1 fully compatible
- ✅ **Ready for production deployment** 🚀

### 🔧 Configuration Setup Required

The application is fully functional but requires proper credentials to run:

#### 🔥 Firebase Admin Setup

The current Firebase Admin credentials in `.env.local` are placeholder data. To fix the 401 authentication errors:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `madaba-women-market-ac54c`
3. Go to **Project Settings > Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Update your `.env.local` file with the real values:

```env
FIREBASE_PROJECT_ID="your-actual-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

#### 🎨 Cloudinary Setup

The current Cloudinary API secret is placeholder data. To fix the 400 upload errors:

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your **Cloud Name**, **API Key**, and **API Secret**
3. Update your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

#### Quick Setup Helper

Run the setup helper script for detailed instructions:

```bash
bash setup-credentials.sh
```

After updating the credentials, restart your development server:

```bash
npm run dev
```

---

## 🌟 Overview

Madaba Women Market is a leading platform in Madaba aimed at empowering women and supporting them to achieve success through e-commerce. Built with **Next.js 16** and modern web technologies, this **production-ready** application provides a complete marketplace experience with features for customers, sellers, and administrators.

🏆 **Latest Achievement**: Successfully updated to **Next.js 16.1.1**, resolved all compatibility issues, and optimized for mobile performance!

### ✨ Key Highlights

- 🔥 **Production-Ready**: Fully deployed with Firebase backend and Next.js 16 compatibility
- 💰 **Free Hosting**: Vercel + Firebase Spark + Cloudinary free plans
- 🌍 **Bilingual**: Arabic and English support with RTL/LTR layouts
- 📱 **Responsive**: Mobile-first design with **2-column grid layout**
- 🔐 **Secure**: Firebase Authentication with proper security rules
- ⚡ **Fast**: Next.js 16 with App Router and Skeleton loading animations
- ✅ **TypeScript**: Strict type checking with zero compilation errors
- 🎨 **Modern UI**: Shadcn/UI components with custom carousel implementation

## 📦 Features

### 👥 User Management

- 🔑 Secure authentication (Email/Password + Google OAuth)
- 📝 User profiles with avatar upload
- 📷 Email verification system
- 🔄 Password reset functionality

### 🛍️ E-commerce Core

- 📋 Product catalog with categories
- 🛒 Shopping cart with real-time updates
- ❤️ Wishlist functionality
- 💳 Order management system
- 📷 Image upload via Cloudinary

### 📈 Seller Dashboard

- 📋 Product CRUD operations
- 📉 Sales analytics and charts
- 📦 Order management
- 📋 Inventory tracking
- 🏪 Store customization (name, description, cover image)
- 🔗 Social media integration (Instagram, WhatsApp)
- ⭐ Store rating system

### 👑 Admin Panel

- 👥 User management
- 🏢 Seller approval system
- 📋 Product moderation
- 📈 Platform analytics

### 🌍 Internationalization

- 🇦🇪 Arabic (RTL)
- 🇺🇸 English (LTR)
- Dynamic language switching

---

## 🚀 Quick Start

### 📋 Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase account
- Cloudinary account

### 💾 Installation

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd madaba-women-market
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or: pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`

4. **Run development server**

   ```bash
   npm run dev
   # or: pnpm dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### 🔥 Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email + Google)
3. Create Firestore database and apply rules from `firestore.rules`
4. Get keys from Project Settings and add to `.env.local`

### 🎨 Cloudinary Integration

1. Create Cloudinary account
2. Create upload preset "madaba-women-market"
3. Add API keys to `.env.local`

---

## 🛠️ Tech Stack

### 🖥️ Frontend

- **Framework**: [Next.js 16.1.1](https://nextjs.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + Framer Motion
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod

### 🔥 Backend

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Admin**: Firebase Admin SDK
- **Storage**: Cloudinary

---

## Project Structure

```text
.
├── app/                    # Next.js App Router (16.1.1)
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes (Firebase Admin)
│   ├── seller/              # Seller dashboard
│   └── (auth)/              # Authentication
├── components/             # UI components
├── lib/                    # Utils & Config
├── locales/                # i18n
├── firestore.rules         # Security rules
└── DEPLOYMENT.md           # Instructions
```

---

## 🏧 Architecture Overview

### 🌐 Frontend Architecture

- **App Router**: Modern routing with Server Components
- **TypeScript**: Strict type safety
- **Performance**: Code splitting and loading skeletons

### 🔥 Backend Architecture

- **Firestore**: Scalable NoSQL storage
- **Cloudinary**: CDN-based image management

### 🛡️ Security

- Database-level rules
- Server-side authorization in API routes

### 🔄 Data Flow

1. **Client**: Interaction via React components
2. **Context**: Global state management
3. **API**: Next.js Server Components / API Routes
4. **Firebase**: Real-time database sync

---

## 🚀 Deployment

### 🌍 Free Hosting Stack

- **Frontend**: Vercel
- **Backend**: Firebase Spark
- **Images**: Cloudinary
- **Cost**: $0/month 🎉

### 🛠️ Production Setup

1. **Build for Production**

   ```bash
   npm run build
   npm run start
   ```

2. **Deploy**
   - Connect GitHub to Vercel
   - Add all environment variables to Vercel Dashboard

---

## 🔧 Troubleshooting

### **Firestore Internal Error**

Resolved in latest update via proper listener cleanup and race condition prevention.

### **Firebase Admin SDK Build Error**

Resolved via safe initialization singleton pattern and env validation.

---

## 🤝 Contributing

We welcome contributions! Please see our guidelines.

## 📄 License

Licensed under MIT.

### Built with ❤️ to empower women in Madaba

[🌐 Live Demo](https://madaba-women-market.vercel.app/) | [📚 Documentation](DEPLOYMENT.md) | [🐛 Report Bug](https://github.com/Abdoocoder/madaba-women-market/issues)
