import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface SuccessStory {
    id: string;
    author: string;
    story: string;
    imageUrl?: string;
    date: string;
    sellerId?: string;
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('success_stories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const stories: SuccessStory[] = data.map((story: any) => ({
            id: story.id,
            author: story.author || 'Unknown Author',
            story: story.story || '',
            imageUrl: story.image_url || undefined,
            date: story.created_at,
            sellerId: story.seller_id || undefined,
        }));

        return NextResponse.json(stories);
    } catch (error) {
        console.error('Unexpected error in stories API:', error);
        return NextResponse.json({
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
