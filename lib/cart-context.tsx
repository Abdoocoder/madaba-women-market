"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"
import { db } from "@/lib/firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
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
    let unsubscribe: (() => void) | null = null;
    
    if (!user || !user.id) return

    const cartRef = doc(db, "carts", user.id)
    
    // Set up real-time listener for cart updates with better error handling
    const setupListener = () => {
      try {
        unsubscribe = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            const cartData = docSnap.data()
            if (cartData.items) {
              setItems(cartData.items)
              // Also save to localStorage for offline access
              safeLocalStorage.setItem("seydaty_cart", JSON.stringify(cartData.items))
            }
          }
        }, (error) => {
          // Handle permission errors gracefully
          if (error.code === 'permission-denied') {
            console.warn("Insufficient permissions to read cart data. Using local storage only.");
            // Try to load from localStorage as fallback
            const storedCart = safeLocalStorage.getItem("seydaty_cart");
            if (storedCart) {
              try {
                setItems(JSON.parse(storedCart));
              } catch (parseError) {
                console.error('Error parsing local cart data:', parseError);
                safeLocalStorage.setItem("seydaty_cart", JSON.stringify([]));
              }
            }
          } else if (error.code === 'unavailable' || error.code === 'cancelled') {
            // Handle network errors or cancelled operations
            console.warn("Temporary network issue with cart data. Using local storage.");
            const storedCart = safeLocalStorage.getItem("seydaty_cart");
            if (storedCart) {
              try {
                setItems(JSON.parse(storedCart));
              } catch (parseError) {
                console.error('Error parsing local cart data:', parseError);
              }
            }
          } else {
            console.error("Error listening to cart updates:", error);
          }
        })
      } catch (error) {
        console.error("Error setting up cart listener:", error);
        // Fallback to localStorage
        const storedCart = safeLocalStorage.getItem("seydaty_cart");
        if (storedCart) {
          try {
            setItems(JSON.parse(storedCart));
          } catch (parseError) {
            console.error('Error parsing local cart data:', parseError);
          }
        }
      }
    };
    
    // Initialize listener with a slight delay to avoid race conditions
    const timeoutId = setTimeout(setupListener, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn("Error unsubscribing from cart listener:", error);
        }
      }
    }
  }, [user])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    safeLocalStorage.setItem("seydaty_cart", JSON.stringify(items))
  }, [items])

  // Save cart to Firebase when user is authenticated and items change
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const saveCartToFirebase = async () => {
      if (!user || !user.id) return

      try {
        const cartRef = doc(db, "carts", user.id)
        await setDoc(cartRef, { items }, { merge: true })
      } catch (error: unknown) {
        // Handle permission errors gracefully
        // Type assertion to access error properties
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'permission-denied') {
          console.warn("Insufficient permissions to save cart data to Firebase. Data saved to local storage only.");
        } else if (firebaseError.code === 'unavailable' || firebaseError.code === 'cancelled') {
          console.warn("Temporary network issue. Cart saved to local storage only.");
        } else {
          console.error("Error saving cart to Firebase:", error);
        }
      }
    }

    // Debounce the save operation
    timeoutId = setTimeout(saveCartToFirebase, 1000)
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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
