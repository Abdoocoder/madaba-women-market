"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

// A simple SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.6113 20.0833H42V20H24V28H35.303C33.6747 32.6596 29.2235 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.0253 12 29.759 13.1233 31.8357 14.9396L37.1213 9.65396C33.5673 6.54456 29.0232 4.5 24 4.5C13.2982 4.5 4.5 13.2982 4.5 24C4.5 34.7018 13.2982 43.5 24 43.5C34.7018 43.5 43.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#FFC107"/>
    <path d="M43.6113 20.0833H24V28H35.303C34.5123 30.2291 33.2647 32.146 31.8357 33.5604L37.1213 38.846C41.2829 34.8118 44 29.5638 44 24C44 22.4939 43.8887 21.2848 43.6113 20.0833Z" fill="#FF3D00"/>
    <path d="M24 48C37.2548 48 48 37.2548 48 24C48 22.4939 47.8887 21.2848 47.6113 20.0833H24V28H41.303C39.6747 32.6596 35.2235 36 30 36C25.373 36 21 30.627 21 24C21 17.373 25.373 12 30 12C33.0253 12 35.759 13.1233 37.8357 14.9396L43.1213 9.65396C39.5673 6.54456 35.0232 4.5 30 4.5C19.2982 4.5 10.5 13.2982 10.5 24C10.5 34.7018 19.2982 43.5 30 43.5C34.7018 43.5 40.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#4CAF50"/>
    <path d="M43.6113 20.0833L43.5 20H24V28H35.303C33.6747 32.6596 29.2235 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.0253 12 29.759 13.1233 31.8357 14.9396L37.1213 9.65396C33.5673 6.54456 29.0232 4.5 24 4.5C13.2982 4.5 4.5 13.2982 4.5 24C4.5 34.7018 13.2982 43.5 24 43.5C34.7018 43.5 43.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#1976D2"/>
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, login, signInWithGoogle, sendPasswordReset } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (user) {
        switch (user.role) {
            case 'admin':
                router.push('/admin/dashboard');
                break;
            case 'seller':
                router.push('/seller/dashboard');
                break;
            case 'customer':
                router.push('/');
                break;
            default:
                router.push('/');
        }
    }
}, [user, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    const success = await login(email, password)

    if (!success) {
      setError("فشلت المصادقة. تحقق من بريدك الإلكتروني وكلمة المرور.")
    }
    // On success, the useEffect hook will handle the redirect.

    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const success = await signInWithGoogle();
    if (!success) {
      setError("فشل تسجيل الدخول باستخدام جوجل. حاول مرة أخرى.");
    }
    // On success, the useEffect hook will handle the redirect.
    setIsLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("الرجاء إدخال بريدك الإلكتروني أولاً لطلب إعادة تعيين كلمة المرور.");
      return;
    }
    setError("");
    setMessage("");
    setIsLoading(true);
    const success = await sendPasswordReset(email);
    if (success) {
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } else {
      setError("فشل إرسال بريد إعادة تعيين كلمة المرور. تأكد من صحة البريد الإلكتروني.");
    }
    setIsLoading(false);
  };


  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-cairo">تسجيل الدخول</CardTitle>
        <CardDescription>مرحباً بك في سيدتي ماركت</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}

          <div className="text-right">
            <Button type="button" variant="link" size="sm" onClick={handlePasswordReset} className="p-0 h-auto">
                هل نسيت كلمة المرور؟
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "جاري التحميل..." : "دخول"}
          </Button>
        </form>
        
        <Separator className="my-6">أو</Separator>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <GoogleIcon />
          تسجيل الدخول باستخدام جوجل
        </Button>
        
      </CardContent>
    </Card>
  )
}
