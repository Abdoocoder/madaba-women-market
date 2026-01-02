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

export default function LoginPage() {
  const { login, signUp, signInWithGoogle, sendPasswordReset } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("") // Added for minimal registration
  const [role, setRole] = useState<UserRole>("customer")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

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
        router.push("/")
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

    // Minimal registration - only require name, email, password, and confirm password
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
      const success = await signUp(email, password, role, name) // Pass name to signUp
      if (success) {
        router.push("/") // Redirect to complete profile or dashboard
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
      router.push("/")
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
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{t(`login.${activeTab}`)}</h1>
            <p className="text-balance text-muted-foreground">
              {activeTab === "login"
                ? t("login.enterCredentials")
                : t("login.join") + " " + t("app.name")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={activeTab === "login" ? "default" : "outline"}
              onClick={() => setActiveTab("login")}
            >
              {t("login.login")}
            </Button>
            <Button
              variant={activeTab === "signup" ? "default" : "outline"}
              onClick={() => setActiveTab("signup")}
            >
              {t("login.signup")}
            </Button>
          </div>
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("admin.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                    onClick={handleForgotPassword}
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("login.loggingIn") : t("login.login")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGoogleSignIn(role)}
              >
                {t("login.googleSignIn")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="grid gap-4">
              <div className="grid gap-2">
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {t("admin.seller")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Minimal Registration Fields */}
              <div className="grid gap-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("profile.enterName")}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("admin.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  {t("login.confirmPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t("login.signingUp")
                  : t("login.createAccount")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGoogleSignIn(role)}
              >
                {t("login.googleSignUp")}
              </Button>
            </form>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-4 text-center text-sm">
            {activeTab === "login"
              ? t("login.noAccount")
              : t("login.alreadyAccount")}{" "}
            <Link
              href="#"
              className="underline"
              onClick={() =>
                setActiveTab(activeTab === "login" ? "signup" : "login")
              }
            >
              {activeTab === "login" ? t("login.signup") : t("login.login")}
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1920"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
