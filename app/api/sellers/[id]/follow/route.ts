import { NextResponse, NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getAuthenticatedUser } from '@/lib/server-auth'

/**
 * @swagger
 * /api/sellers/{id}/follow:
 *   post:
 *     description: Follow or unfollow a seller
 *     responses:
 *       200:
 *         description: Successfully followed/unfollowed seller.
 *       400:
 *         description: Bad request (missing data).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Seller not found.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser(request)
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        
        if (user.role !== 'customer') {
            return NextResponse.json({ 
                message: 'Access denied - customers only'
            }, { status: 403 })
        }

        const sellerId = params.id
        if (!sellerId) {
            return NextResponse.json({ message: 'Seller ID is required' }, { status: 400 })
        }

        const adminDb = getAdminDb()
        
        // Check if seller exists
        const sellerRef = adminDb.collection('users').doc(sellerId)
        const sellerDoc = await sellerRef.get()
        
        if (!sellerDoc.exists) {
            return NextResponse.json({ message: 'Seller not found' }, { status: 404 })
        }

        // Get current user's followed sellers
        const userRef = adminDb.collection('users').doc(user.id)
        const userDoc = await userRef.get()
        
        if (!userDoc.exists) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        const userData = userDoc.data()
        const followedSellers = userData?.followedSellers || []
        
        // Check if this is just a status check
        const body = await request.json().catch(() => ({}))
        const { checkOnly } = body
        
        if (checkOnly) {
            const isFollowing = followedSellers.includes(sellerId)
            const sellerData = sellerDoc.data()
            const followersCount = sellerData?.followersCount || 0
            
            return NextResponse.json({ 
                isFollowing,
                followersCount
            })
        }
        
        let updatedFollowedSellers
        let isFollowing
        
        // Check if already following
        if (followedSellers.includes(sellerId)) {
            // Unfollow
            updatedFollowedSellers = followedSellers.filter((id: string) => id !== sellerId)
            isFollowing = false
        } else {
            // Follow
            updatedFollowedSellers = [...followedSellers, sellerId]
            isFollowing = true
        }

        // Update user's followed sellers
        await userRef.update({
            followedSellers: updatedFollowedSellers
        })

        // Update seller's followers count
        const sellerData = sellerDoc.data()
        const currentFollowersCount = sellerData?.followersCount || 0
        const newFollowersCount = isFollowing ? currentFollowersCount + 1 : Math.max(0, currentFollowersCount - 1)
        
        await sellerRef.update({
            followersCount: newFollowersCount
        })

        return NextResponse.json({ 
            isFollowing,
            followersCount: newFollowersCount,
            message: isFollowing ? 'Successfully followed seller' : 'Successfully unfollowed seller'
        })
    } catch (error) {
        console.error('Error following/unfollowing seller:', error)
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}