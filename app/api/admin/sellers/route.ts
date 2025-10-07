'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { User } from '@/lib/types'

/**
 * @swagger
 * /api/admin/sellers:
 *   get:
 *     description: Returns all sellers for admin management
 *     responses:
 *       200:
 *         description: A list of all sellers.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/sellers ===');
        const user = await getAuthenticatedUser(request);
        console.log('User from auth:', user);
        
        if (!user) {
            console.log('❌ Authentication failed - no user found');
            return NextResponse.json({ 
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            console.log('❌ Access denied - user is not an admin');
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const adminDb = getAdminDb();
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.get();
        
        const sellers: User[] = [];
        snapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.role === 'seller') {
                sellers.push({ id: doc.id, ...userData } as User);
            }
        });
        
        console.log(`✅ Found ${sellers.length} sellers for admin`);

        return NextResponse.json(sellers);
    } catch (error) {
        console.error('❌ Error fetching sellers:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/sellers:
 *   post:
 *     description: Updates a seller status
 *     responses:
 *       200:
 *         description: Seller status updated successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Seller not found.
 */
export async function POST(request: NextRequest) {
    try {
        console.log('=== POST /api/admin/sellers ===');
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        if (user.role !== 'admin') {
            return NextResponse.json({ 
                message: 'Access denied - admin role required',
                userRole: user.role 
            }, { status: 403 });
        }

        const { sellerId, status } = await request.json();

        if (!sellerId || !status) {
            return NextResponse.json({ message: 'Seller ID and status are required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const sellerRef = adminDb.collection('users').doc(sellerId);
        const sellerDoc = await sellerRef.get();

        if (!sellerDoc.exists) {
            return NextResponse.json({ message: 'Seller not found' }, { status: 404 });
        }

        const sellerData = sellerDoc.data();
        if (sellerData && sellerData.role !== 'seller') {
            return NextResponse.json({ message: 'User is not a seller' }, { status: 400 });
        }

        await sellerRef.update({ status });
        console.log('✅ Seller status updated successfully:', sellerId);

        return NextResponse.json({ message: 'Seller status updated successfully' });
    } catch (error) {
        console.error('❌ Error updating seller status:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
