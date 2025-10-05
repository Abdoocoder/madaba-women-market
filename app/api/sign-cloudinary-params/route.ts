import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return new Response(
        JSON.stringify({ error: 'Missing paramsToSign' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return new Response(
      JSON.stringify({ signature }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error signing Cloudinary parameters:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to sign parameters' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}