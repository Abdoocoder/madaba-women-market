# Madaba Women Market | سوق مادبا للسيدات

🌟 **A leading platform in Madaba aimed at empowering women and supporting them to achieve success through e-commerce, built with Next.js 16, Supabase, and TypeScript**

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-cyan)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

## 🔥 Recent Updates & Improvements

### 🛡️ Core Migration & Security (Latest)

- **Supabase Migration**: Complete migration from Firebase to Supabase for Authentication, Database (PostgreSQL), and Real-time subscriptions.
- **Next.js 16.1.1 Upgrade**: Updated core framework to the latest stable version, resolving compatibility issues and enhancing performance.
- **Role-Based Access Control (RBAC)**: Robust security with defined roles (Admin, Seller, Customer) protected by middleware and RLS (Row Level Security).

### 🎨 UX/UI & Features (New)

- **Admin Dashboard**: Comprehensive control panel for managing users, sellers, products, orders, and viewing detailed analytics.
- **Seller Dashboard**: Dedicated portal for sellers to manage their stores, products, and view sales performance.
- **Mobile-First Experience**: Optimized **2-column product grid** and responsive design for seamless mobile usage.
- **Polished Loading States**: Modern **Skeleton UI** animations for a smoother user experience.

### 🔍 SEO & Social Presence

- **Rich Metadata**: Comprehensive Open Graph and Twitter Card tags for professional social sharing.
- **Smart SEO**: Optimized layouts with keywords, authors, and structured data.

---

## 🚀 Live Demo

**Ready for deployment** - The application is fully production-ready!

[🌐 Live Demo](https://madaba-women-market.vercel.app/)

---

## 🌟 Overview

Madaba Women Market is a leading platform in Madaba aimed at empowering women and supporting them to achieve success through e-commerce. Built with **Next.js 16** and modern web technologies, this **production-ready** application provides a complete marketplace experience.

### ✨ Key Highlights

- 🔥 **Modern Stack**: Next.js 16 + Supabase + Tailwind CSS 4.
- 💰 **Cost-Effective**: Designed to run on free tiers (Vercel, Supabase, Cloudinary).
- 🌍 **Bilingual**: Full Arabic (RTL) and English (LTR) support.
- 📱 **Responsive**: Mobile-first design with adaptive layouts.
- 🔐 **Secure**: Enterprise-grade security with Supabase Auth & RLS.
- ⚡ **Fast**: Server Components, streaming, and optimized assets.

---

## 📦 Features

### 👥 User Management

- 🔑 Secure Authentication (Email/Password + Google OAuth via Supabase).
- 📝 Comprehensive User Profiles.
- 🔄 Password Reset & Email Verification flows.

### 🛍️ E-commerce Core

- 📋 Rich Product Catalog with categories and search.
- 🛒 Smart Shopping Cart with real-time updates.
- ❤️ Wishlist functionality.
- 💳 Complete Order Management cycle.
- 📷 High-performance Image delivery via Cloudinary.

### 📈 Seller Dashboard

- 🏪 Store Management (Profile, Settings, Branding).
- 📦 Advanced Product Management (CRUD, Inventory).
- 📉 Real-time Sales Analytics & Charts.
- 📋 Order Processing & Status Tracking.

### 👑 Admin Panel

- 👥 User & Role Management.
- 🏢 Seller Approval & Moderation System.
- 📋 Global Product Oversight.
- 📊 Platform-wide Analytics & Reports.
- 📝 Success Stories Management.

---

## 🚀 Quick Start

### 📋 Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase Project
- Cloudinary Account

### 💾 Installation

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd madaba-women-market
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" # For Admin API routes

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

### 🖥️ Frontend

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + Radix UI
- **Animations**: Framer Motion
- **State Management**: React Context + SWR/TanStack Query patterns

### 🔥 Backend & Services

- **Backend as a Service**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Cloudinary (Media) + Supabase Storage (Files)
- **Hosting**: Vercel

---

## 🏧 Architecture

### 🛡️ Security Model

- **Row Level Security (RLS)**: Database-level protection ensuring users can only access data they are permitted to.
- **Middleware**: Edge-compatible authentication checks for protected routes (`/admin`, `/seller`).

### 📂 Project Structure

```text
.
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── admin/              # Admin Dashboard
│   ├── seller/             # Seller Dashboard
│   ├── api/                # API Routes
│   └── ...                 # Public pages
├── components/             # Reusable UI components
├── lib/                    # Utilities & Constants
│   ├── supabase.ts         # Supabase Client
│   └── ...
├── locales/                # Internationalization (i18n)
└── middleware.ts           # Auth & Route protection
```

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a pull request.

## 📄 License

Licensed under MIT.

---

### Built with ❤️ to empower women in Madaba

[🌐 Live Demo](https://madaba-women-market.vercel.app/) | [🐛 Report Bug](https://github.com/Abdoocoder/madaba-women-market/issues)
