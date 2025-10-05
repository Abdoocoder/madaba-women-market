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
  createdAt: Date
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
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: Date
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
