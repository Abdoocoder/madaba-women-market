/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true, // ✅ مؤقتًا فقط — يمكنك تفعيله لاحقًا
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Local images are automatically handled
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

// ✅ Configuration Status Checker
const checkConfig = () => {
  console.log('\n🔧 Configuration Status:\n========================\n');

  // --- Firebase ---
  const firebaseVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  const missingFirebase = firebaseVars.filter((key) => !process.env[key]);

  if (missingFirebase.length === 0) {
    console.log('🔥 Firebase Admin:\n✅ Firebase configuration appears valid\n');
  } else {
    console.warn('🔥 Firebase Admin:\n❌ Missing Firebase environment variables:\n', missingFirebase.join(', '), '\n');
  }

  // --- Cloudinary ---
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.log('🎨 Cloudinary:\n✅ Cloudinary configuration appears valid');
  } else {
    console.warn('🎨 Cloudinary:\n❌ Missing Cloudinary configuration');
  }

  console.log('========================\n');
};

// ✅ Run the check only during build or dev
if (process.env.NODE_ENV !== 'test') {
  checkConfig();
}

export default nextConfig;
