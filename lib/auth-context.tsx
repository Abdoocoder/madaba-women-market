"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, role: UserRole, name?: string) => Promise<boolean>
  signInWithGoogle: (role: UserRole) => Promise<boolean>
  logout: () => void
  sendPasswordReset: (email: string) => Promise<boolean>
  sendVerificationEmail: () => Promise<boolean>
  checkEmailVerification: () => Promise<boolean>
  isLoading: boolean
  refreshAuthUser: () => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, it will be created in the auth listener or signUp
          return null
        }
        throw error
      }
      return data as User
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser(profile)
        } else {
          // If no profile exists, we might need to create it (like for Google sign-in)
          // But usually we handle this in the sign-in/up functions
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 'New User',
            role: 'customer', // Default role
            createdAt: new Date(session.user.created_at)
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Special check for migration: if login fails, see if they exist in profiles
        try {
          console.log("🔍 Checking profiles for email (case-insensitive):", email);
          const { count, error: profileError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .ilike("email", email);

          console.log("📊 Migration Check Output - Count:", count, "Error:", profileError);

          if (count && count > 0) {
            throw new Error("تنبيه: حسابك موجود في متجرنا الجديد، لكنك تحتاج لضبط كلمة مرورك لأول مرة. يرجى استخدام 'نسيت كلمة المرور' لتعيين كلمة مرور جديدة.");
          }
        } catch (checkErr) {
          console.error("⚠️ Error during migration check:", checkErr);
          // Don't swallow the original error if this check fails
        }

        throw error
      }
      return true
    } catch (error: any) {
      console.error("❌ Error logging in:", error)
      throw new Error(error.message || "Failed to login")
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, name?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name || `New ${role}`,
            role: role,
            status: role === 'seller' ? 'pending' : 'approved',
          })

        if (profileError) throw profileError
      }

      return true
    } catch (error: any) {
      console.error("❌ Error signing up:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signInWithGoogle = async (role: UserRole): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
      return true
    } catch (error: any) {
      console.error("❌ Error signing in with Google:", error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error("❌ Error sending password reset email:", error)
      return false
    }
  }

  const sendVerificationEmail = async (): Promise<boolean> => {
    // Supabase sends verification emails automatically on signUp if configured
    // This is just a placeholder or could be implemented as a resend function
    return true
  }

  const checkEmailVerification = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user?.email_confirmed_at
  }

  const refreshAuthUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) {
      const profile = await fetchUserProfile(supabaseUser.id)
      if (profile) {
        setUser(profile)
      }
    }
  }

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  const value = {
    user,
    login,
    signUp,
    signInWithGoogle,
    logout,
    sendPasswordReset,
    sendVerificationEmail,
    checkEmailVerification,
    isLoading,
    refreshAuthUser,
    getAuthToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
