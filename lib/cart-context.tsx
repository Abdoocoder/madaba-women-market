'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"
import { db } from "@/lib/firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useLocale } from "./locale-context"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  // New state to track the seller of the items currently in the cart
  storeSellerId: string | null 
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key prefix
const CART_KEY = "seydaty_cart_v2"

// Helper to get a namespaced localStorage key
const getStorageKey = (userId?: string) => userId ? `${CART_KEY}_${userId}` : `${CART_KEY}_guest`

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [storeSellerId, setStoreSellerId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useLocale()

  // Effect to load cart from localStorage on initial render or user change
  useEffect(() => {
    const storageKey = getStorageKey(user?.id)
    try {
      const storedCart = localStorage.getItem(storageKey)
      if (storedCart) {
        const { items: storedItems, sellerId: storedSellerId } = JSON.parse(storedCart)
        setItems(storedItems || [])
        setStoreSellerId(storedSellerId || null)
      }
      else {
        // Clear state if no cart is found for the user
        setItems([])
        setStoreSellerId(null)
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error)
      // Clear storage if parsing fails
      localStorage.removeItem(storageKey)
    }
  }, [user])

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    const storageKey = getStorageKey(user?.id)
    const cartData = JSON.stringify({ items, sellerId: storeSellerId })
    localStorage.setItem(storageKey, cartData)
  }, [items, storeSellerId, user])

  // Effect to sync cart with Firebase for logged-in users
  useEffect(() => {
    // Add proper null check for user and user.id
    if (!user || !user.id) return

    const cartRef = doc(db, "carts", user.id)
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const { items: fbItems, sellerId: fbSellerId } = docSnap.data()
        // Sync from Firebase only if it's different from local state to prevent loops
        if (JSON.stringify(items) !== JSON.stringify(fbItems)) {
          setItems(fbItems || [])
        }
        if (storeSellerId !== fbSellerId) {
          setStoreSellerId(fbSellerId || null)
        }
      }
    }, (error) => {
      console.error("Firebase onSnapshot error:", error)
    })

    return () => unsubscribe()
  }, [user, items, storeSellerId])

  // Debounced effect to save cart to Firebase
  useEffect(() => {
    // Add proper null check for user and user.id
    if (!user || !user.id) return
    
    const handler = setTimeout(async () => {
      try {
        const cartRef = doc(db, "carts", user.id)
        await setDoc(cartRef, { items, sellerId: storeSellerId })
      } catch (error) {
        console.error("Failed to save cart to Firebase", error)
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(handler)
  }, [items, storeSellerId, user])

  const handleClearAndAddToCart = (product: Product) => {
    setItems([{ product, quantity: 1 }])
    setStoreSellerId(product.sellerId)
    toast({
      title: t('cart.itemAdded'),
      description: `${product.name} ${t('cart.hasBeenAdded')}`
    })
  }

  const addToCart = (product: Product) => {
    // If cart is empty, add the item and set the seller ID
    if (items.length === 0 || !storeSellerId) {
      setStoreSellerId(product.sellerId)
      setItems([{ product, quantity: 1 }])
      toast({ title: t('cart.itemAdded'), description: `${product.name} ${t('cart.hasBeenAdded')}` })
      return
    }

    // If item is from a different seller, ask for confirmation
    if (product.sellerId !== storeSellerId) {
      toast({
        title: t('cart.differentStoreTitle'),
        description: t('cart.differentStoreMessage'),
        variant: 'destructive',
        action: (
          <button
            onClick={() => handleClearAndAddToCart(product)}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {t('cart.clearAndAdd')}
          </button>
        ),
      })
      return
    }

    // If item already exists in cart, increase quantity
    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })
    toast({ title: t('cart.itemAdded'), description: `${product.name} ${t('cart.hasBeenAdded')}` })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.product.id !== productId)
      if (newItems.length === 0) {
        setStoreSellerId(null) // Clear sellerId if cart becomes empty
      }
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setStoreSellerId(null) // Also clear the sellerId
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        storeSellerId
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
