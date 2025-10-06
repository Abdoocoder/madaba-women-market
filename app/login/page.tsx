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
    if (strength <= 2) return { color: 'text-red-500', text: t('login.weak') };
    if (strength <= 3) return { color: 'text-yellow-500', text: t('login.medium') };
    if (strength <= 4) return { color: 'text-blue-500', text: t('login.strong') };
    return { color: 'text-green-500', text: t('login.veryStrong') };
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    // Validation
    if (!email || !password) {
      setError(t('login.fillAllFields'))
      setIsSubmitting(false)
      return
    }
    
    if (!isValidEmail(email)) {
      setError(t('login.validEmail'))
      setIsSubmitting(false)
      return
    }
    
    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || t('login.failedLogin'))
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
      setError(t('login.fillAllFields'))
      setIsSubmitting(false)
      return
    }
    
    if (!isValidEmail(email)) {
      setError(t('login.validEmail'))
      setIsSubmitting(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError(t('login.passwordsDontMatch'))
      setIsSubmitting(false)
      return
    }
    
    if (password.length < 6) {
      setError(t('login.passwordLength'))
      setIsSubmitting(false)
      return
    }
    
    try {
      const success = await signUp(email, password, role)
      if (success) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || t('login.failedSignup'))
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
      setError(t('login.failedGoogle'))
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError(t('login.enterEmail'))
      return
    }
    setError(null)
    setResetMessage(null)
    const success = await sendPasswordReset(resetEmail)
    if (success) {
      setResetMessage(t('login.resetEmailSent'))
    } else {
      setError(t('login.failedReset'))
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-[450px]">

        <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t('login.login')}</TabsTrigger>
          <TabsTrigger value="signup">{t('login.signup')}</TabsTrigger>
        </TabsList>
        
        {/* Login Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>{t('login.loginTo')} {t("app.name")}</CardTitle>
              <CardDescription>{t('login.enterCredentials')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('admin.email')}</Label>
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
                    <p className="text-red-500 text-xs">{t('login.validEmail')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('login.password')}</Label>
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t('login.loggingIn') : t('login.login')}</Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t('login.orContinueWith')}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn('customer')}>
                {t('login.googleSignIn')}
              </Button>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              
              <div className="mt-4 text-center text-sm">
                {t('login.forgotPassword')}
                <div className="mt-2 space-y-2">
                    <Input type="email" placeholder={t('login.enterEmail')} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                    <Button variant="link" onClick={handlePasswordReset}>{t('login.sendResetLink')}</Button>
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
              <CardTitle>{t('login.createAccount')}</CardTitle>
              <CardDescription>{t('login.join')} {t("app.name")} {t('login.today')}!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('admin.email')}</Label>
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
                    <p className="text-red-500 text-xs">{t('login.validEmail')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('login.password')}</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="pr-10"
                      placeholder={t('login.passwordPlaceholder')}
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
                        <span className="text-xs text-gray-500">{t('login.passwordStrength')}</span>
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
                        {password.length < 6 && <div className="text-red-500">• {t('login.atLeast6')}</div>}
                        {password.length >= 6 && <div className="text-green-500">• {t('login.atLeast6')} ✓</div>}
                        {!/[A-Z]/.test(password) && <div className="text-gray-400">• {t('login.oneUppercase')}</div>}
                        {/[A-Z]/.test(password) && <div className="text-green-500">• {t('login.oneUppercase')} ✓</div>}
                        {!/[0-9]/.test(password) && <div className="text-gray-400">• {t('login.oneNumber')}</div>}
                        {/[0-9]/.test(password) && <div className="text-green-500">• {t('login.oneNumber')} ✓</div>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('login.confirmPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500' : confirmPassword && password === confirmPassword ? 'border-green-300 focus:border-green-500' : ''}`}
                      placeholder={t('login.confirmPasswordPlaceholder')}
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
                    <p className="text-red-500 text-xs">{t('login.passwordsDontMatch')}</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-green-500 text-xs">{t('login.passwordsMatch')} ✓</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('login.iAm')}</Label>
                  <RadioGroup defaultValue="customer" value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="customer" id="r-customer" />
                      <Label htmlFor="r-customer">{t('admin.customer')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="seller" id="r-seller" />
                      <Label htmlFor="r-seller">{t('admin.seller')}</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t('login.signingUp') : t('login.createAccount')}</Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t('login.orSignUpWith')}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn(role)}>
                {t('login.googleSignUp')}
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