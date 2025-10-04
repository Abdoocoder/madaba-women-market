"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, role: UserRole) => Promise<boolean>
  signInWithGoogle: (role: UserRole) => Promise<boolean>
  logout: () => void
  sendPasswordReset: (email: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setUser(userData);
        } else {
          // If the user document doesn't exist, something is wrong.
          // This can happen if a user is created in Firebase Auth but not in Firestore.
          console.warn("User document not found in Firestore for an authenticated user.");
          // As a fallback, create a basic user doc, but this indicates an issue.
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'New User',
            photoURL: firebaseUser.photoURL || '',
            role: 'customer', // Default fallback role
            createdAt: new Date(),
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by the useEffect listener
      return true;
    } catch (error) {
      console.error("❌ Error logging in:", error);
      return false;
    }
  }
  
  const signUp = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || `New ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        photoURL: '',
        role: role,
        createdAt: new Date(),
      };
      
      if (role === 'seller') {
        newUser.status = 'pending'; // admin approval required
      }

      await setDoc(userDocRef, newUser);
      // Setting user state immediately after sign up for better UX
      setUser(newUser);
      return true;
    } catch (error) {
      console.error("❌ Error signing up:", error);
      return false;
    }
  };

  const signInWithGoogle = async (role: UserRole): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // 🆕 New Google User → Save with chosen role
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'New User',
          photoURL: firebaseUser.photoURL || '',
          role: role,
          createdAt: new Date(),
        };

        if (role === 'seller') {
          newUser.status = 'pending'; // waiting for admin approval
        }

        await setDoc(userDocRef, newUser);
        setUser(newUser);
      } else {
        // 👤 Existing Google User → Just log them in, state will be set by listener
        const existingUser = userDocSnap.data() as User;
        setUser(existingUser); // Update state immediately for better UX
      }
      return true;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("⚠️ Google sign-in popup closed by the user.");
      } else {
        console.error("❌ Error signing in with Google:", error);
      }
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    // User state will be set to null by the auth state change listener
  }
  
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("❌ Error sending password reset email:", error);
      return false;
    }
  };

  const value = { user, login, signUp, signInWithGoogle, logout, sendPasswordReset, isLoading };

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
