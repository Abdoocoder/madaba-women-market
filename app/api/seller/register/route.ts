import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

interface SellerRegistrationData {
  name: string
  email: string
  phone: string
  storeName: string
  storeDescription: string
  storeCategory: string
  storeLogo?: string
  instagramUrl?: string
  whatsappUrl?: string
  detailedDescription?: string
  shippingInfo?: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data: SellerRegistrationData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.storeName ||
      !data.storeDescription || !data.storeCategory) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update user profile with seller information
    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        phone: data.phone,
        store_name: data.storeName,
        store_description: data.storeDescription,
        store_category: data.storeCategory,
        avatar_url: data.storeLogo || undefined,
        instagram_url: data.instagramUrl || null,
        whatsapp_url: data.whatsappUrl || null,
        detailed_description: data.detailedDescription || null,
        shipping_info: data.shippingInfo || null,
        role: 'seller',
        status: 'pending', // Sellers need approval
        followers_count: 0,
        rating: 0,
        review_count: 0
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({
      message: 'Seller registered successfully',
      userId: user.id
    })
  } catch (error) {
    console.error('Error registering seller:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
