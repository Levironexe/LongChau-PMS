import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - Long Chau Pharmacy",
  description: "Sign in to Long Chau Pharmacy Staff Portal",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  )
}