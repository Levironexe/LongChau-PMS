"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/useCart"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, clearCart, getCartTotal } = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      // First create/find customer
      const customerResponse = await api.post("/customers/", {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      })

      // Then create order
      return api.post("/orders/", {
        customer_id: customerResponse.data.id,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      })
    },
    onSuccess: (response) => {
      clearCart()
      alert(`Order #${response.data.id} placed successfully!`)
      router.push("/account")
    },
  })

  const handlePlaceOrder = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("Please fill in all required fields")
      return
    }
    createOrder.mutate(customerInfo)
  }

  if (cartItems.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address</label>
              <Input
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {item.product.requires_prescription && (
                    <Badge variant="destructive" className="text-xs">
                      Prescription Required
                    </Badge>
                  )}
                </div>
                <span className="font-semibold">
                  ${(Number.parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${getCartTotal()}</span>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
