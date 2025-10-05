# Madaba Women Market | سوق مدابا للسيدات

🌟 **A modern, production-ready e-commerce platform built with Next.js, Firebase, and TypeScript**

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo

**Deployed on Vercel with Firebase backend** - Experience the full application with real-time data!

---

## 🌟 Overview

Madaba Women Market is a comprehensive e-commerce platform designed to empower women entrepreneurs. Built with modern web technologies and deployed using free hosting solutions, this application provides a complete marketplace experience with features for customers, sellers, and administrators.

### ✨ Key Highlights
- 🔥 **Production-Ready**: Fully deployed with Firebase backend
- 💰 **Free Hosting**: Vercel + Firebase Spark + Cloudinary free plans
- 🌍 **Bilingual**: Arabic and English support
- 📱 **Responsive**: Mobile-first design
- 🔐 **Secure**: Firebase Authentication with proper security rules
- ⚡ **Fast**: Next.js with optimized performance

## 📦 Features

### 👥 **User Management**
- 🔑 Secure authentication (Email/Password + Google OAuth)
- 📝 User profiles with avatar upload
- 📷 Email verification system
- 🔄 Password reset functionality

### 🛍️ **E-commerce Core**
- 📋 Product catalog with categories
- 🛒 Shopping cart with real-time updates
- ❤️ Wishlist functionality
- 💳 Order management system
- 📷 Image upload via Cloudinary

### 📈 **Seller Dashboard**
- 📋 Product CRUD operations
- 📉 Sales analytics and charts
- 📦 Order management
- 📋 Inventory tracking

### 👑 **Admin Panel**
- 👥 User management
- 🏢 Seller approval system
- 📋 Product moderation
- 📈 Platform analytics

### 🌍 **Internationalization**
- 🇦🇪 Arabic (RTL)
- 🇺🇸 English (LTR)
- Dynamic language switching

## 🚀 Quick Start

### 📋 **Prerequisites**
- Node.js 18+ 
- pnpm or npm
- Firebase account
- Cloudinary account (for images)

### 💾 **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd madaba-women-market
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase and Cloudinary credentials in `.env.local`

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### 🔥 **Firebase Setup**

1. Create a new Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database
4. Apply security rules from `firestore.rules`
5. Get your config keys and add to `.env.local`

### 🎨 **Cloudinary Setup**

1. Create Cloudinary account
2. Create upload preset "madaba-women-market"
3. Add API keys to `.env.local`

## 🛠️ Tech Stack

### 🖥️ **Frontend**
- **Framework**: [Next.js 15.5.4](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1.9](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: React Context API
- **Forms**: [React Hook Form](https://react-hook-form.com/)

### 🔥 **Backend**
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore) (NoSQL)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **API Routes**: Next.js API Routes with Firebase Admin SDK
- **File Storage**: [Cloudinary](https://cloudinary.com/) (Images)

### 🚀 **Deployment & Hosting**
- **Hosting**: [Vercel](https://vercel.com/) (Free Plan)
- **Database**: Firebase Spark Plan (Free)
- **Images**: Cloudinary Free Plan
- **Analytics**: Vercel Analytics + Firebase Analytics

### 🛡️ **Security & Performance**
- Firebase Security Rules
- Next.js Security Headers
- Image Optimization
- Code Splitting & Lazy Loading

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes (Firebase integration)
│   ├── seller/              # Seller dashboard
│   └── (auth)/              # Authentication pages
├── components/             # Reusable UI components
│   ├── ui/                  # Shadcn/UI components
│   ├── admin/               # Admin-specific components
│   └── seller/              # Seller-specific components
├── lib/                    # Utilities and configurations
│   ├── firebase.ts          # Firebase client config
│   ├── firebaseAdmin.ts     # Firebase admin config
│   ├── auth-context.tsx     # Authentication context
│   └── types.ts             # TypeScript definitions
├── locales/                # Internationalization files
├── firestore.rules         # Firebase security rules
├── .env.example            # Environment variables template
└── DEPLOYMENT.md           # Deployment instructions
```

## 🏧 Architecture Overview

### 🌐 **Frontend Architecture**
- **Next.js App Router**: Modern routing with React Server Components
- **TypeScript**: Type-safe development with strict mode
- **Tailwind CSS**: Utility-first CSS framework
- **Component-based**: Modular, reusable UI components
- **Context API**: State management for auth, cart, and locale

### 🔥 **Backend Architecture**
- **Firebase Firestore**: NoSQL database for scalable data storage
- **Firebase Auth**: Secure user authentication and authorization
- **Next.js API Routes**: Server-side API with Firebase Admin SDK
- **Cloudinary**: CDN-based image storage and optimization

### 🛡️ **Security Implementation**
- **Firestore Security Rules**: Database-level access control
- **Firebase Auth**: JWT-based authentication
- **API Route Protection**: Server-side authorization checks
- **Input Validation**: Client and server-side validation

### 🔄 **Data Flow**
1. **Client**: User interacts with React components
2. **Context**: State management handles auth/cart state
3. **API Routes**: Next.js APIs validate and process requests
4. **Firebase**: Secure database operations with admin SDK
5. **Real-time**: Firestore provides real-time data updates

## 🚀 Deployment

This application is configured for **free production hosting** using:

### 🌍 **Free Hosting Stack**
- **Frontend**: Vercel (100GB bandwidth/month)
- **Backend**: Firebase Spark (20k reads/writes daily) 
- **Images**: Cloudinary (25k transformations/month)
- **Total Cost**: $0/month 🎉

### 🛠️ **Production Deployment**

1. **Prepare Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   # Fill in your Firebase + Cloudinary credentials
   ```

2. **Build for Production**
   ```bash
   pnpm build
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Add all `.env.local` variables to Vercel dashboard
   - Ensure Firebase security rules are applied
   - Test all functionality

### 📊 **Performance Monitoring**
- Vercel Analytics for frontend performance
- Firebase Console for backend metrics
- Cloudinary dashboard for image usage

> 📄 **Detailed deployment guide**: See `DEPLOYMENT.md`

## 🔧 Environment Variables

Create `.env.local` with the following configuration:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Environment
NODE_ENV=production
```

⚠️ **Security Note**: Never commit `.env.local` to version control. Keep your Firebase private keys secure!

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Firebase Team** for the excellent backend services
- **Vercel** for free hosting platform
- **Cloudinary** for image management
- **Shadcn** for beautiful UI components

---

<div align="center">

**Built with ❤️ for women entrepreneurs**

[🌐 Live Demo](https://your-deployed-url.vercel.app) | [📚 Documentation](DEPLOYMENT.md) | [🐛 Report Bug](https://github.com/your-repo/issues)

</div>