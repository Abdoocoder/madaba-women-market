"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth-context"

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.6113 20.0833H42V20H24V28H35.303C33.6747 32.6596 29.2235 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.0253 12 29.759 13.1233 31.8357 14.9396L37.1213 9.65396C33.5673 6.54456 29.0232 4.5 24 4.5C13.2982 4.5 4.5 13.2982 4.5 24C4.5 34.7018 13.2982 43.5 24 43.5C34.7018 43.5 43.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#FFC107"/>
    <path d="M43.6113 20.0833H24V28H35.303C34.5123 30.2291 33.2647 32.146 31.8357 33.5604L37.1213 38.846C41.2829 34.8118 44 29.5638 44 24C44 22.4939 43.8887 21.2848 43.6113 20.0833Z" fill="#FF3D00"/>
    <path d="M24 48C37.2548 48 48 37.2548 48 24C48 22.4939 47.8887 21.2848 47.6113 20.0833H24V28H41.303C39.6747 32.6596 35.2235 36 30 36C25.373 36 21 30.627 21 24C21 17.373 25.373 12 30 12C33.0253 12 35.759 13.1233 37.8357 14.9396L43.1213 9.65396C39.5673 6.54456 35.0232 4.5 30 4.5C19.2982 4.5 10.5 13.2982 10.5 24C10.5 34.7018 19.2982 43.5 30 43.5C34.7018 43.5 40.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#4CAF50"/>
    <path d="M43.6113 20.0833L43.5 20H24V28H35.303C33.6747 32.6596 29.2235 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.0253 12 29.759 13.1233 31.8357 14.9396L37.1213 9.65396C33.5673 6.54456 29.0232 4.5 24 4.5C13.2982 4.5 4.5 13.2982 4.5 24C4.5 34.7018 13.2982 43.5 24 43.5C34.7018 43.5 43.5 34.7018 43.5 24C43.5 22.4939 43.6113 21.2848 43.6113 20.0833Z" fill="#1976D2"/>
  </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" }),
  role: z.enum(['customer', 'seller'], { required_error: 'الرجاء اختيار نوع الحساب' })
})

export function NewLoginForm() {
  const { user, login, signUp, signInWithGoogle, sendPasswordReset } = useAuth()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'customer'
    }
  })

  useEffect(() => {
    if (user) {
        switch (user.role) {
            case 'admin':
                router.push('/admin/dashboard');
                break;
            case 'seller':
                if (user.status === 'pending') {
                  toast.error('حسابك في انتظار موافقة المسؤول.');
                  // logout(); // Optional: log out the user
                } else {
                  router.push('/seller/dashboard');
                }
                break;
            case 'customer':
                router.push('/');
                break;
            default:
                router.push('/');
        }
    }
  }, [user, router]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const toastId = toast.loading(isSignUp ? "جاري إنشاء الحساب..." : "جاري تسجيل الدخول...");
    let success = false;
    if (isSignUp) {
      success = await signUp(data.email, data.password, data.role);
    } else {
      success = await login(data.email, data.password);
    }

    if (success) {
      toast.success(isSignUp ? "تم إنشاء الحساب بنجاح!" : "تم تسجيل الدخول بنجاح!", { id: toastId });
    } else {
      toast.error(isSignUp ? "فشل إنشاء الحساب." : "فشلت المصادقة. تحقق من بريدك الإلكتروني وكلمة المرور.", { id: toastId });
    }
  }
  
  const handleGoogleSignIn = async () => {
    const toastId = toast.loading("جاري تسجيل الدخول باستخدام جوجل...");
    // TODO: Add role selection for Google Sign In
    const success = await signInWithGoogle('customer');
    if (success) {
      toast.success("تم تسجيل الدخول بنجاح!", { id: toastId });
    } else {
      toast.error("فشل تسجيل الدخول باستخدام جوجل. حاول مرة أخرى.", { id: toastId });
    }
  };
  
  const handlePasswordReset = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("الرجاء إدخال بريدك الإلكتروني أولاً لطلب إعادة تعيين كلمة المرور.");
      return;
    }
    const toastId = toast.loading("جاري إرسال رابط إعادة تعيين كلمة المرور...");
    const success = await sendPasswordReset(email);
    if (success) {
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.", { id: toastId });
    } else {
      toast.error("فشل إرسال بريد إعادة تعيين كلمة المرور. تأكد من صحة البريد الإلكتروني.", { id: toastId });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-cairo">{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</CardTitle>
        <CardDescription>مرحباً بك في سيدتي ماركت</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              dir="ltr"
            />
            {errors.email && <p className="text-sm text-destructive text-center">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              dir="ltr"
            />
            {errors.password && <p className="text-sm text-destructive text-center">{errors.password.message}</p>}
          </div>
          
          {isSignUp && (
            <div className="space-y-2">
              <Label>نوع الحساب</Label>
              <RadioGroup defaultValue="customer" {...register("role")} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">مشتري</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seller" id="seller" />
                  <Label htmlFor="seller">بائع</Label>
                </div>
              </RadioGroup>
              {errors.role && <p className="text-sm text-destructive text-center">{errors.role.message}</p>}
            </div>
          )}
          
          {!isSignUp && (
            <div className="text-right">
              <Button type="button" variant="link" size="sm" onClick={handlePasswordReset} className="p-0 h-auto">
                  هل نسيت كلمة المرور؟
              </Button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "جاري التحميل..." : (isSignUp ? 'إنشاء حساب' : 'دخول')}
          </Button>
        </form>
        
        <Separator className="my-6">أو</Separator>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          <GoogleIcon />
          {isSignUp ? 'التسجيل باستخدام جوجل' : 'تسجيل الدخول باستخدام جوجل'}
        </Button>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'هل لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </Button>
        </div>
        
      </CardContent>
    </Card>
  )
}
