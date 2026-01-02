"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { UserRole } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Loader2, ArrowRight, Store } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const { login, signUp, signInWithGoogle, sendPasswordReset } = useAuth()
  const router = useRouter()
  const { t, language } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!email || !password) {
      setError(t("login.fillAllFields"))
      setIsSubmitting(false)
      return
    }

    if (!isValidEmail(email)) {
      setError(t("login.validEmail"))
      setIsSubmitting(false)
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        // Wait for auth context to update user state, then redirect based on role
        setTimeout(async () => {
          try {
            // Fetch the user's role from Supabase to ensure we have the latest
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
              let { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authUser.id)
                .single()

              // Fallback to email for migrated users
              if (!profile && authUser.email) {
                const { data: emailProfile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('email', authUser.email)
                  .single()
                profile = emailProfile
              }

              const userRole = profile?.role || "customer"

              if (userRole === "admin") {
                router.push("/admin/dashboard")
              } else if (userRole === "seller") {
                router.push("/seller/dashboard")
              } else if (userRole === "customer") {
                router.push("/buyer/dashboard")
              } else {
                router.push("/")
              }
            }
          } catch (err) {
            console.error("Error during redirect:", err)
            router.push("/")
          }
        }, 300)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage || t("login.failedLogin"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name || !email || !password || !confirmPassword) {
      setError(t("login.fillAllFields"))
      setIsSubmitting(false)
      return
    }

    if (!isValidEmail(email)) {
      setError(t("login.validEmail"))
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError(t("login.passwordsDontMatch"))
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError(t("login.passwordLength"))
      setIsSubmitting(false)
      return
    }

    try {
      const success = await signUp(email, password, role, name)
      if (success) {
        // Redirect based on user role after successful signup
        if (role === "admin") {
          router.push("/admin/dashboard")
        } else if (role === "seller") {
          router.push("/seller/dashboard")
        } else if (role === "customer") {
          router.push("/buyer/dashboard")
        } else {
          router.push("/")
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(errorMessage || t("login.failedSignup"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async (selectedRole: UserRole) => {
    setError(null)
    const success = await signInWithGoogle(selectedRole)
    if (success) {
      // For Google sign-in, we wait for the account to be created/linked
      // and redirect based on the actual profile role
      setTimeout(async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            let { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authUser.id)
              .single()

            // Fallback to email for migrated users
            if (!profile && authUser.email) {
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('role')
                .ilike('email', authUser.email)
                .single()
              profile = emailProfile
            }

            const userRole = profile?.role || selectedRole

            if (userRole === "admin") {
              router.push("/admin/dashboard")
            } else if (userRole === "seller") {
              router.push("/seller/dashboard")
            } else if (userRole === "customer") {
              router.push("/buyer/dashboard")
            } else {
              router.push("/")
            }
          }
        } catch (err) {
          console.error("Error during Google redirect:", err)
          router.push("/")
        }
      }, 500)
    } else {
      setError(t("login.failedGoogle"))
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t("login.enterEmail"))
      return
    }
    setError(null)
    const success = await sendPasswordReset(email)
    if (success) {
      alert(t("login.resetEmailSent"))
    } else {
      setError(t("login.failedReset"))
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>

        <div className="w-full max-w-[440px] space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t(`login.${activeTab}`)}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === "login"
                ? t("login.enterCredentials")
                : t("login.join") + " " + t("app.name")}
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setActiveTab("login")}
              className={`text-sm font-medium py-2.5 rounded-md transition-all duration-300 ${activeTab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("login.login")}
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`text-sm font-medium py-2.5 rounded-md transition-all duration-300 ${activeTab === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("login.signup")}
            </button>
          </div>

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("admin.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        className="pl-9 h-11"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("login.password")}</Label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium"
                        onClick={handleForgotPassword}
                      >
                        {t("login.forgotPassword")}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-9 h-11"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("login.loggingIn")}
                      </>
                    ) : (
                      t("login.login")
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full h-11 font-medium hover:bg-muted/50"
                    onClick={() => handleGoogleSignIn(role)}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t("login.googleSignIn")}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>{t("login.iAm")}</Label>
                    <RadioGroup
                      defaultValue="customer"
                      value={role}
                      onValueChange={(value) => setRole(value as UserRole)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="customer"
                          id="customer"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="customer"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-muted/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 text-sm font-medium"
                        >
                          <User className="h-5 w-5 mb-1.5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                          {t("admin.customer")}
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="seller"
                          id="seller"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="seller"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-muted/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 text-sm font-medium"
                        >
                          <Store className="h-5 w-5 mb-1.5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                          {t("admin.seller")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">{t("profile.name")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t("profile.enterName")}
                        className="pl-9 h-11"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-signup">{t("admin.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="m@example.com"
                        className="pl-9 h-11"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">{t("login.password")}</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        className="h-11"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("login.confirmPassword")}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="h-11"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("login.signingUp")}
                      </>
                    ) : (
                      <span className="flex items-center">
                        {t("login.createAccount")} <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or join with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full h-11 font-medium hover:bg-muted/50"
                    onClick={() => handleGoogleSignIn(role)}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t("login.googleSignUp")}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Image/Branding */}
      <div className="hidden lg:block relative bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1920"
          alt="Madaba Women Market"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-10 left-10 p-10 text-white max-w-lg z-10 transition-transform duration-700 hover:translate-x-2">
          <h2 className="text-4xl font-bold mb-4 font-display leading-tight">{t("app.name")}</h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            {language === 'ar'
              ? "انضمي إلينا لدعم المنتجات المحلية وتمكين المرأة في مادبا. مجتمع يجمع بين الأصالة والإبداع."
              : "Join us in supporting local products and empowering women in Madaba. A community bridging authenticity and creativity."}
          </p>
        </div>
      </div>
    </div>
  )
}
