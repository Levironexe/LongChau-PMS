"use client"

import type React from "react"

import "./globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { CartProvider } from "@/contexts/CartContext"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
