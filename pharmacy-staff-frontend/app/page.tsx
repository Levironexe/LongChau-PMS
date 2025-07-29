"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

export default function HomePage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products/").then((res) => res.data),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers/").then((res) => res.data),
  })

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders/").then((res) => res.data),
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => api.get("/inventory/low_stock/").then((res) => res.data),
  })

  const todayOrders = orders.filter(
    (order: any) => new Date(order.order_date).toDateString() === new Date().toDateString(),
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pharmacy Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{"Today's Orders"}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStock.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/products" className="block p-3 border rounded hover:bg-gray-50">
              → Manage Products
            </a>
            <a href="/inventory" className="block p-3 border rounded hover:bg-gray-50">
              → Check Inventory
            </a>
            <a href="/customers" className="block p-3 border rounded hover:bg-gray-50">
              → Manage Customers
            </a>
            <a href="/orders" className="block p-3 border rounded hover:bg-gray-50">
              → Create Order
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between text-sm">
                  <span>
                    Order #{order.id} - {order.customer_name}
                  </span>
                  <span>${order.total_amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
