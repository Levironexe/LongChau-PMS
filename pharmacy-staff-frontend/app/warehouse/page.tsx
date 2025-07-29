"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Package,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowRight,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { api } from "@/lib/api"

interface WarehouseItem {
  id: number
  product_id: number
  product_name: string
  product_type: string
  available_stock: number
  reserved_stock: number
  total_stock: number
  minimum_stock: number
  supplier: string
  cost_price: number
  last_updated: string
  expiry_date?: string
  batch_number?: string
}

interface StockRequest {
  id: number
  store_id: number
  store_name: string
  product_id: number
  product_name: string
  requested_quantity: number
  current_stock: number
  minimum_stock: number
  priority: "low" | "normal" | "high" | "urgent"
  reason: string
  notes?: string
  status: "pending" | "approved" | "fulfilled" | "rejected"
  requested_date: string
  requested_by: string
  processed_by?: string
  processed_date?: string
}

interface Transfer {
  id: number
  from_warehouse: string
  to_store: string
  product_name: string
  quantity: number
  status: "pending" | "in_transit" | "delivered" | "cancelled"
  created_date: string
  delivery_date?: string
}

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState("inventory")
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [transferData, setTransferData] = useState({
    product_id: "",
    store_id: "",
    quantity: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock warehouse inventory data
  const { data: warehouseInventory = [] } = useQuery({
    queryKey: ["warehouse-inventory"],
    queryFn: async () => {
      return [
        {
          id: 1,
          product_id: 1,
          product_name: "Paracetamol 500mg",
          product_type: "medicine",
          available_stock: 2000,
          reserved_stock: 150,
          total_stock: 2150,
          minimum_stock: 500,
          supplier: "PharmaCorp Vietnam",
          cost_price: 4.50,
          last_updated: "2024-01-20T10:30:00Z",
          expiry_date: "2025-12-31",
          batch_number: "PC240115"
        },
        {
          id: 2,
          product_id: 2,
          product_name: "Amoxicillin 250mg",
          product_type: "medicine",
          available_stock: 1500,
          reserved_stock: 100,
          total_stock: 1600,
          minimum_stock: 300,
          supplier: "MediLabs International",
          cost_price: 10.00,
          last_updated: "2024-01-19T14:15:00Z",
          expiry_date: "2025-08-15",
          batch_number: "ML240110"
        },
        {
          id: 3,
          product_id: 3,
          product_name: "Vitamin D3 1000IU",
          product_type: "supplement",
          available_stock: 3000,
          reserved_stock: 50,
          total_stock: 3050,
          minimum_stock: 400,
          supplier: "HealthPlus Supplements",
          cost_price: 14.40,
          last_updated: "2024-01-18T09:00:00Z",
          expiry_date: "2026-06-30",
          batch_number: "HP240105"
        }
      ] as WarehouseItem[]
    },
  })

  // Mock stock requests data  
  const { data: stockRequests = [] } = useQuery({
    queryKey: ["stock-requests"],
    queryFn: async () => {
      return [
        {
          id: 1,
          store_id: 1,
          store_name: "Long Chau - District 1",
          product_id: 1,
          product_name: "Paracetamol 500mg",
          requested_quantity: 100,
          current_stock: 45,
          minimum_stock: 50,
          priority: "high",
          reason: "Low stock alert",
          notes: "Running low due to flu season",
          status: "pending",
          requested_date: "2024-01-20T16:30:00Z",
          requested_by: "Nguyen Van Nam"
        },
        {
          id: 2,
          store_id: 2,
          store_name: "Long Chau - District 3",
          product_id: 1,
          product_name: "Paracetamol 500mg",
          requested_quantity: 75,
          current_stock: 25,
          minimum_stock: 50,
          priority: "urgent",
          reason: "Emergency shortage",
          notes: "Critical low stock - need immediate delivery",
          status: "pending",
          requested_date: "2024-01-20T18:15:00Z",
          requested_by: "Tran Thi Mai"
        },
        {
          id: 3,
          store_id: 4,
          store_name: "Long Chau - Thu Duc",
          product_id: 2,
          product_name: "Amoxicillin 250mg",
          requested_quantity: 50,
          current_stock: 90,
          minimum_stock: 30,
          priority: "normal",
          reason: "Regular restock",
          status: "approved",
          requested_date: "2024-01-19T11:20:00Z",
          requested_by: "Pham Thi Lan",
          processed_by: "Warehouse Manager",
          processed_date: "2024-01-20T09:00:00Z"
        }
      ] as StockRequest[]
    },
  })

  // Mock transfers data
  const { data: transfers = [] } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      return [
        {
          id: 1,
          from_warehouse: "Central Warehouse",
          to_store: "Long Chau - District 1",
          product_name: "Paracetamol 500mg",
          quantity: 100,
          status: "in_transit",
          created_date: "2024-01-20T10:00:00Z",
          delivery_date: "2024-01-21T14:00:00Z"
        },
        {
          id: 2,
          from_warehouse: "Central Warehouse", 
          to_store: "Long Chau - Thu Duc",
          product_name: "Amoxicillin 250mg",
          quantity: 50,
          status: "delivered",
          created_date: "2024-01-19T15:30:00Z",
          delivery_date: "2024-01-20T11:00:00Z"
        }
      ] as Transfer[]
    },
  })

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      return [
        { id: 1, name: "Long Chau - District 1", status: "active" },
        { id: 2, name: "Long Chau - District 3", status: "active" },
        { id: 3, name: "Long Chau - Tan Binh", status: "maintenance" },
        { id: 4, name: "Long Chau - Thu Duc", status: "active" }
      ]
    },
  })

  const approveRequest = useMutation({
    mutationFn: (requestId: number) => {
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] })
    },
  })

  const rejectRequest = useMutation({
    mutationFn: (requestId: number) => {
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-requests"] })
    },
  })

  const createTransfer = useMutation({
    mutationFn: (data: typeof transferData) => {
      const warehouseItem = warehouseInventory.find(item => item.product_id.toString() === data.product_id)
      const store = stores.find(s => s.id.toString() === data.store_id)
      return Promise.resolve({
        id: Date.now(),
        from_warehouse: "Central Warehouse",
        to_store: store?.name || "",
        product_name: warehouseItem?.product_name || "",
        quantity: parseInt(data.quantity),
        status: "pending",
        created_date: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] })
      setShowTransferDialog(false)
      resetTransferForm()
    },
  })

  const resetTransferForm = () => {
    setTransferData({
      product_id: "",
      store_id: "",
      quantity: "",
      notes: ""
    })
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTransfer.mutate(transferData)
  }

  const handleApproveAndTransfer = (request: StockRequest) => {
    approveRequest.mutate(request.id)
    // Auto-create transfer
    setTransferData({
      product_id: request.product_id.toString(),
      store_id: request.store_id.toString(),
      quantity: request.requested_quantity.toString(),
      notes: `Approved request #${request.id} - ${request.reason}`
    })
    setShowTransferDialog(true)
  }

  const filteredRequests = stockRequests.filter((request: StockRequest) => {
    const matchesSearch = request.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.store_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingRequests = stockRequests.filter(r => r.status === "pending")
  const urgentRequests = stockRequests.filter(r => r.priority === "urgent" && r.status === "pending")
  const totalWarehouseValue = warehouseInventory.reduce((sum, item) => 
    sum + (item.total_stock * item.cost_price), 0
  )
  const lowStockWarehouse = warehouseInventory.filter(item => 
    item.available_stock <= item.minimum_stock
  )

  const getPriorityVariant = (priority: StockRequest["priority"]) => {
    switch (priority) {
      case "urgent": return "destructive"
      case "high": return "destructive"
      case "normal": return "default"
      case "low": return "secondary"
      default: return "default"
    }
  }

  const getStatusVariant = (status: StockRequest["status"]) => {
    switch (status) {
      case "pending": return "secondary"
      case "approved": return "default"
      case "fulfilled": return "default"
      case "rejected": return "destructive"
      default: return "secondary"
    }
  }

  const getTransferStatusVariant = (status: Transfer["status"]) => {
    switch (status) {
      case "pending": return "secondary"
      case "in_transit": return "default"
      case "delivered": return "default"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Central inventory management and distribution to branches
          </p>
        </div>
        <Button onClick={() => { resetTransferForm(); setShowTransferDialog(true) }}>
          <Send className="h-4 w-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouse Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalWarehouseValue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockWarehouse.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Warehouse Inventory</TabsTrigger>
          <TabsTrigger value="requests">Stock Requests</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search warehouse inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Warehouse Inventory Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product_type} • Batch: {item.batch_number}
                        </div>
                        {item.expiry_date && (
                          <div className="text-xs text-muted-foreground">
                            Exp: {new Date(item.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.available_stock <= item.minimum_stock ? "destructive" : "default"}>
                            {item.available_stock} available
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.reserved_stock} reserved • {item.total_stock} total
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min: {item.minimum_stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.supplier}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>${item.cost_price.toFixed(2)} each</div>
                        <div className="text-muted-foreground">
                          ${(item.total_stock * item.cost_price).toFixed(0)} total
                        </div>
                      </div>
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
                          onClick={() => {
                            setTransferData({
                              product_id: item.product_id.toString(),
                              store_id: "",
                              quantity: "",
                              notes: ""
                            })
                            setShowTransferDialog(true)
                          }}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Requests Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Info</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {request.requested_quantity} • {request.reason}
                        </div>
                        {request.notes && (
                          <div className="text-xs text-muted-foreground italic">
                            "{request.notes}"
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.store_name}</div>
                      <div className="text-sm text-muted-foreground">
                        by {request.requested_by}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-red-600 font-medium">
                          Current: {request.current_stock}
                        </div>
                        <div className="text-muted-foreground">
                          Min: {request.minimum_stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(request.priority)}>
                        {request.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.requested_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveAndTransfer(request)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Approve & Transfer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectRequest.mutate(request.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status !== "pending" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          {/* Transfers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer Info</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transfer.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {transfer.quantity}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{transfer.from_warehouse}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{transfer.to_store}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransferStatusVariant(transfer.status)}>
                          {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Created: {new Date(transfer.created_date).toLocaleDateString()}</div>
                          {transfer.delivery_date && (
                            <div className="text-muted-foreground">
                              Delivery: {new Date(transfer.delivery_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Transfer to Branch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_id">Product</Label>
                <Select 
                  value={transferData.product_id} 
                  onValueChange={(value) => setTransferData({ ...transferData, product_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseInventory.map((item) => (
                      <SelectItem key={item.product_id} value={item.product_id.toString()}>
                        {item.product_name} (Available: {item.available_stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_id">Destination Store</Label>
                <Select 
                  value={transferData.store_id} 
                  onValueChange={(value) => setTransferData({ ...transferData, store_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.filter(store => store.status === "active").map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Transfer</Label>
              <Input
                id="quantity"
                type="number"
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Transfer Notes</Label>
              <Textarea
                id="notes"
                value={transferData.notes}
                onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                rows={3}
                placeholder="Any special instructions for this transfer..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTransferDialog(false)
                  resetTransferForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTransfer.isPending}>
                Create Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}