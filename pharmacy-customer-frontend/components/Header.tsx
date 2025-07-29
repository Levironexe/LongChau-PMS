"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { useCart } from "@/hooks/useCart"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartItems } = useCart()

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Long Chau Pharmacy
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link href="/prescription-upload" className="text-gray-700 hover:text-blue-600">
              Upload Prescription
            </Link>
            <Link href="/account" className="text-gray-700 hover:text-blue-600">
              My Account
            </Link>
          </nav>

          {/* Cart & User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/account">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden bg-transparent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="space-y-2">
              <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600">
                Products
              </Link>
              <Link href="/prescription-upload" className="block py-2 text-gray-700 hover:text-blue-600">
                Upload Prescription
              </Link>
              <Link href="/account" className="block py-2 text-gray-700 hover:text-blue-600">
                My Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
