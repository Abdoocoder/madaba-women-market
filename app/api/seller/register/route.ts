import { NextResponse } from 'next/server'
import { getAdminDb, getAdminAuth } from '@/lib/firebaseAdmin'

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

/**
 * @swagger
 * /api/seller/register:
 *   post:
 *     description: Register a new seller
 *     responses:
 *       200:
 *         description: Seller registered successfully.
 *       400:
 *         description: Bad request (missing data).
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    const data: SellerRegistrationData = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.storeName || 
        !data.storeDescription || !data.storeCategory) {
      return NextResponse.json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    // Get Firebase Admin instances
    const adminDb = getAdminDb()
    const adminAuth = getAdminAuth()
    
    // Get the current user
    const authUser = await adminAuth.getUserByEmail(data.email)
    
    if (!authUser) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      )
    }
    
    // Update user document with seller information
    const userRef = adminDb.collection('users').doc(authUser.uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: 'User document not found' }, 
        { status: 404 }
      )
    }
    
    // Update user with seller information
    await userRef.update({
      name: data.name,
      phone: data.phone,
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      storeCategory: data.storeCategory,
      ...(data.storeLogo && { storeLogo: data.storeLogo }),
      ...(data.instagramUrl && { instagramUrl: data.instagramUrl }),
      ...(data.whatsappUrl && { whatsappUrl: data.whatsappUrl }),
      ...(data.detailedDescription && { detailedDescription: data.detailedDescription }),
      ...(data.shippingInfo && { shippingInfo: data.shippingInfo }),
      role: 'seller',
      status: 'pending', // Sellers need approval
      createdAt: userDoc.data()?.createdAt || new Date(),
      followersCount: 0,
      rating: 0,
      reviewCount: 0
    })
    
    return NextResponse.json({ 
      message: 'Seller registered successfully',
      userId: authUser.uid
    })
  } catch (error) {
    console.error('Error registering seller:', error)
    return NextResponse.json(
      { 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
