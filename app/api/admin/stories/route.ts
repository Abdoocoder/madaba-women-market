import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

interface SuccessStory {
    id: string;
    author: string;
    story: string;
    imageUrl?: string;
    date: string;
    sellerId?: string;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('success_stories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const stories: SuccessStory[] = data.map((story: any) => ({
            id: story.id,
            author: story.author,
            story: story.story,
            imageUrl: story.image_url,
            date: story.created_at,
            sellerId: story.seller_id,
        }));

        return NextResponse.json(stories);
    } catch (error) {
        console.error('Error fetching success stories:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const { author, story, imageUrl, sellerId } = body;

        if (!author || !story) {
            return NextResponse.json({ message: 'Author and story are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('success_stories')
            .insert({
                author,
                story,
                image_url: imageUrl || null,
                seller_id: sellerId || null,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            id: data.id,
            author: data.author,
            story: data.story,
            imageUrl: data.image_url,
            date: data.created_at,
            sellerId: data.seller_id
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating success story:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
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

        const { data, error } = await supabase
            .from('success_stories')
            .update({
                author,
                story,
                image_url: imageUrl || undefined,
                seller_id: sellerId || undefined,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            id: data.id,
            author: data.author,
            story: data.story,
            imageUrl: data.image_url,
            date: data.created_at,
            sellerId: data.seller_id
        });
    } catch (error) {
        console.error('Error updating success story:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Story ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('success_stories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting success story:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
