"use client"

import { Header } from "./header"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

export function HeaderWrapper() {
  const { totalItems } = useCart()
  const { user } = useAuth()

  return <Header cartItemCount={totalItems} user={user} />
}