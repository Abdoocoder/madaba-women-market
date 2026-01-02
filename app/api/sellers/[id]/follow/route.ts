import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser(request)

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        if (user.role !== 'customer') {
            return NextResponse.json({ message: 'Access denied' }, { status: 403 })
        }

        const sellerId = params.id
        if (!sellerId) {
            return NextResponse.json({ message: 'Seller ID is required' }, { status: 400 })
        }

        const { data: seller, error: sellerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sellerId)
            .single()

        if (sellerError || !seller) {
            return NextResponse.json({ message: 'Seller not found' }, { status: 404 })
        }

        const { data: currentUser, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (userError || !currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        const followed_sellers = currentUser.followed_sellers || []

        const body = await request.json().catch(() => ({}))
        const { checkOnly } = body

        if (checkOnly) {
            const isFollowing = followed_sellers.includes(sellerId)
            return NextResponse.json({
                isFollowing,
                followersCount: seller.followers_count || 0
            })
        }

        let isFollowing
        let updatedFollowedSellers

        if (followed_sellers.includes(sellerId)) {
            updatedFollowedSellers = followed_sellers.filter((id: string) => id !== sellerId)
            isFollowing = false
        } else {
            updatedFollowedSellers = [...followed_sellers, sellerId]
            isFollowing = true
        }

        const { error: updateAuthError } = await supabase
            .from('profiles')
            .update({ followed_sellers: updatedFollowedSellers })
            .eq('id', user.id)

        if (updateAuthError) throw updateAuthError

        const newFollowersCount = isFollowing ? (seller.followers_count || 0) + 1 : Math.max(0, (seller.followers_count || 0) - 1)

        const { error: updateSellerError } = await supabase
            .from('profiles')
            .update({ followers_count: newFollowersCount })
            .eq('id', sellerId)

        if (updateSellerError) throw updateSellerError

        return NextResponse.json({
            isFollowing,
            followersCount: newFollowersCount,
            message: isFollowing ? 'Successfully followed seller' : 'Successfully unfollowed seller'
        })
    } catch (error) {
        console.error('Error following/unfollowing seller:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
