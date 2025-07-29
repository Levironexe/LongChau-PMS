"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Crown, User, Package } from "lucide-react"
import { api } from "@/lib/api"

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Simulated current customer ID (in real app, get from auth)
  const customerId = 1

  const queryClient = useQueryClient()

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => api.get(`/customers/${customerId}/`).then((res) => res.data),
  })

  // Update form data when customer data is loaded
  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      })
    }
  }, [customer])

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.get("/orders/").then((res) => res.data.filter((order: any) => order.customer === customerId)),
  })

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put(`/customers/${customerId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] })
      setIsEditing(false)
    },
  })

  const handleSaveProfile = () => {
    updateProfile.mutate(formData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
                {customer?.customer_type === "vip" && (
                  <Badge variant="secondary" className="ml-2">
                    <Crown className="h-3 w-3 mr-1" />
                    VIP Customer
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Date: {new Date(order.order_date).toLocaleDateString()}</p>
                      <p className="text-lg font-bold text-blue-600">Total: ${order.total_amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
