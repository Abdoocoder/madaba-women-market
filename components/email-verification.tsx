"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, RefreshCw } from "lucide-react"

export default function EmailVerification() {
  const { user, sendVerificationEmail, checkEmailVerification, refreshAuthUser } = useAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Check if user is already verified
      checkVerificationStatus()
    }
  }, [user])

  const checkVerificationStatus = async () => {
    setIsChecking(true)
    try {
      const verified = await checkEmailVerification()
      setIsVerified(verified)
      if (verified) {
        await refreshAuthUser()
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSendVerification = async () => {
    setIsSending(true)
    setError(null)
    setMessage(null)
    
    try {
      const success = await sendVerificationEmail()
      if (success) {
        setMessage("Verification email sent! Please check your inbox and spam folder.")
      } else {
        setError("Failed to send verification email. You may already be verified.")
      }
    } catch (error) {
      setError("An error occurred while sending the verification email.")
    } finally {
      setIsSending(false)
    }
  }

  if (!user) {
    return null
  }

  if (isVerified) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your email address has been verified!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Please verify your email address to access all features of your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          We've sent a verification email to <strong>{user.email}</strong>. 
          Click the link in the email to verify your account.
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSendVerification}
            disabled={isSending}
            variant="outline"
            size="sm"
          >
            {isSending ? "Sending..." : "Resend Verification Email"}
          </Button>
          
          <Button 
            onClick={checkVerificationStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? "Checking..." : "Check Status"}
          </Button>
        </div>

        {message && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
