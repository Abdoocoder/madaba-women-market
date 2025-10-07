"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage not available:', error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('localStorage not available:', error)
    }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { user } = useAuth()

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = safeLocalStorage.getItem("seydaty_cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error('Error parsing cart data:', error)
        safeLocalStorage.setItem("seydaty_cart", JSON.stringify([]))
      }
    }
  }, [])

  // Sync cart with Firebase when user is authenticated
  useEffect(() => {
    if (!user) return

    const cartRef = doc(db, "carts", user.id)
    
    // Set up real-time listener for cart updates
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const cartData = docSnap.data()
        if (cartData.items) {
          setItems(cartData.items)
          // Also save to localStorage for offline access
          safeLocalStorage.setItem("seydaty_cart", JSON.stringify(cartData.items))
        }
      }
    }, (error) => {
      console.error("Error listening to cart updates:", error)
    })

    return () => unsubscribe()
  }, [user])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    safeLocalStorage.setItem("seydaty_cart", JSON.stringify(items))
  }, [items])

  // Save cart to Firebase when user is authenticated and items change
  useEffect(() => {
    const saveCartToFirebase = async () => {
      if (!user || items.length === 0) return

      try {
        const cartRef = doc(db, "carts", user.id)
        await setDoc(cartRef, { items }, { merge: true })
      } catch (error) {
        console.error("Error saving cart to Firebase:", error)
      }
    }

    // Debounce the save operation
    const timeoutId = setTimeout(saveCartToFirebase, 1000)
    return () => clearTimeout(timeoutId)
  }, [items, user])

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
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