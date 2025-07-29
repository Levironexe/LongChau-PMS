"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    product_type: "medicine",
    price: "",
    requires_prescription: false,
  })

  const queryClient = useQueryClient()

  const { data: productsResponse = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products/").then((res) => res.data),
  })
  const products = productsResponse?.results || []


  const createProduct = useMutation({
    mutationFn: (data: any) => api.post("/products/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setShowForm(false)
      setFormData({ name: "", product_type: "medicine", price: "", requires_prescription: false })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProduct.mutate(formData)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowForm(true)}>Add Product</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="medicine">Medicine</option>
                <option value="supplement">Health Supplement</option>
              </select>
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_prescription}
                  onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                  className="mr-2"
                />
                Requires Prescription
              </label>
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
        {products.map((product: any) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{product.product_type}</p>
              <p className="text-lg font-bold">${product.price}</p>
              <p className="text-sm">Stock: {product.stock || 0}</p>
              {product.requires_prescription && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Prescription Required</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
