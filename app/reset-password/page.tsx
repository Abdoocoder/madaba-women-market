"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const { t } = useLocale()
    const { toast } = useToast()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

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
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            toast({
                title: t("common.success"),
                description: t("login.passwordResetSuccess") || "Password updated successfully!",
            })

            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            console.error("Error resetting password:", err)
            setError(err.message || t("login.failedReset"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">{t("login.resetPassword") || "Reset Password"}</CardTitle>
                    <CardDescription>
                        {t("login.enterNewPassword") || "Enter your new password below"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="bg-green-50 p-4 rounded-md text-green-700 text-center">
                            {t("login.passwordResetSuccess") || "Your password has been reset successfully. Redirecting to login..."}
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">{t("login.newPassword") || "New Password"}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">{t("login.confirmPassword")}</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? t("common.loading") : t("login.updatePassword") || "Update Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" onClick={() => router.push("/login")}>
                        {t("login.backToLogin") || "Back to Login"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
