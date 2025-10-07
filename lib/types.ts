export type UserRole = "customer" | "seller" | "admin"
export type UserStatus = "pending" | "approved"

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
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: Date
  updatedAt?: Date
  customerName?: string
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
}
