"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Lock, 
  LogIn,
  Crown,
  Settings,
  AlertTriangle
} from "lucide-react"

const adminLoginSchema = z.object({
  username: z.string()
    .min(1, "Username is required"),
  password: z.string()
    .min(1, "Password is required"),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true)
    setError("")
    
    try {
      // TODO: Replace with actual admin authentication API call
      console.log("Admin login attempt:", { username: data.username })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, simulate admin authentication
      // In real implementation: const response = await adminAuthService.login(data.username, data.password)
      
      // Demo credentials (remove in production)
      if (data.username === "admin" && data.password === "admin123") {
        router.push("/")  // Redirect to main dashboard
      } else {
        throw new Error("Invalid admin credentials")
      }
      
    } catch (error: any) {
      setError(error.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="p-3 bg-red-600 rounded-lg shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Portal
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">RESTRICTED ACCESS</span>
            </div>
            <p className="text-xs text-red-700">
              Administrator login only
            </p>
          </div>
        </div>

        {/* Admin Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Administrator Login
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter username"
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            disabled={isLoading}
                            className="h-11 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In as Admin
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
              <p className="text-xs text-yellow-800 font-medium mb-1">Demo Login:</p>
              <p className="text-xs text-yellow-700">
                Username: <code className="bg-yellow-100 px-1 rounded">admin</code> | 
                Password: <code className="bg-yellow-100 px-1 rounded">admin123</code>
              </p>
            </div>

            {/* Back to Staff Login */}
            <div className="text-center pt-4 border-t">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}