"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useCart } from "../hooks/useCart";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getCartItemCount } = useCart();

  const cartItemCount = getCartItemCount();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Upload Prescription", href: "/prescription-upload" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header row - Logo, Search, Icons on same line */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">LC</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold text-gray-900">Long Chau</span>
                <span className="text-xs text-gray-500 -mt-1">Trusted Pharmacy</span>
              </div>
            </Link>
          </div>

          {/* Search bar - Center, takes remaining space */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search medicines, supplements, medical devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-5 border-2 border-blue-200 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              />
              <Button 
                type="submit"
                size="sm" 
                className="absolute right-1 top-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-6"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Favorites */}
            <Link href="/favorites" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <Heart className="h-6 w-6" />
            </Link>
            
            {/* Account */}
            <Link href="/account" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <User className="h-6 w-6" />
            </Link>
            
            {/* Shopping Cart */}
            <Link href="/cart" className="p-2 text-gray-700 hover:text-blue-600 relative transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation row - Below the main header */}
        <div className="border-t border-blue-200">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-blue-200 pt-2 mt-2">
              <Link
                href="/account"
                className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/favorites"
                className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
