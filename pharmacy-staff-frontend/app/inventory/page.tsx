"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Warehouse, 
  Plus, 
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  Package,
  Store,
  TrendingDown,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react"
import { api } from "@/lib/api"

interface InventoryItem {
  id: number
  product_id: number
  product_name: string
  store_id: number
  store_name: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  last_updated: string
  supplier: string
  cost_price: number
  selling_price: number
  expiry_date?: string
  batch_number?: string
  notes?: string
}

interface Store {
  id: number
  name: string
  address: string
  status: "active" | "inactive" | "maintenance"
}

interface Product {
  id: number
  name: string
  product_type: string
  requires_prescription: boolean
}

export default function InventoryPage() {
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [showDialog, setShowDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [requestingItem, setRequestingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    product_id: "",
    current_stock: "",
    minimum_stock: "",
    maximum_stock: "",
    supplier: "",
    cost_price: "",
    selling_price: "",
    expiry_date: "",
    batch_number: "",
    notes: ""
  })
  const [requestData, setRequestData] = useState({
    product_id: "",
    requested_quantity: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    reason: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock data - replace with actual API calls
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      return [
        {
          id: 1,
          product_id: 1,
          product_name: "Paracetamol 500mg",
          store_id: 1,
          store_name: "Long Chau - District 1",
          current_stock: 45,
          minimum_stock: 50,
          maximum_stock: 200,
          last_updated: "2024-01-20T10:30:00Z",
          supplier: "PharmaCorp Vietnam",
          cost_price: 4.50,
          selling_price: 5.99,
          expiry_date: "2025-12-31",
          batch_number: "PC240115",
          notes: "Low stock - reorder soon"
        },
        {
          id: 2,
          product_id: 2,
          product_name: "Amoxicillin 250mg",
          store_id: 1,
          store_name: "Long Chau - District 1",
          current_stock: 75,
          minimum_stock: 30,
          maximum_stock: 150,
          last_updated: "2024-01-19T14:15:00Z",
          supplier: "MediLabs International",
          cost_price: 10.00,
          selling_price: 12.50,
          expiry_date: "2025-08-15",
          batch_number: "ML240110"
        },
        {
          id: 3,
          product_id: 3,
          product_name: "Vitamin D3 1000IU",
          store_id: 2,
          store_name: "Long Chau - District 3",
          current_stock: 120,
          minimum_stock: 40,
          maximum_stock: 200,
          last_updated: "2024-01-18T09:00:00Z",
          supplier: "HealthPlus Supplements",
          cost_price: 14.40,
          selling_price: 18.00,
          expiry_date: "2026-06-30",
          batch_number: "HP240105"
        },
        {
          id: 4,
          product_id: 1,
          product_name: "Paracetamol 500mg",
          store_id: 2,
          store_name: "Long Chau - District 3",
          current_stock: 25,
          minimum_stock: 50,
          maximum_stock: 200,
          last_updated: "2024-01-20T16:45:00Z",
          supplier: "PharmaCorp Vietnam",
          cost_price: 4.50,
          selling_price: 5.99,
          expiry_date: "2025-12-31",
          batch_number: "PC240116",
          notes: "Critical low stock"
        },
        {
          id: 5,
          product_id: 2,
          product_name: "Amoxicillin 250mg",
          store_id: 4,
          store_name: "Long Chau - Thu Duc",
          current_stock: 90,
          minimum_stock: 30,
          maximum_stock: 150,
          last_updated: "2024-01-17T11:20:00Z",
          supplier: "MediLabs International",
          cost_price: 10.00,
          selling_price: 12.50,
          expiry_date: "2025-09-20",
          batch_number: "ML240112"
        }
      ] as InventoryItem[]
    },
  })

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      // Use same mock data as stores page
      return [
        { id: 1, name: "Long Chau - District 1", address: "123 Nguyen Hue Street", status: "active" },
        { id: 2, name: "Long Chau - District 3", address: "456 Vo Van Tan Street", status: "active" },
        { id: 3, name: "Long Chau - Tan Binh", address: "789 Cong Hoa Street", status: "maintenance" },
        { id: 4, name: "Long Chau - Thu Duc", address: "321 Vo Van Ngan Street", status: "active" }
      ] as Store[]
    },
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Use same mock data as products page
      return [
        { id: 1, name: "Paracetamol 500mg", product_type: "medicine", requires_prescription: false },
        { id: 2, name: "Amoxicillin 250mg", product_type: "medicine", requires_prescription: true },
        { id: 3, name: "Vitamin D3 1000IU", product_type: "supplement", requires_prescription: false }
      ] as Product[]
    },
  })

  const createInventoryItem = useMutation({
    mutationFn: (data: typeof formData) => {
      // Replace with actual API call
      const product = products.find(p => p.id === parseInt(data.product_id))
      const store = stores.find(s => s.id === parseInt(selectedStore))
      return Promise.resolve({ 
        ...data, 
        id: Date.now(),
        product_id: parseInt(data.product_id),
        product_name: product?.name || "",
        store_id: parseInt(selectedStore),
        store_name: store?.name || "",
        current_stock: parseInt(data.current_stock),
        minimum_stock: parseInt(data.minimum_stock),
        maximum_stock: parseInt(data.maximum_stock),
        cost_price: parseFloat(data.cost_price),
        selling_price: parseFloat(data.selling_price),
        last_updated: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", selectedStore] })
      setShowDialog(false)
      resetForm()
    },
  })

  const requestStock = useMutation({
    mutationFn: (data: typeof requestData & { item: InventoryItem }) => {
      // Replace with actual API call
      return Promise.resolve({
        id: Date.now(),
        store_id: parseInt(selectedStore),
        store_name: data.item.store_name,
        product_id: parseInt(data.product_id),
        product_name: data.item.product_name,
        requested_quantity: parseInt(data.requested_quantity),
        current_stock: data.item.current_stock,
        minimum_stock: data.item.minimum_stock,
        priority: data.priority,
        reason: data.reason,
        notes: data.notes,
        status: "pending",
        requested_date: new Date().toISOString(),
        requested_by: "Current User"
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] })
      setShowRequestDialog(false)
      setRequestingItem(null)
      resetRequestForm()
    },
  })

  const updateInventoryItem = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof formData) => {
      // Replace with actual API call
      return Promise.resolve({ 
        id, 
        ...data,
        current_stock: parseInt(data.current_stock),
        minimum_stock: parseInt(data.minimum_stock),
        maximum_stock: parseInt(data.maximum_stock),
        cost_price: parseFloat(data.cost_price),
        selling_price: parseFloat(data.selling_price),
        last_updated: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", selectedStore] })
      setEditingItem(null)
      resetForm()
    },
  })

  const deleteInventoryItem = useMutation({
    mutationFn: (id: number) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", selectedStore] })
    },
  })

  const resetForm = () => {
    setFormData({
      product_id: "",
      current_stock: "",
      minimum_stock: "",
      maximum_stock: "",
      supplier: "",
      cost_price: "",
      selling_price: "",
      expiry_date: "",
      batch_number: "",
      notes: ""
    })
  }

  const resetRequestForm = () => {
    setRequestData({
      product_id: "",
      requested_quantity: "",
      priority: "normal",
      reason: "",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateInventoryItem.mutate({ id: editingItem.id, ...formData })
    } else {
      createInventoryItem.mutate(formData)
    }
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestingItem) {
      requestStock.mutate({ ...requestData, item: requestingItem })
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      product_id: item.product_id.toString(),
      current_stock: item.current_stock.toString(),
      minimum_stock: item.minimum_stock.toString(),
      maximum_stock: item.maximum_stock.toString(),
      supplier: item.supplier,
      cost_price: item.cost_price.toString(),
      selling_price: item.selling_price.toString(),
      expiry_date: item.expiry_date || "",
      batch_number: item.batch_number || "",
      notes: item.notes || ""
    })
    setShowDialog(true)
  }

  const handleRequestStock = (item: InventoryItem) => {
    setRequestingItem(item)
    setRequestData({
      product_id: item.product_id.toString(),
      requested_quantity: (item.maximum_stock - item.current_stock).toString(),
      priority: item.current_stock <= item.minimum_stock ? "high" : "normal",
      reason: item.current_stock <= item.minimum_stock ? "Low stock alert" : "Restock request",
      notes: ""
    })
    setShowRequestDialog(true)
  }

  // Filter inventory by selected store
  const storeInventory = inventory.filter(item => 
    !selectedStore || item.store_id.toString() === selectedStore
  )

  const filteredInventory = storeInventory.filter((item: InventoryItem) => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low" && item.current_stock <= item.minimum_stock) ||
                        (stockFilter === "normal" && item.current_stock > item.minimum_stock && item.current_stock < item.maximum_stock) ||
                        (stockFilter === "high" && item.current_stock >= item.maximum_stock)
    return matchesSearch && matchesStock
  })

  const lowStockItems = storeInventory.filter(item => item.current_stock <= item.minimum_stock)
  const totalItems = storeInventory.length
  const totalValue = storeInventory.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0)
  const averageStock = storeInventory.length > 0 ? storeInventory.reduce((sum, item) => sum + item.current_stock, 0) / storeInventory.length : 0

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= item.minimum_stock) return "low"
    if (item.current_stock >= item.maximum_stock) return "high"
    return "normal"
  }

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "low": return "destructive"
      case "high": return "secondary"
      case "normal": return "default"
      default: return "default"
    }
  }

  const getStockIcon = (status: string) => {
    switch (status) {
      case "low": return <TrendingDown className="h-3 w-3" />
      case "high": return <TrendingUp className="h-3 w-3" />
      case "normal": return <Package className="h-3 w-3" />
      default: return <Package className="h-3 w-3" />
    }
  }

  // Don't show inventory if no store is selected
  if (!selectedStore) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Select a branch to view and manage its inventory
            </p>
          </div>
        </div>

        {/* Store Selection */}
        <div className="max-w-2xl mx-auto text-center py-12">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Choose a Branch</h2>
          <p className="text-muted-foreground mb-8">
            Select a Long Chau pharmacy branch to view and manage its inventory
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {stores.filter(store => store.status === "active").map((store) => (
              <Card key={store.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStore(store.id.toString())}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Store className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    View Inventory
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedStoreName = stores.find(s => s.id.toString() === selectedStore)?.name || "Selected Store"

  return (
    <div className="space-y-6">
      {/* Header with Store Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedStore("")}
            className="flex items-center gap-2"
          >
            <Store className="h-4 w-4" />
            Change Branch
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedStoreName}</h1>
            <p className="text-muted-foreground">
              Managing inventory for this branch location
            </p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }} disabled={!selectedStore}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Stock Level</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{Math.round(averageStock)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium text-sm">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">{item.store_name}</div>
                  </div>
                  <div className="text-red-600 font-semibold text-sm">
                    {item.current_stock}/{item.minimum_stock}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, supplier, batch number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Stock level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item)
              const isLowStock = item.current_stock <= item.minimum_stock
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      {item.batch_number && (
                        <div className="text-sm text-muted-foreground">
                          Batch: {item.batch_number}
                        </div>
                      )}
                      {item.expiry_date && (
                        <div className="text-xs text-muted-foreground">
                          Exp: {new Date(item.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge variant={getStockBadgeVariant(stockStatus)}>
                        {getStockIcon(stockStatus)}
                        <span className="ml-1">{item.current_stock}</span>
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Min: {item.minimum_stock} | Max: {item.maximum_stock}
                      </div>
                      {isLowStock && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleRequestStock(item)}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Request Stock
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Cost: ${item.cost_price.toFixed(2)}</div>
                      <div className="text-muted-foreground">Sell: ${item.selling_price.toFixed(2)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.supplier}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(item.last_updated).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRequestStock(item)}
                        title="Request stock from warehouse"
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteInventoryItem.mutate(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select 
                value={formData.product_id} 
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.product_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Adding to: {selectedStoreName}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input
                  id="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_stock">Minimum Stock</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maximum_stock">Maximum Stock</Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) => setFormData({ ...formData, maximum_stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price ($)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price ($)</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes about this inventory item..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingItem(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInventoryItem.isPending || updateInventoryItem.isPending}>
                {editingItem ? 'Update' : 'Create'} Inventory Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Stock Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Stock from Warehouse</DialogTitle>
          </DialogHeader>
          {requestingItem && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Product</Label>
                    <div className="font-medium">{requestingItem.product_name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
                    <div className="font-medium text-red-600">{requestingItem.current_stock}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Minimum Required</Label>
                    <div className="font-medium">{requestingItem.minimum_stock}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Maximum Capacity</Label>
                    <div className="font-medium">{requestingItem.maximum_stock}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requested_quantity">Requested Quantity</Label>
                  <Input
                    id="requested_quantity"
                    type="number"
                    value={requestData.requested_quantity}
                    onChange={(e) => setRequestData({ ...requestData, requested_quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select 
                    value={requestData.priority} 
                    onValueChange={(value: "low" | "normal" | "high" | "urgent") => 
                      setRequestData({ ...requestData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request</Label>
                <Select 
                  value={requestData.reason} 
                  onValueChange={(value) => setRequestData({ ...requestData, reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low stock alert">Low Stock Alert</SelectItem>
                    <SelectItem value="Restock request">Regular Restock</SelectItem>
                    <SelectItem value="High demand">High Customer Demand</SelectItem>
                    <SelectItem value="Seasonal preparation">Seasonal Preparation</SelectItem>
                    <SelectItem value="Emergency shortage">Emergency Shortage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={requestData.notes}
                  onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional information for the warehouse team..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRequestDialog(false)
                    setRequestingItem(null)
                    resetRequestForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={requestStock.isPending}>
                  Submit Request
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || stockFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first inventory item"}
          </p>
          {!searchTerm && stockFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory Item
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
