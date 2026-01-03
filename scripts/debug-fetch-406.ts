import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminId = 'e659eb07-e435-46ab-9aae-bdce2cc86dc7';

async function testFetch() {
    const url = `${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${adminId}`;
    console.log(`Testing fetch to: ${url}`);

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseAnonKey!,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Accept': 'application/json'
        }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('Response:', text);

    // Try with .single() equivalent header
    console.log('\nTesting with Accept: application/vnd.pgrst.object+json (single equivalent)');
    const response2 = await fetch(url, {
        headers: {
            'apikey': supabaseAnonKey!,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Accept': 'application/vnd.pgrst.object+json'
        }
    });
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    const text2 = await response2.text();
    console.log('Response:', text2);
}

testFetch();
