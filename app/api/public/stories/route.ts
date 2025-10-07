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
        console.error('Error fetching public success stories:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
