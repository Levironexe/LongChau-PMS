"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

export default function InventoryPage() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newStock, setNewStock] = useState("")

  const queryClient = useQueryClient()


  const { data: inventoryResponse = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory/").then((res) => res.data),
  })
 const inventory = inventoryResponse?.results || []
 
  const { data: lowStockResponse = [] } = useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => api.get("/inventory/low_stock/").then((res) => res.data),
  })
  const lowStock = Array.isArray(lowStockResponse) ? lowStockResponse : []

  const updateStock = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      api.put(`/inventory/${id}/`, { current_stock: stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      setEditingId(null)
      setNewStock("")
    },
  })

  const handleUpdateStock = (id: number) => {
    updateStock.mutate({ id, stock: Number.parseInt(newStock) })
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {lowStock.length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert ({lowStock.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span>{item.product_name}</span>
                  <span className="text-red-600 font-semibold">Only {item.current_stock} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {inventory.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p className="text-sm text-gray-600">
                    Stock: {item.current_stock} | Min: {item.minimum_stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <>
                      <Input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        placeholder="New stock"
                        className="w-24"
                      />
                      <Button size="sm" onClick={() => handleUpdateStock(item.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingId(item.id)
                        setNewStock(item.current_stock.toString())
                      }}
                    >
                      Update Stock
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
