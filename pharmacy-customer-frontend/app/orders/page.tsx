"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"
import { api } from "@/lib/api"

export default function OrdersPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [cartItems, setCartItems] = useState<any[]>([])

  const queryClient = useQueryClient()

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders/").then((res) => res.data),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers/").then((res) => res.data),
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products/").then((res) => res.data),
  })

  const createOrder = useMutation({
    mutationFn: (data: any) => api.post("/orders/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      setShowForm(false)
      setSelectedCustomer("")
      setCartItems([])
    },
  })

  const addToCart = (product: any) => {
    const existing = cartItems.find((item) => item.product_id === product.id)
    if (existing) {
      setCartItems(
        cartItems.map((item) => (item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: number, change: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }),
    )
  }

  const handleCreateOrder = () => {
    if (!selectedCustomer || cartItems.length === 0) return

    createOrder.mutate({
      customer_id: Number.parseInt(selectedCustomer),
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    })
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + Number.parseFloat(item.price) * item.quantity, 0).toFixed(2)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button onClick={() => setShowForm(true)}>Create Order</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Choose customer...</option>
                {customers.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customer_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Add Products</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {products.map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <div className="text-sm text-gray-600">
                        ${product.price} | Stock: {product.stock || 0}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addToCart(product)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {cartItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Order Items</label>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item.product_name}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.product_id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.product_id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="w-16 text-right">
                          ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.product_id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-bold text-lg">Total: ${calculateTotal()}</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreateOrder} disabled={!selectedCustomer || cartItems.length === 0}>
                Create Order
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.total_amount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
