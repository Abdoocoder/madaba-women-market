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

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      // 1. Try to fetch from profiles table directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) return data as User

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.warn("⚠️ Profile fetch error:", error.message)
      }

      // 2. Fallback to Email (for migrated users whose IDs changed)
      if (email) {
        const { data: emailData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email)
          .single()

        if (emailData) {
          console.log("🔗 Migrated user detected. Linking profile by email:", email)
          return { ...emailData, id: userId } as User
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  useEffect(() => {
    // Check for initial session
    const initAuth = async () => {
      console.log("🚀 Auth init starting...");
      let mounted = true;

      // Safety timeout: force loading to false after 5 seconds
      const timeoutId = setTimeout(() => {
        if (mounted && isLoading) {
          console.warn("⚠️ Auth init timed out, forcing loading state to false.");
          setIsLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session fetch error:", error);
        }

        if (session?.user) {
          console.log("✅ Session found for user:", session.user.email);
          const profile = await fetchUserProfile(session.user.id, session.user.email);

          if (mounted) {
            if (profile) {
              console.log("👤 Profile loaded:", profile.role);
              setUser(profile);
            } else {
              console.warn("⚠️ No profile found, using session data.");
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || 'New User',
                role: 'customer',
                createdAt: new Date(session.user.created_at)
              });
            }
          }
        } else {
          console.log("ℹ️ No active session found.");
        }
      } catch (err) {
        console.error("❌ Auth init critical error:", err);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          console.log("🏁 Auth init finalized, setting isLoading to false.");
          setIsLoading(false);
        }
      }

      return () => {
        mounted = false;
        clearTimeout(timeoutId);
      };
    }

    const cleanup = initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      // Handle the state change
      if (session?.user) {
        // Optimization: If we already have the correct user loaded, skip fetching again
        // This helps avoid flickering on 'SIGNED_IN' events that might fire multiple times
        setUser(prev => {
          if (prev?.id === session.user.id) return prev;
          return prev; // We will fetch the full profile below if needed, but for now returned undefined/null logic is handled
        });

        const profile = await fetchUserProfile(session.user.id, session.user.email);
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 'New User',
            role: 'customer',
            createdAt: new Date(session.user.created_at)
          });
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
      console.log("✅ Auth state change processed");
    });

    return () => {
      subscription.unsubscribe();
      // cleanup is a promise, we can't really "cancel" the async function easily 
      // without AbortController but the mounted flag handles state updates.
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Log error for debugging but don't throw to avoid crash screen
        console.error("❌ Login failed:", error.message)

        // Check for common configuration issues after migration
        if (error.message?.includes("provider is not enabled")) {
          console.error("⚠️ Email provider not enabled in Supabase settings")
        }

        // Special check for migration: if login fails, see if they exist in profiles
        try {
          console.log("🔍 Checking profiles for email (case-insensitive):", email);
          const { count, error: profileError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .ilike("email", email);

          console.log("📊 Migration Check Output - Count:", count, "Error:", profileError);

          if (count && count > 0) {
            console.warn("⚠️ User exists in profiles but login failed - may need password reset");
          }
        } catch (checkErr) {
          console.error("⚠️ Error during migration check:", checkErr);
        }

        return false
      }
      return true
    } catch (error: any) {
      console.error("❌ Error logging in:", error)
      return false
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

      if (error) {
        console.error("❌ Sign up failed:", error.message)
        return false
      }

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

        if (profileError) {
          console.error("❌ Profile creation failed:", profileError.message)
          return false
        }
      }

      return true
    } catch (error: any) {
      console.error("❌ Error signing up:", error)
      return false
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
          redirectTo: `${window.location.origin}/auth/callback`
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
      const profile = await fetchUserProfile(supabaseUser.id, supabaseUser.email)
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
