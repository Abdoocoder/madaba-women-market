import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.warn('Cloudinary: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
}

if (!process.env.CLOUDINARY_API_KEY) {
  console.warn('Cloudinary: CLOUDINARY_API_KEY is not configured');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary: CLOUDINARY_API_SECRET is not configured');
}

// Only configure if we have the required environment variables
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
