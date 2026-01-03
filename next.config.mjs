/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    // unoptimized: true, // Re-enabled optimization for performance
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
    localPatterns: [
      {
        pathname: '/**',
        search: '**',
      },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // --- Supabase ---
  const supabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  const missingSupabase = supabaseVars.filter((key) => !process.env[key]);

  if (missingSupabase.length === 0) {
    console.log('⚡ Supabase:\n✅ Supabase configuration appears valid\n');
  } else {
    console.warn('⚡ Supabase:\n❌ Missing Supabase environment variables:\n', missingSupabase.join(', '), '\n');
  }

  // --- Cloudinary ---
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.log('🎨 Cloudinary:\n✅ Cloudinary configuration appears valid');
  } else {
    console.warn('🎨 Cloudinary:\n❌ Missing Cloudinary configuration');
  }

  console.log('\n========================\n');
};

// ✅ Run the check only during build or dev
if (process.env.NODE_ENV !== 'test') {
  checkConfig();
}

export default nextConfig;
