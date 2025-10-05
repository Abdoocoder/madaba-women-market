'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        console.log('Debug - Auth header present:', !!authHeader);
        console.log('Debug - Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
        
        const user = await getAuthenticatedUser(request);
        
        return NextResponse.json({
            authHeaderPresent: !!authHeader,
            authHeaderValid: authHeader?.startsWith('Bearer '),
            userFound: !!user,
            userRole: user?.role,
            userId: user?.id,
        });
    } catch (error) {
        console.error('Debug auth error:', error);
        return NextResponse.json({ 
            error: 'Debug failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
