"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  useInventoryRecords, 
  useInventoryStats, 
  useLowStockRecords,
  useInventoryRecordsByBranch,
  useBranchInventoryStats
} from "@/hooks/api/useInventory"
import { useBranches } from "@/hooks/api/useBranches"
import { 
  expiredMedications, 
  expiredMedicationInventory,
  isProductExpired,
  mockExpiredMedicationWarning
} from "@/lib/mock-data"
import type { InventoryRecord, Branch } from "@/lib/types"

// Using real API types - InventoryRecord and Branch from types.ts

interface Product {
  id: number
  name: string
  product_type: string
  requires_prescription: boolean
}

export default function InventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [showDialog, setShowDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryRecord | null>(null)
  const [requestingItem, setRequestingItem] = useState<InventoryRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showExpiredWarnings, setShowExpiredWarnings] = useState(false)
  const [expiredProductsFound, setExpiredProductsFound] = useState<{id: number, name: string, expiry_date: string, days_expired: number}[]>([])
  const [formData, setFormData] = useState({
    product_id: "",
    branch_id: "",
    current_stock: "",
    minimum_stock: "",
    reorder_point: ""
  })
  const [requestData, setRequestData] = useState({
    product_id: "",
    requested_quantity: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    reason: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Get branches data first
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useBranches()

  // Update URL when branch selection changes
  const handleBranchChange = useCallback((branchId: string) => {
    console.log('Branch change requested:', { from: selectedBranch, to: branchId })
    
    // Invalidate existing queries to force fresh data
    if (selectedBranch !== branchId) {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'records'] })
    }
    
    setSelectedBranch(branchId)
    if (branchId) {
      router.push(`/inventory?branchId=${branchId}`)
    } else {
      router.push('/inventory')
    }
  }, [router, selectedBranch, queryClient])

  // Sync URL parameters with selected branch
  useEffect(() => {
    const branchParam = searchParams.get('branchId')
    if (branchParam && branchParam !== selectedBranch) {
      setSelectedBranch(branchParam)
    }
  }, [searchParams, selectedBranch])

  // Validate branch ID exists in available branches
  useEffect(() => {
    if (selectedBranch && branches.length > 0) {
      const branchExists = branches.some(branch => branch.id.toString() === selectedBranch)
      if (!branchExists) {
        console.warn(`Branch ID ${selectedBranch} not found, redirecting to branch selection`)
        handleBranchChange("")
      }
    }
  }, [selectedBranch, branches, handleBranchChange])

  // Real API hooks - only call the one we need
  const branchId = selectedBranch ? parseInt(selectedBranch) : 0
  const allInventoryQuery = useInventoryRecords()
  const branchInventoryQuery = useInventoryRecordsByBranch(branchId)
  
  // Use the appropriate query based on selectedBranch
  const inventoryQuery = selectedBranch && branchId > 0 ? branchInventoryQuery : allInventoryQuery
  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = inventoryQuery
  
  // Debug logging to see what's happening
  console.log('Inventory Debug:', {
    selectedBranch,
    branchId,
    usingBranchQuery: selectedBranch && branchId > 0,
    inventoryCount: inventory.length,
    allQueryEnabled: !selectedBranch || branchId === 0,
    branchQueryEnabled: !!(selectedBranch && branchId > 0),
    allQueryData: allInventoryQuery.data?.length || 0,
    branchQueryData: branchInventoryQuery.data?.length || 0,
    allQueryStatus: allInventoryQuery.status,
    branchQueryStatus: branchInventoryQuery.status,
    inventoryFirstItem: inventory[0], // First item for debugging
    
    // NEW: Detailed API response debugging
    rawAllInventoryData: allInventoryQuery.data,
    rawBranchInventoryData: branchInventoryQuery.data,
    allDataSample: allInventoryQuery.data?.slice(0, 3), // First 3 items from all data
    branchDataSample: branchInventoryQuery.data?.slice(0, 3), // First 3 items from branch data
  })
  
  // NEW: Log when inventory data changes
  console.log('Raw inventory data (first 5 items):', inventory.slice(0, 5))
  const { data: globalLowStockItems = [] } = useLowStockRecords()
  const globalInventoryStats = useInventoryStats()
  const branchInventoryStats = useBranchInventoryStats(branchId)
  
  // Use branch-specific stats when a branch is selected, otherwise global stats
  const inventoryStats = selectedBranch && branchId > 0 ? branchInventoryStats : globalInventoryStats

  const selectedBranchName = branches.find(b => b.id.toString() === selectedBranch)?.name || "Selected Branch"
  
  // Update page title when branch is selected
  useEffect(() => {
    if (selectedBranch && selectedBranchName !== "Selected Branch") {
      document.title = `Inventory - ${selectedBranchName} | Long Chau PMS`
    } else {
      document.title = `Inventory | Long Chau PMS`
    }
  }, [selectedBranch, selectedBranchName])

  // BUSINESS RULE VALIDATION: Check for expired medications
  useEffect(() => {
    const checkForExpiredMedications = () => {
      const today = new Date()
      const expiredProducts: {id: number, name: string, expiry_date: string, days_expired: number}[] = []

      // Check mock expired medications
      expiredMedications.forEach(med => {
        if (med.expiry_date) {
          const expiryDate = new Date(med.expiry_date)
          if (expiryDate < today) {
            const daysExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))
            expiredProducts.push({
              id: med.id,
              name: med.name,
              expiry_date: med.expiry_date,
              days_expired: daysExpired
            })
          }
        }
      })

      // Check real inventory for expiry dates
      inventory.forEach(item => {
        if (item.expiry_date) {
          const expiryDate = new Date(item.expiry_date)
          if (expiryDate < today) {
            const daysExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))
            const existingExpired = expiredProducts.find(p => p.id === item.product)
            if (!existingExpired) {
              expiredProducts.push({
                id: item.product || 0,
                name: item.product_name || 'Unknown Product',
                expiry_date: item.expiry_date,
                days_expired: daysExpired
              })
            }
          }
        }
      })

      setExpiredProductsFound(expiredProducts)
      setShowExpiredWarnings(expiredProducts.length > 0)
    }

    checkForExpiredMedications()
  }, [inventory])

  // TODO: Replace with useProducts() hook when available
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Temporary - will be replaced with real products API
      return [
        { id: 1, name: "Paracetamol 500mg", product_type: "medicine", requires_prescription: false },
        { id: 2, name: "Amoxicillin 250mg", product_type: "medicine", requires_prescription: true },
        { id: 3, name: "Vitamin D3 1000IU", product_type: "supplement", requires_prescription: false }
      ] as Product[]
    },
  })

  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & typeof formData) => {
      // Call actual API endpoint for update
      const payload = {
        product: parseInt(data.product_id) || editingItem?.product,
        branch: parseInt(data.branch_id) || editingItem?.branch,
        current_stock: parseInt(data.current_stock),
        minimum_stock: parseInt(data.minimum_stock),
        reorder_point: data.reorder_point ? parseInt(data.reorder_point) : undefined
      }
      
      const response = await api.put(`/inventory-records/${id}/`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["inventory", "records"] })
      setShowDialog(false)
      setEditingItem(null)
      resetForm()
    },
  })

  const requestStock = useMutation({
    mutationFn: (data: typeof requestData & { item: InventoryRecord }) => {
      // Replace with actual API call
      return Promise.resolve({
        id: Date.now(),
        branch_id: parseInt(selectedBranch),
        branch_name: branches.find(b => b.id === data.item.branch)?.name || "",
        product_id: parseInt(data.product_id),
        product_name: data.item.product_name || "",
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

  const deleteInventoryItem = useMutation({
    mutationFn: (id: number) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["inventory", "records"] })
    },
  })

  const resetForm = () => {
    setFormData({
      product_id: "",
      branch_id: "",
      current_stock: "",
      minimum_stock: "",
      reorder_point: ""
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
    }
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestingItem) {
      requestStock.mutate({ ...requestData, item: requestingItem })
    }
  }

  const handleEdit = (item: InventoryRecord) => {
    setEditingItem(item)
    setFormData({
      product_id: (item.product || 0).toString(),
      branch_id: item.branch.toString(),
      current_stock: (item.current_stock || 0).toString(),
      minimum_stock: (item.minimum_stock || 0).toString(),
      reorder_point: (item.reorder_point || 0).toString()
    })
    setShowDialog(true)
  }

  const handleRequestStock = (item: InventoryRecord) => {
    setRequestingItem(item)
    const currentStock = item.current_stock || 0
    const minStock = item.minimum_stock || 0
    const reorderPoint = item.reorder_point || (minStock * 2) // Default to 2x minimum if no reorder point
    
    setRequestData({
      product_id: (item.product || 0).toString(),
      requested_quantity: Math.max(reorderPoint - currentStock, minStock).toString(),
      priority: item.is_low_stock ? "high" : "normal",
      reason: item.is_low_stock ? "Low stock alert" : "Restock request",
      notes: ""
    })
    setShowRequestDialog(true)
  }

  // inventory is already filtered by the API query (either all or by branch)
  const currentInventory = inventory

  const filteredInventory = currentInventory.filter((item: InventoryRecord) => {
    const matchesSearch = (item.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.batch_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.product_code || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    const currentStock = item.current_stock || 0
    const minStock = item.minimum_stock || 0
    const reorderPoint = item.reorder_point || 0
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low" && (item.is_low_stock || currentStock <= minStock)) ||
                        (stockFilter === "normal" && !item.is_low_stock && currentStock > minStock) ||
                        (stockFilter === "high" && currentStock >= reorderPoint && reorderPoint > 0)
    return matchesSearch && matchesStock
  })

  // Use branch-specific stats when available, otherwise calculate from current inventory
  const stats = inventoryStats
  const lowStockItems = currentInventory.filter(item => item.is_low_stock)
  const totalItems = stats.totalRecords || currentInventory.length
  const totalProducts = currentInventory.length > 0 ? new Set(currentInventory.map(item => item.product)).size : 0
  const averageStock = stats.averageStockLevel || (currentInventory.length > 0 ? 
    currentInventory.reduce((sum, item) => sum + (item.current_stock || 0), 0) / currentInventory.length : 0)

  const getStockStatus = (item: InventoryRecord) => {
    const currentStock = item.current_stock || 0
    const minStock = item.minimum_stock || 0
    const reorderPoint = item.reorder_point || 0
    
    if (item.is_low_stock || currentStock <= minStock) return "low"
    if (currentStock >= reorderPoint && reorderPoint > 0) return "reorder"
    return "normal"
  }

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "low": return "destructive"
      case "reorder": return "secondary"
      case "normal": return "default"
      default: return "default"
    }
  }

  const getStockIcon = (status: string) => {
    switch (status) {
      case "low": return <TrendingDown className="h-3 w-3" />
      case "reorder": return <AlertTriangle className="h-3 w-3" />
      case "normal": return <Package className="h-3 w-3" />
      default: return <Package className="h-3 w-3" />
    }
  }

  // Don't show inventory if no branch is selected
  if (!selectedBranch) {
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
          
          {branchesLoading ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : branchesError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">Error loading branches</div>
              <p className="text-sm text-muted-foreground">
                {branchesError.message || 'Unable to fetch branches from the API'}
              </p>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-4">No branches found</div>
              <p className="text-sm text-muted-foreground">
                There are no branches available in the system. Please add branches first.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {branches.map((branch) => (
                <Card key={branch.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBranchChange(branch.id.toString())}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="h-8 w-8 text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{branch.name}</h3>
                        <p className="text-sm text-muted-foreground">{branch.address}</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      View Inventory
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Store Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleBranchChange("")}
            className="flex items-center gap-2"
          >
            <Store className="h-4 w-4" />
            Change Branch
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedBranchName}</h1>
            <p className="text-muted-foreground">
              Managing inventory for this branch location
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          All products have inventory records. Click "Edit" on any item to update stock levels.
        </div>
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
            <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalProducts}</div>
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
                    <div className="text-xs text-muted-foreground">{item.branch_name}</div>
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

      {/* EXPIRED MEDICATION WARNING */}
      {showExpiredWarnings && expiredProductsFound.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Expired Medications Detected ({expiredProductsFound.length} items)
          </AlertDescription>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <div className="font-medium">⚠️ These medications have expired and must be removed from inventory:</div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 mt-3">
                {expiredProductsFound.slice(0, 6).map((product) => (
                  <div key={product.id} className="p-3 bg-red-100 rounded border border-red-300">
                    <div className="font-medium text-sm text-red-900">{product.name}</div>
                    <div className="text-xs text-red-700">
                      Expired: {new Date(product.expiry_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-red-600 font-semibold">
                      {product.days_expired} day{product.days_expired !== 1 ? 's' : ''} past expiry
                    </div>
                  </div>
                ))}
              </div>
              {expiredProductsFound.length > 6 && (
                <div className="text-sm text-red-800 mt-2">
                  And {expiredProductsFound.length - 6} more expired items...
                </div>
              )}
              <div className="mt-3 text-sm text-red-800 bg-red-200 p-2 rounded">
                <strong>Business Rule Violation:</strong> Expired medications cannot be sold and must be disposed of according to pharmacy regulations.
              </div>
            </div>
          </AlertDescription>
        </Alert>
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
              <SelectItem value="high">Ready to Reorder</SelectItem>
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
              <TableHead>Stock Information</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item)
              const isLowStock = item.is_low_stock
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
                      <div className="flex items-center gap-2">
                        <Badge variant={getStockBadgeVariant(stockStatus)}>
                          {getStockIcon(stockStatus)}
                          <span className="ml-1">{item.current_stock}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">units</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Min: {item.minimum_stock} units</div>
                        {item.reorder_point && item.reorder_point > 0 && (
                          <div>Reorder at: {item.reorder_point} units</div>
                        )}
                      </div>
                      {item.is_low_stock && (
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
                    <div className="flex items-center gap-2">
                      <Badge variant={stockStatus === "low" ? "destructive" : stockStatus === "reorder" ? "secondary" : "default"}>
                        {item.stock_status || stockStatus}
                      </Badge>
                    </div>
                    {item.is_low_stock && (
                      <div className="text-xs text-red-600 mt-1">
                        Needs restocking
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{item.branch_name}</div>
                      <div className="text-xs text-muted-foreground">ID: {item.branch}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Edit Inventory Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Stock Levels
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Item Info */}
            {editingItem && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">{editingItem.product_name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Product Code: {editingItem.product_code}</div>
                  <div>Branch: {editingItem.branch_name}</div>
                  <div>Current Stock: {editingItem.current_stock} units</div>
                  <div>Status: {editingItem.stock_status}</div>
                </div>
              </div>
            )}

            {/* Editable Stock Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_stock">Current Stock *</Label>
                <Input
                  id="current_stock"
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Available units</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  min="0"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Low stock threshold</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min="0"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">When to reorder</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📝 Note about API limitations</h4>
              <p className="text-sm text-blue-700">
                Only stock levels can be edited. Product details, pricing, supplier info, and batch data are managed separately.
              </p>
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
              <Button type="submit" disabled={updateInventoryItem.isPending}>
                Update Stock Levels
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
                    <Label className="text-sm font-medium text-muted-foreground">Reorder Point</Label>
                    <div className="font-medium">{requestingItem.reorder_point || 'Not set'}</div>
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
            {searchTerm || stockFilter !== "all" ? "Try adjusting your search terms" : "All products have inventory records for this branch"}
          </p>
        </div>
      )}
    </div>
  )
}