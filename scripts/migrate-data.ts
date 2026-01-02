import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
}

async function migrateUsers(db: any, supabase: any) {
    console.log('--- Migrating Users ---');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Firestore Users count: ${usersSnapshot.size}`);

    for (const doc of usersSnapshot.docs) {
        const user = { id: doc.id, ...doc.data() };
        console.log(`Processing user: ${user.id} (${user.email || 'no email'})`);

        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            avatar_url: user.photoURL || user.avatar,
            phone: user.phone,
            store_name: user.storeName,
            store_description: user.storeDescription,
            store_cover_image: user.storeCoverImage,
            instagram_url: user.instagramUrl,
            whatsapp_url: user.whatsappUrl,
            rating: user.rating || 0,
            review_count: user.reviewCount || 0,
            followers_count: user.followersCount || 0,
            followed_sellers: user.followedSellers || [],
            created_at: user.createdAt?.toDate?.() || new Date()
        });

        if (error) {
            console.error(`  ❌ Error: ${error.message} (code: ${error.code})`);
        } else {
            console.log(`  ✅ Success`);
        }
    }
}

async function migrateProducts(db: any, supabase: any) {
    console.log('\n--- Migrating Products ---');
    const productsSnapshot = await db.collection('products').get();
    console.log(`Firestore Products count: ${productsSnapshot.size}`);

    for (const doc of productsSnapshot.docs) {
        const product = { id: doc.id, ...doc.data() };
        console.log(`Processing product: ${product.id} (${product.name})`);

        const { error } = await supabase.from('products').upsert({
            id: product.id,
            name: product.name,
            name_ar: product.nameAr,
            description: product.description,
            description_ar: product.descriptionAr,
            price: product.price,
            category: product.category,
            image_url: product.image,
            seller_id: product.sellerId,
            seller_name: product.sellerName,
            stock: product.stock || 0,
            featured: product.featured || false,
            approved: product.approved || false,
            suspended: product.suspended || false,
            purchase_count: product.purchaseCount || 0,
            created_at: product.createdAt?.toDate?.() || new Date()
        });

        if (error) {
            console.error(`  ❌ Error: ${error.message} (code: ${error.code})`);
        } else {
            console.log(`  ✅ Success`);
        }
    }
}

async function migrateOrders(db: any, supabase: any) {
    console.log('\n--- Migrating Orders ---');
    const ordersSnapshot = await db.collection('orders').get();
    console.log(`Firestore Orders count: ${ordersSnapshot.size}`);

    for (const doc of ordersSnapshot.docs) {
        const order = { id: doc.id, ...doc.data() };
        console.log(`Processing order: ${order.id}`);

        const { error: orderError } = await supabase.from('orders').upsert({
            id: order.id,
            customer_id: order.customerId,
            customer_name: order.customerName,
            seller_id: order.sellerId,
            seller_name: order.sellerName,
            total_price: order.totalPrice || order.total || 0,
            status: order.status,
            shipping_address: order.shipping_address || order.shippingAddress,
            customer_phone: order.customerPhone,
            payment_method: order.paymentMethod || 'COD',
            created_at: order.createdAt?.toDate?.() || new Date()
        });

        if (orderError) {
            console.error(`  ❌ Order Error: ${orderError.message} (code: ${orderError.code})`);
            continue;
        } else {
            console.log(`  ✅ Order Success`);
        }

        if (order.items && Array.isArray(order.items)) {
            const orderItems = order.items.map((item: any) => ({
                order_id: order.id,
                product_id: item.product?.id || item.id,
                product_name: item.product?.name || item.name,
                quantity: item.quantity,
                price: item.product?.price || item.price || 0
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) {
                console.error(`  ❌ Items Error: ${itemsError.message} (code: ${itemsError.code})`);
            } else {
                console.log(`  ✅ Items Success (${orderItems.length} items)`);
            }
        }
    }
}

async function migrateReviews(db: any, supabase: any) {
    console.log('\n--- Migrating Reviews ---');
    const reviewsSnapshot = await db.collection('reviews').get();
    console.log(`Firestore Reviews count: ${reviewsSnapshot.size}`);

    for (const doc of reviewsSnapshot.docs) {
        const review = { id: doc.id, ...doc.data() };
        console.log(`Processing review: ${review.id}`);

        const { error } = await supabase.from('reviews').upsert({
            id: review.id,
            product_id: review.productId,
            user_id: review.userId,
            user_name: review.userName,
            rating: review.rating,
            comment: review.comment,
            created_at: review.createdAt?.toDate?.() || new Date()
        });

        if (error) {
            console.error(`  ❌ Error: ${error.message} (code: ${error.code})`);
        } else {
            console.log(`  ✅ Success`);
        }
    }
}

async function main() {
    try {
        console.log('Starting migration...');
        const { createClient } = await import('@supabase/supabase-js');
        const { getAdminDb } = await import('../lib/firebaseAdmin');

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        const db = getAdminDb();

        if (!db) {
            throw new Error('Could not initialize Firebase Admin DB');
        }

        await migrateUsers(db, supabase);
        await migrateProducts(db, supabase);
        await migrateOrders(db, supabase);
        await migrateReviews(db, supabase);

        console.log('\nMigration process finished.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

main();
