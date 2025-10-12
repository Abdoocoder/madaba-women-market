"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload
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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    // Wrap the onAuthStateChanged in a setTimeout to avoid race conditions
    const initAuthListener = () => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as User;
              setUser(userData);
            } else {
              // Create new user document
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
          } catch (error) {
            console.error("Error fetching/creating user document:", error);
            setUser(null);
          }
        } else {
          setUser(null)
        }
        setIsLoading(false)
      });
    };

    // Initialize the auth listener
    const timeoutId = setTimeout(initAuthListener, 0);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error logging in:", error);
      }
      
      // Provide more specific error messages
      let errorMessage = "Failed to login. Please check your credentials.";
      
      // Type guard to check if error is Firebase error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        
        if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password. Please check your credentials or create a new account.";
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = "No account found with this email address.";
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = "Incorrect password. Please try again.";
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = "Too many failed attempts. Please try again later or reset your password.";
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (firebaseError.code === 'auth/user-disabled') {
          errorMessage = "This account has been disabled. Please contact support.";
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
      }
      
      // Don't expose NODE_ENV in client-side error messages
      if (process.env.NODE_ENV !== 'development' && errorMessage.includes('NODE_ENV')) {
        errorMessage = "Authentication failed. Please check your credentials.";
      }
      
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
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error signing up:", error);
      }
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to create account. Please try again.";
      
      // Type guard to check if error is Firebase error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = "Password is too weak. Please use at least 6 characters.";
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = "Please enter a valid email address.";
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
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
    } catch (error: unknown) {
      // Type guard to check if error is Firebase error
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ Google sign-in popup closed by the user.");
          }
        } else if (firebaseError.code === 'auth/cancelled-popup-request') {
          // This is expected when the popup is closed quickly
          if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ Google sign-in popup request cancelled.");
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error("❌ Error signing in with Google:", firebaseError.code);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ Unexpected error during Google sign-in:", error);
        }
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
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error sending password reset email:", error);
      }
      return false;
    }
  };

  const sendVerificationEmail = async (): Promise<boolean> => {
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        return true;
      }
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error sending verification email:", error);
      }
      return false;
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        return auth.currentUser.emailVerified;
      }
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ Error checking email verification:", error);
      }
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

  const getAuthToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        return token;
      } catch (error) {
        console.error("Error getting auth token:", error);
        return null;
      }
    }
    return null;
  };

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
  };

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
