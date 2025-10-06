'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import type { User } from '@/lib/types'

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     description: Returns all users for admin management
 *     responses:
 *       200:
 *         description: A list of all users.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET /api/admin/users ===');
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
        
        const users: User[] = [];
        snapshot.forEach((doc: any) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
        
        console.log(`✅ Found ${users.length} users for admin`);

        return NextResponse.json(users);
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/users:
 *   put:
 *     description: Updates a user role
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: User not found.
 */
export async function PUT(request: NextRequest) {
    try {
        console.log('=== PUT /api/admin/users ===');
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

        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ message: 'User ID and role are required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await userRef.update({ role });
        console.log('✅ User role updated successfully:', userId);

        return NextResponse.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('❌ Error updating user role:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/users:
 *   delete:
 *     description: Deletes a user
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       400:
 *         description: Bad request (missing ID).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: User not found.
 */
export async function DELETE(request: NextRequest) {
    try {
        console.log('=== DELETE /api/admin/users ===');
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

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await userRef.delete();
        console.log('✅ User deleted successfully:', userId);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
