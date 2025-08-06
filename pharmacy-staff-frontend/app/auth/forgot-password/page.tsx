"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
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
  KeyRound, 
  Mail, 
  ArrowLeft,
  Stethoscope,
  Send
} from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      // TODO: Replace with actual API call
      console.log("Password reset request:", data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For now, simulate successful password reset request
      // In real implementation, you would call your auth API here
      // const response = await authService.forgotPassword(data.email)
      
      setSuccess(`Password reset instructions have been sent to ${data.email}. Please check your inbox.`)
      
    } catch (error: any) {
      setError(error.message || "Failed to send reset instructions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Long Chau Pharmacy
          </h1>
          <p className="text-gray-600">
            Staff Management System
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Reset Password
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!success && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your registered email"
                            disabled={isLoading}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Reset Instructions
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {success && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </div>
                <Button 
                  onClick={() => {
                    setSuccess("")
                    setError("")
                    form.reset()
                  }}
                  variant="outline" 
                  className="w-full h-11"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-11">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>© 2024 Long Chau Pharmacy. All rights reserved.</p>
          <p className="mt-1">
            Need help? Contact IT support at{" "}
            <a href="mailto:support@longchau.com" className="text-blue-600 hover:underline">
              support@longchau.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}