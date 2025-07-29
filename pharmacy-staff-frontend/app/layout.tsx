"use client"

import type React from "react"

import "./globals.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-blue-600">Long Chau Pharmacy</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="/products" className="text-gray-700 hover:text-blue-600">
                      Products
                    </a>
                    <a href="/inventory" className="text-gray-700 hover:text-blue-600">
                      Inventory
                    </a>
                    <a href="/customers" className="text-gray-700 hover:text-blue-600">
                      Customers
                    </a>
                    <a href="/orders" className="text-gray-700 hover:text-blue-600">
                      Orders
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  )
}
