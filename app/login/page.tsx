"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/lib/locale-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { UserRole } from "@/lib/types"

export default function LoginPage() {
  const { login, signUp, signInWithGoogle, sendPasswordReset } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  const [error, setError] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const success = await login(email, password)
    if (success) {
      router.push("/")
    } else {
      setError("Failed to login. Please check your credentials.")
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const success = await signUp(email, password, role)
    if (success) {
      router.push("/")
    } else {
      setError("Failed to sign up. The email might already be in use.")
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async (selectedRole: UserRole) => {
    setError(null)
    const success = await signInWithGoogle(selectedRole)
    if (success) {
      router.push("/")
    } else {
      setError("Failed to sign in with Google.")
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError("Please enter your email address.")
      return
    }
    setError(null)
    setResetMessage(null)
    const success = await sendPasswordReset(resetEmail)
    if (success) {
      setResetMessage("Password reset email sent. Please check your inbox.")
    } else {
      setError("Failed to send password reset email.")
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Tabs defaultValue="login" className="w-[450px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login to {t("app.name")}</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn('customer')}>
                Sign in with Google
              </Button>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              
              <div className="mt-4 text-center text-sm">
                Forgot your password?
                <div className="mt-2 space-y-2">
                    <Input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                    <Button variant="link" onClick={handlePasswordReset}>Send reset link</Button>
                </div>
                {resetMessage && <p className="text-green-600 text-sm mt-2">{resetMessage}</p>}
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Signup Tab */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>Join {t("app.name")} today!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup defaultValue="customer" value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="customer" id="r-customer" />
                      <Label htmlFor="r-customer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="seller" id="r-seller" />
                      <Label htmlFor="r-seller">Seller</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing up...' : 'Create Account'}</Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn(role)}>
                Sign up with Google
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
