"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Search, Heart } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { mockProductsData } from "@/data/products"
import Image from "next/image"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { addToCart, isInCart } = useCart()

  const products = mockProductsData

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.product_type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString('vi-VN') + '₫'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="medicine">Medicines</TabsTrigger>
            <TabsTrigger value="supplement">Supplements</TabsTrigger>
            <TabsTrigger value="device">Medical Devices</TabsTrigger>
            <TabsTrigger value="cosmetic">Cosmetics</TabsTrigger>
            <TabsTrigger value="mother-baby">Mother & Baby</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                {product.requires_prescription && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    Prescription
                  </Badge>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-100 text-orange-800">
                    Low Stock
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {product.manufacturer}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {product.product_type.replace('-', ' & ')}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {product.strength && (
                  <p className="text-sm text-blue-600 mb-2">
                    Strength: {product.strength}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Stock: {product.stock || 0}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                    onClick={() => addToCart(product)} 
                    disabled={!product.is_available || product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.stock === 0 ? "Out of Stock" : 
                     isInCart(product.id) ? "Added" : "Add to Cart"}
                  </Button>
                  <Button size="sm" variant="outline" className="px-3">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
