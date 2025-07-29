"use client";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-[60vh]">
        <div className="text-center py-16">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8 text-lg">Add products to your cart to start shopping</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/products">
                Explore Products
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString('vi-VN') + '₫';
  };

  const totalAmount = getCartTotal();
  const itemCount = getCartItemCount();
  const freeShippingThreshold = 300000;
  const isEligibleForFreeShipping = totalAmount >= freeShippingThreshold;
  const shippingFee = isEligibleForFreeShipping ? 0 : 30000;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart ({itemCount} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping progress */}
            {!isEligibleForFreeShipping && (
              <Card className="p-6 bg-orange-50 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-800">
                    Add {formatPrice((freeShippingThreshold - totalAmount).toString())} more for free shipping
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(totalAmount / freeShippingThreshold) * 100}%` }}
                  ></div>
                </div>
              </Card>
            )}

            {cartItems.map((item) => (
              <Card key={item.product.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {item.product.product_type === 'medicine' ? '💊' : 
                     item.product.product_type === 'supplement' ? '🌿' : 
                     item.product.product_type === 'device' ? '🩺' : '💊'}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.product.manufacturer}
                          </Badge>
                          {item.product.requires_prescription && (
                            <Badge variant="destructive" className="text-xs">
                              Prescription
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.product.description}</p>
                        {item.product.strength && (
                          <p className="text-sm text-blue-600">Strength: {item.product.strength}</p>
                        )}
                      </div>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(item.product.price)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        Subtotal: {formatPrice((parseFloat(item.product.price) * item.quantity).toString())}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={clearCart} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items):</span>
                  <span className="font-medium">{formatPrice(totalAmount.toString())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee:</span>
                  <span className="font-medium">
                    {isEligibleForFreeShipping ? (
                      <span className="text-blue-600">Free</span>
                    ) : (
                      formatPrice(shippingFee.toString())
                    )}
                  </span>
                </div>

                {isEligibleForFreeShipping && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-800 text-sm font-medium">
                      🎉 Congratulations! You qualify for free shipping
                    </span>
                  </div>
                )}

                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatPrice((totalAmount + shippingFee).toString())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Free returns within 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Free consultation with pharmacist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>100% secure payment</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
