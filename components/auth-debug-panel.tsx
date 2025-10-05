"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function AuthDebugPanel() {
  const { signUp, user } = useAuth()
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")

  const createTestUser = async () => {
    setIsCreating(true)
    setMessage("")
    
    try {
      const success = await signUp(email, password, "customer")
      if (success) {
        setMessage("✅ Test user created successfully! You can now log in.")
      } else {
        setMessage("❌ Failed to create test user. Check console for details.")
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
    }
    
    setIsCreating(false)
  }

  if (user) {
    return (
      <Card className="mb-4 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">✅ Authentication Working!</CardTitle>
          <CardDescription>You are logged in as: {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            Role: {user.role} | ID: {user.id}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">🔧 Firebase Auth Debug Panel</CardTitle>
        <CardDescription>
          Create a test user to verify Firebase authentication is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email</Label>
          <Input 
            id="test-email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="test-password">Test Password</Label>
          <Input 
            id="test-password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>
        <Button 
          onClick={createTestUser} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating Test User..." : "Create Test User"}
        </Button>
        {message && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {message}
          </div>
        )}
        <div className="text-xs text-gray-500">
          <p><strong>Project:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
          <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
        </div>
      </CardContent>
    </Card>
  )
}