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
  refreshAuthUser: () => Promise<void>
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
          console.warn("User document not found in Firestore for an authenticated user.");
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'New User',
            photoURL: firebaseUser.photoURL || '',
            role: 'customer', 
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
      return true;
    } catch (error: any) {
      console.error("❌ Error logging in:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to login. Please check your credentials.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials or create a new account.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      console.log("🔍 Debug info:", {
        errorCode: error.code,
        errorMessage: error.message,
        attemptedEmail: email,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
      
      throw new Error(errorMessage);
    }
  }
  
  const signUp = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      
      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || `New ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        photoURL: firebaseUser.photoURL || '',
        role: role,
        createdAt: new Date(),
      };
      
      if (role === 'seller') {
        newUser.status = 'pending';
      }

      await setDoc(userDocRef, newUser);
      setUser(newUser);
      
      return true;
    } catch (error: any) {
      console.error("❌ Error signing up:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'New User',
          photoURL: firebaseUser.photoURL || '',
          role: role,
          createdAt: new Date(),
        };

        if (role === 'seller') {
          newUser.status = 'pending';
        }

        await setDoc(userDocRef, newUser);
        setUser(newUser);
      } else {
        const existingUser = userDocSnap.data() as User;
        setUser(existingUser);
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

  const refreshAuthUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser(userData);
      }
    }
  };

  const value = { user, login, signUp, signInWithGoogle, logout, sendPasswordReset, isLoading, refreshAuthUser };

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
