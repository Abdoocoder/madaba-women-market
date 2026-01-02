'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"
import { supabase } from "./supabase"
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
  storeSellerId: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = "seydaty_cart_v2"
const getStorageKey = (userId?: string) => userId ? `${CART_KEY}_${userId}` : `${CART_KEY}_guest`

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [storeSellerId, setStoreSellerId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useLocale()

  // Load from local storage
  useEffect(() => {
    const storageKey = getStorageKey(user?.id)
    try {
      const storedCart = localStorage.getItem(storageKey)
      if (storedCart) {
        const { items: storedItems, sellerId: storedSellerId } = JSON.parse(storedCart)
        setItems(storedItems || [])
        setStoreSellerId(storedSellerId || null)
      } else {
        setItems([])
        setStoreSellerId(null)
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error)
      localStorage.removeItem(storageKey)
    }
  }, [user])

  // Save to local storage
  useEffect(() => {
    const storageKey = getStorageKey(user?.id)
    const cartData = JSON.stringify({ items, sellerId: storeSellerId })
    localStorage.setItem(storageKey, cartData)
  }, [items, storeSellerId, user])

  // Sync with Supabase
  useEffect(() => {
    if (!user || !user.id) return

    const fetchCart = async () => {
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        if (JSON.stringify(items) !== JSON.stringify(data.items)) {
          setItems(data.items || [])
        }
        if (storeSellerId !== data.seller_id) {
          setStoreSellerId(data.seller_id || null)
        }
      }
    }

    fetchCart()

    const subscription = supabase
      .channel(`cart:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'carts',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newData = payload.new as any
        if (JSON.stringify(items) !== JSON.stringify(newData.items)) {
          setItems(newData.items || [])
        }
        if (storeSellerId !== newData.seller_id) {
          setStoreSellerId(newData.seller_id || null)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  // Save to Supabase (debounced)
  useEffect(() => {
    if (!user || !user.id) return

    const handler = setTimeout(async () => {
      try {
        await supabase
          .from('carts')
          .upsert({
            user_id: user.id,
            items,
            seller_id: storeSellerId,
            updated_at: new Date().toISOString()
          })
      } catch (error) {
        console.error("Failed to save cart to Supabase", error)
      }
    }, 1000)

    return () => clearTimeout(handler)
  }, [items, storeSellerId, user?.id])

  const handleClearAndAddToCart = (product: Product) => {
    setItems([{ product, quantity: 1 }])
    setStoreSellerId(product.sellerId)
    toast({
      title: t('cart.itemAdded'),
      description: `${product.name} ${t('cart.hasBeenAdded')}`
    })
  }

  const addToCart = (product: Product) => {
    if (items.length === 0 || !storeSellerId) {
      setStoreSellerId(product.sellerId)
      setItems([{ product, quantity: 1 }])
      toast({ title: t('cart.itemAdded'), description: `${product.name} ${t('cart.hasBeenAdded')}` })
      return
    }

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
        setStoreSellerId(null)
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
    setStoreSellerId(null)
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
