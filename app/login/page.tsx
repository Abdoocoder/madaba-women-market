import { NewLoginForm } from "@/components/auth/new-login-form"
import { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <NewLoginForm />
      <Toaster />
    </div>
  )
}
