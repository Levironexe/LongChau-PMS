import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Portal - Long Chau Pharmacy",
  description: "Administrator access to Long Chau Pharmacy Management System",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {children}
    </div>
  )
}