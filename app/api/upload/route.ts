'use server'

import { NextResponse, NextRequest } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getAuthenticatedUser } from '@/lib/server-auth'

// Define the Cloudinary upload result interface
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  // Remove the [key: string]: any; to avoid the any type
  // We only need the properties we're actually using
}

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'madaba-women-market',
                    public_id: `${user.id}_${Date.now()}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Type cast the result to our interface
        const uploadResult = result as CloudinaryUploadResult;

        return NextResponse.json({ 
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
