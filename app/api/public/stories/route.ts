import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'

interface SuccessStory {
  id: string;
  author: string;
  story: string;
  imageUrl?: string;
  date: string;
  sellerId?: string; // Add seller ID reference
}

/**
 * @swagger
 * /api/public/stories:
 *   get:
 *     description: Returns all approved success stories for public display
 *     responses:
 *       200:
 *         description: A list of success stories.
 */
export async function GET() {
    try {
        let adminDb;
        try {
            adminDb = getAdminDb();
        } catch (initError) {
            console.error('Failed to initialize Firebase Admin:', initError);
            return NextResponse.json({ 
                message: 'Service Unavailable',
                error: 'Failed to initialize Firebase Admin: ' + (initError instanceof Error ? initError.message : 'Unknown error')
            }, { status: 503 });
        }
        
        if (!adminDb) {
            console.error('Firebase Admin DB not initialized');
            return NextResponse.json({ 
                message: 'Service Unavailable',
                error: 'Firebase Admin DB not initialized'
            }, { status: 503 });
        }
        
        let snapshot;
        try {
            const storiesRef = adminDb.collection('successStories');
            snapshot = await storiesRef.orderBy('date', 'desc').get();
        } catch (firestoreError) {
            console.error('Failed to fetch stories from Firestore:', firestoreError);
            return NextResponse.json({ 
                message: 'Database Error',
                error: 'Failed to fetch stories from Firestore: ' + (firestoreError instanceof Error ? firestoreError.message : 'Unknown error')
            }, { status: 500 });
        }
        
        const stories: SuccessStory[] = [];
        snapshot.forEach((doc) => {
            const storyData = doc.data();
            // Handle date conversion more robustly
            let dateValue: string;
            try {
                if (storyData.date && typeof storyData.date.toDate === 'function') {
                    dateValue = storyData.date.toDate().toISOString();
                } else if (storyData.date instanceof Date) {
                    dateValue = storyData.date.toISOString();
                } else if (typeof storyData.date === 'string') {
                    // Try to parse the string as a date
                    const parsedDate = new Date(storyData.date);
                    dateValue = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
                } else {
                    dateValue = new Date().toISOString();
                }
            } catch (dateError) {
                console.error('Error converting date for story:', doc.id, dateError);
                dateValue = new Date().toISOString();
            }
            
            stories.push({
                id: doc.id,
                author: storyData.author || 'Unknown Author',
                story: storyData.story || '',
                imageUrl: storyData.imageUrl || undefined,
                date: dateValue,
                sellerId: storyData.sellerId || undefined,
            });
        });
        
        return NextResponse.json(stories);
    } catch (error) {
        console.error('Unexpected error in stories API:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
