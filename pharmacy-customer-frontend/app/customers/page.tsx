"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown } from "lucide-react"
import { api } from "@/lib/api"

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const queryClient = useQueryClient()

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers/").then((res) => res.data),
  })

  const createCustomer = useMutation({
    mutationFn: (data: any) => api.post("/customers/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      setShowForm(false)
      setFormData({ name: "", email: "", phone: "" })
    },
  })

  const upgradeToVip = useMutation({
    mutationFn: (id: number) => api.post(`/customers/${id}/upgrade_to_vip/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCustomer.mutate(formData)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => setShowForm(true)}>Add Customer</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer: any) => (
          <Card key={customer.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{customer.name}</h3>
                {customer.customer_type === "vip" && <Crown className="h-5 w-5 text-yellow-500" />}
              </div>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              <div className="mt-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    customer.customer_type === "vip" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {customer.customer_type.toUpperCase()}
                </span>
              </div>
              {customer.customer_type === "regular" && (
                <Button size="sm" className="mt-2 w-full" onClick={() => upgradeToVip.mutate(customer.id)}>
                  Upgrade to VIP
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
