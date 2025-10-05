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
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  const [error, setError] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }

  // Handle password change with strength calculation
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }

  // Get password strength color and text
  const getPasswordStrengthInfo = (strength: number) => {
    if (strength === 0) return { color: 'text-gray-400', text: '' };
    if (strength <= 2) return { color: 'text-red-500', text: 'Weak' };
    if (strength <= 3) return { color: 'text-yellow-500', text: 'Medium' };
    if (strength <= 4) return { color: 'text-blue-500', text: 'Strong' };
    return { color: 'text-green-500', text: 'Very Strong' };
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    // Validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }
    
    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || "Failed to login. Please check your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsSubmitting(false)
      return
    }
    
    try {
      const success = await signUp(email, password, role)
      if (success) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || "Failed to create account. Please try again.")
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
      <div className="w-[450px]">

        <Tabs defaultValue="login" className="w-full">
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
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className={!isValidEmail(email) && email ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {email && !isValidEmail(email) && (
                    <p className="text-red-500 text-xs">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="login-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
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
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className={!isValidEmail(email) && email ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {email && !isValidEmail(email) && (
                    <p className="text-red-500 text-xs">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="pr-10"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span className={`text-xs font-medium ${getPasswordStrengthInfo(passwordStrength).color}`}>
                          {getPasswordStrengthInfo(passwordStrength).text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            passwordStrength <= 2 ? 'bg-red-500' :
                            passwordStrength <= 3 ? 'bg-yellow-500' :
                            passwordStrength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {password.length < 6 && <div className="text-red-500">• At least 6 characters</div>}
                        {password.length >= 6 && <div className="text-green-500">• At least 6 characters ✓</div>}
                        {!/[A-Z]/.test(password) && <div className="text-gray-400">• One uppercase letter (recommended)</div>}
                        {/[A-Z]/.test(password) && <div className="text-green-500">• One uppercase letter ✓</div>}
                        {!/[0-9]/.test(password) && <div className="text-gray-400">• One number (recommended)</div>}
                        {/[0-9]/.test(password) && <div className="text-green-500">• One number ✓</div>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500' : confirmPassword && password === confirmPassword ? 'border-green-300 focus:border-green-500' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-green-500 text-xs">Passwords match ✓</p>
                  )}
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
    </div>
  )
}
