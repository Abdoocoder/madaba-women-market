'use server'

import { NextResponse, NextRequest } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getAuthenticatedUser } from '@/lib/server-auth'

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

        return NextResponse.json({ 
            url: (result as any).secure_url,
            public_id: (result as any).public_id
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
