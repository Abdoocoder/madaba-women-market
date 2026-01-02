import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function seed() {
    console.log('Seeding success_stories...');

    const testStory = {
        author: 'ريما علي',
        story: 'بفضل منصة مادبا وومن ماركت، استطعت تحويل هوايتي في صناعة الموزاييك إلى مشروع مدر للربح. الدعم الفني والتدريبات المجانية كانت حاسمة في نجاحي.',
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('success_stories')
        .insert(testStory)
        .select();

    if (error) {
        console.error('Error seeding story:', error);
    } else {
        console.log('Successfully seeded story:', data);
    }
}

seed();
