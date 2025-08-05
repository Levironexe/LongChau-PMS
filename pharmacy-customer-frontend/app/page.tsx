"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Truck, Clock, Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useCart } from "../hooks/useCart";
import { mockProductsData } from "../data/products";
import Image from "next/image";

// Get featured products (first 4 products)
const mockProducts = mockProductsData.slice(0, 4);

const categories = [
  {
    name: "Prescription Medicines",
    href: "/products?category=medicine",
    icon: "💊",
    description: "Doctor prescribed medications",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Over-the-Counter",
    href: "/products?category=otc",
    icon: "🏥",
    description: "OTC medicines, self-care",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Health Supplements",
    href: "/products?category=supplement",
    icon: "🌿",
    description: "Vitamins, herbal products",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "Medical Devices",
    href: "/products?category=device",
    icon: "🩺",
    description: "Monitors, medical tools",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Pharmaceutical Cosmetics",
    href: "/products?category=cosmetic",
    icon: "💄",
    description: "Professional skincare",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Mother & Baby",
    href: "/products?category=mother-baby",
    icon: "👶",
    description: "Products for mom and baby",
    color: "bg-yellow-100 text-yellow-700",
  },
];

const features = [
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Quality Assured",
    description: "100% authentic products with clear origin and traceability"
  },
  {
    icon: <Truck className="h-8 w-8 text-blue-600" />,
    title: "Fast Delivery",
    description: "2-4 hour delivery in city center, free shipping over $50"
  },
  {
    icon: <Clock className="h-8 w-8 text-purple-600" />,
    title: "24/7 Service",
    description: "Customer support and health consultation anytime, anywhere"
  },
];

export default function Home() {
  const { addToCart, isInCart } = useCart();
  const [addingToCart, setAddingToCart] = React.useState<number | null>(null);
  const [showToast, setShowToast] = React.useState<string | null>(null);

  const handleAddToCart = async (product: any) => {
    try {
      setAddingToCart(product.id);
      console.log('Adding product to cart:', product);
      addToCart(product);
      console.log('Product added successfully');
      
      // Show success toast
      setShowToast(`${product.name} added to cart!`);
      
      // Hide loading state and toast
      setTimeout(() => {
        setAddingToCart(null);
        setShowToast(null);
      }, 2000);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setAddingToCart(null);
      setShowToast('Failed to add item to cart');
      setTimeout(() => setShowToast(null), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {showToast}
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  🎉 Special Offer - 20% off your first order
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Health is our
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400"> 
                    {" "}top priority{" "}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Trusted pharmacy chain with over 20 years of experience. 
                  Committed to bringing you quality products and the best healthcare services.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  <Link href="/products" className="flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  <Link href="/prescription-upload">
                    Upload Prescription
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://plus.unsplash.com/premium_photo-1681843126728-04eab730febe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern hospital building with professional healthcare environment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-600/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Long Chau</h3>
                  <p className="text-lg opacity-90">Trusted Pharmacy</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-3xl font-bold">500+</div>
                      <div>Stores</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">1M+</div>
                      <div>Customers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Product Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find products that suit your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between min-h-[160px]">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight">{category.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Most popular products
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.manufacturer}
                      </Badge>
                      {product.requires_prescription && (
                        <Badge variant="destructive" className="text-xs">
                          Prescription
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {product.strength && (
                      <p className="text-sm text-blue-600">
                        Strength: {product.strength}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg font-bold text-blue-600">
                        {parseInt(product.price).toLocaleString('vi-VN')}₫
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!product.is_available || addingToCart === product.id}
                      >
                        {addingToCart === product.id ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                            Adding...
                          </div>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {isInCart(product.id) ? 'Added' : 'Add to Cart'}
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Long Chau?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With over 20 years of experience, we are committed to providing the best healthcare services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get information about promotional programs and useful health knowledge
          </p>
          <div className="max-w-md mx-auto flex gap-4 items-stretch">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 h-12"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 h-12">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
