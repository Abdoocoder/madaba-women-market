export type UserRole = "customer" | "seller" | "admin"
export type UserStatus = "pending" | "approved"
export type SortOption = "date-desc" | "price-asc" | "price-desc" | "name-asc"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status?: UserStatus
  avatar?: string
  photoURL?: string
  phone?: string
  createdAt: Date
  // Store information for sellers
  storeName?: string
  storeDescription?: string
  storeCoverImage?: string
  instagramUrl?: string
  whatsappUrl?: string
  rating?: number
  reviewCount?: number
  // Followers for sellers
  followersCount?: number
  // Followed sellers for customers
  followedSellers?: string[]
}

export interface Product {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  category: string
  image: string
  sellerId: string
  sellerName: string
  stock: number
  featured: boolean
  approved: boolean
  suspended?: boolean
  createdAt: Date
  wishlisted?: boolean
  // Purchase count for popularity tracking
  purchaseCount?: number
  rating?: number
  reviewCount?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  customerId: string
  sellerId: string
  items: CartItem[]
  total: number
  totalPrice?: number // For backward compatibility or potential mismatch
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  updatedAt?: Date
  customerName?: string
  shippingAddress?: string
  customerPhone?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Seller {
  id: string
  name: string
  email: string
  approved: boolean
  suspended?: boolean
  totalSales: number
  totalProducts: number
  joinedAt: Date
  followersCount?: number
}

export interface ProductDB {
  id: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  price: number
  category: string
  image_url: string
  seller_id: string
  seller_name: string
  stock: number
  featured: boolean
  approved: boolean
  suspended: boolean
  created_at: string
  purchase_count?: number
  rating?: number
  review_count?: number
}
