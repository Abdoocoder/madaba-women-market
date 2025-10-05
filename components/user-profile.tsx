"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { updateDoc, doc } from "firebase/firestore"
import { updatePassword, updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"

export default function UserProfile() {
  const { user, refreshAuthUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      })
    }
  }, [user])

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please log in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (auth.currentUser) {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: formData.name
        })

        // Update Firestore document
        const userDocRef = doc(db, "users", user.id)
        await updateDoc(userDocRef, {
          name: formData.name,
          email: formData.email
        })

        await refreshAuthUser()
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
      }
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      setIsSubmitting(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsSubmitting(false)
      return
    }

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, passwordData.newPassword)
        setSuccess("Password updated successfully!")
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setError("Please log out and log back in before changing your password for security reasons.")
      } else {
        setError(error.message || "Failed to update password")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'seller': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name} />}
              <AvatarFallback className="text-lg">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{user.name || 'Anonymous User'}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {user.status && (
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                )}
              </div>
              {user.createdAt && (
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled // Email changes require special handling
                />
                <p className="text-xs text-gray-500">Email changes require verification. Contact support to change your email.</p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setFormData({ name: user.name || "", email: user.email || "" })
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>Change Password</Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-600 text-sm">{success}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}