'use server'

import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'

interface SuccessStory {
  id: string;
  author: string;
  story: string;
  imageUrl?: string;
  date: string;
  sellerId?: string;
}

/**
 * @swagger
 * /api/admin/stories:
 *   get:
 *     description: Returns all success stories for admin management
 *     responses:
 *       200:
 *         description: A list of success stories.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function GET(request: NextRequest) {
    try {
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

        const adminDb = getAdminDb();
        const storiesRef = adminDb.collection('successStories');
        const snapshot = await storiesRef.orderBy('date', 'desc').get();
        
        const stories: SuccessStory[] = [];
        snapshot.forEach((doc) => {
            const storyData = doc.data();
            stories.push({
                id: doc.id,
                author: storyData.author,
                story: storyData.story,
                imageUrl: storyData.imageUrl,
                date: storyData.date.toDate ? storyData.date.toDate() : new Date(storyData.date),
                sellerId: storyData.sellerId,
            });
        });
        
        return NextResponse.json(stories);
    } catch (error) {
        console.error('Error fetching success stories:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/stories:
 *   post:
 *     description: Creates a new success story
 *     responses:
 *       201:
 *         description: Success story created successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const { author, story, imageUrl, sellerId } = body;

        if (!author || !story) {
            return NextResponse.json({ message: 'Author and story are required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const storyData = {
            author,
            story,
            imageUrl: imageUrl || null,
            date: new Date(),
            sellerId: sellerId || null,
        };

        const docRef = await adminDb.collection('successStories').add(storyData);
        
        return NextResponse.json({ 
            id: docRef.id,
            ...storyData
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating success story:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/stories:
 *   put:
 *     description: Updates an existing success story
 *     responses:
 *       200:
 *         description: Success story updated successfully.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Success story not found.
 */
export async function PUT(request: NextRequest) {
    try {
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Story ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { author, story, imageUrl, sellerId } = body;

        if (!author || !story) {
            return NextResponse.json({ message: 'Author and story are required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const storyRef = adminDb.collection('successStories').doc(id);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
            return NextResponse.json({ message: 'Story not found' }, { status: 404 });
        }

        const updateData = {
            author,
            story,
            ...(imageUrl !== undefined && { imageUrl }), // Only update imageUrl if provided
            ...(sellerId !== undefined && { sellerId }), // Only update sellerId if provided
            updatedAt: new Date(),
        };

        await storyRef.update(updateData);
        
        return NextResponse.json({ 
            id,
            ...updateData
        });
    } catch (error) {
        console.error('Error updating success story:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/admin/stories:
 *   delete:
 *     description: Deletes a success story by ID
 *     responses:
 *       200:
 *         description: Success story deleted successfully.
 *       400:
 *         description: Bad request (missing ID).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - user is not an admin.
 *       404:
 *         description: Success story not found.
 */
export async function DELETE(request: NextRequest) {
    try {
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Story ID is required' }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const storyRef = adminDb.collection('successStories').doc(id);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
            return NextResponse.json({ message: 'Story not found' }, { status: 404 });
        }

        await storyRef.delete();
        
        return NextResponse.json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting success story:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
