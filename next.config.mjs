/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add Cloudinary configuration - only expose public variables to the client
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    // Removed CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET as they should not be exposed to the client
  },
};

export default nextConfig;
