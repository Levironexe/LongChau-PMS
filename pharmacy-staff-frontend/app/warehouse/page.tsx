"use client"

import { useState } from "react"
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
  Warehouse as WarehouseIcon, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Package,
  TrendingUp,
  Building2,
  Users,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from "lucide-react"
import { 
  WarehouseForm, 
  WarehouseInventoryForm, 
  InventoryTransferForm 
} from "@/components/forms"
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  useWarehouseInventory,
  useCreateWarehouseInventory,
  useUpdateWarehouseInventory,
  useDeleteWarehouseInventory,
  useInventoryTransfers,
  useCreateTransferRequest,
  useApproveTransfer,
  useCompleteTransfer,
} from "@/hooks/api/useWarehouses"
import { useProducts } from "@/hooks/api/useProducts"
import { useQueryClient } from '@tanstack/react-query'
import { useUsers } from "@/hooks/api/useUsers"
import { useBranches } from "@/hooks/api/useBranches"
import type { 
  WarehouseCreateData, 
  WarehouseEditData,
  WarehouseInventoryCreateData,
  WarehouseInventoryEditData,
  TransferRequestCreateData
} from "@/lib/validations"
import { DirectTransferService, type DirectTransferRequest } from "@/lib/services/directTransferService"
import { useToast } from "@/hooks/use-toast"

export default function WarehousePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false)
  const [showInventoryDialog, setShowInventoryDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null)
  const [editingInventory, setEditingInventory] = useState<any>(null)
  const [selectedWarehouseForInventory, setSelectedWarehouseForInventory] = useState<number | undefined>()
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [pendingTransferForApproval, setPendingTransferForApproval] = useState<any>(null)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [pendingTransferForCompletion, setPendingTransferForCompletion] = useState<any>(null)
  const [isDirectTransferLoading, setIsDirectTransferLoading] = useState(false)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // API data
  const { data: warehousesResponse, isLoading: warehousesLoading } = useWarehouses({ 
    search: searchTerm 
  })
  const warehouses = warehousesResponse?.results || []
  
  const { data: inventoryResponse } = useWarehouseInventory()
  const warehouseInventory = inventoryResponse?.results || []
  
  // DEBUG: Log warehouse inventory data
  console.log('Warehouse Inventory Debug:', {
    inventoryResponse,
    warehouseInventoryCount: warehouseInventory.length,
    sampleWarehouseInventory: warehouseInventory.slice(0, 3)
  })
  
  const { data: transfersResponse } = useInventoryTransfers()
  const transfers = transfersResponse?.results || []
  
  const { data: products = [] } = useProducts({})
  
  const { data: users = [] } = useUsers({})
  
  const { data: branches = [] } = useBranches({})

  // Mutations
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const deleteWarehouse = useDeleteWarehouse()
  
  const createInventory = useCreateWarehouseInventory()
  const updateInventory = useUpdateWarehouseInventory()
  const deleteInventory = useDeleteWarehouseInventory()
  
  const createTransfer = useCreateTransferRequest()
  const approveTransfer = useApproveTransfer()
  const completeTransfer = useCompleteTransfer()

  // Stats calculations
  const totalWarehouses = warehouses.length
  const totalStock = warehouses.reduce((sum: number, w: any) => sum + (w.total_stock || 0), 0)
  const averageUtilization = warehouses.length > 0 
    ? warehouses.reduce((sum: number, w: any) => sum + (w.utilization_percentage || 0), 0) / warehouses.length 
    : 0
  const pendingTransfers = transfers.filter((t: any) => ['REQUESTED', 'PENDING'].includes(t.status)).length

  // Event handlers
  const handleCreateWarehouse = (data: WarehouseCreateData) => {
    createWarehouse.mutate(data, {
      onSuccess: () => {
        setShowWarehouseDialog(false)
        setEditingWarehouse(null)
      }
    })
  }

  const handleUpdateWarehouse = (data: WarehouseEditData) => {
    updateWarehouse.mutate(data, {
      onSuccess: () => {
        setShowWarehouseDialog(false)
        setEditingWarehouse(null)
      }
    })
  }

  const handleWarehouseSubmit = (data: WarehouseCreateData | WarehouseEditData) => {
    if ('id' in data) {
      handleUpdateWarehouse(data)
    } else {
      handleCreateWarehouse(data)
    }
  }

  const handleCreateInventory = (data: WarehouseInventoryCreateData | WarehouseInventoryEditData) => {
    if ('id' in data) {
      updateInventory.mutate(data, {
        onSuccess: () => {
          setShowInventoryDialog(false)
          setEditingInventory(null)
          setSelectedWarehouseForInventory(undefined)
        }
      })
    } else {
      createInventory.mutate(data, {
        onSuccess: () => {
          setShowInventoryDialog(false)
          setSelectedWarehouseForInventory(undefined)
        }
      })
    }
  }

  const handleCreateTransfer = (data: TransferRequestCreateData) => {
    createTransfer.mutate(data, {
      onSuccess: () => {
        setShowTransferDialog(false)
      }
    })
  }

  const handleEditWarehouse = (warehouse: any) => {
    setEditingWarehouse(warehouse)
    setShowWarehouseDialog(true)
  }

  const handleAddInventory = (warehouseId?: number) => {
    setSelectedWarehouseForInventory(warehouseId)
    setShowInventoryDialog(true)
  }

  const handleEditInventory = (inventory: any) => {
    setEditingInventory(inventory)
    setShowInventoryDialog(true)
  }

  const handleApproveTransfer = (transfer: any) => {
    setPendingTransferForApproval(transfer)
    setShowApprovalDialog(true)
  }

  const handleConfirmApproval = (approverId: number) => {
    if (pendingTransferForApproval) {
      approveTransfer.mutate({ 
        transferId: pendingTransferForApproval.id, 
        approvedById: approverId
      }, {
        onSuccess: () => {
          setShowApprovalDialog(false)
          setPendingTransferForApproval(null)
        }
      })
    }
  }

  const handleCompleteTransfer = (transfer: any) => {
    setPendingTransferForCompletion(transfer)
    setShowCompletionDialog(true)
  }

  const handleConfirmCompletion = (receivingUserId: number) => {
    if (pendingTransferForCompletion) {
      completeTransfer.mutate({ 
        transferId: pendingTransferForCompletion.id, 
        receivingUserId: receivingUserId
      }, {
        onSuccess: () => {
          setShowCompletionDialog(false)
          setPendingTransferForCompletion(null)
        }
      })
    }
  }

  const handleDirectTransferCompletion = async (receivingUserId: number) => {
    if (!pendingTransferForCompletion) return
    
    setIsDirectTransferLoading(true)
    
    try {
      console.log('pendingTransferForCompletion data:', pendingTransferForCompletion)
      
      const directTransferRequest: DirectTransferRequest = {
        sourceWarehouseId: pendingTransferForCompletion.source_warehouse,
        destinationBranchId: pendingTransferForCompletion.destination_branch,
        productId: pendingTransferForCompletion.product,
        quantity: pendingTransferForCompletion.quantity,
        requestedById: receivingUserId,
        notes: `Completing transfer ${pendingTransferForCompletion.transfer_number} - Direct database operation`
      }
      
      console.log('directTransferRequest:', directTransferRequest)

      const result = await DirectTransferService.executeDirectTransfer(directTransferRequest)
      
      if (result.success) {
        toast({
          title: "Transfer Completed! 🎉",
          description: result.message,
          variant: "default"
        })
        
        // Invalidate all relevant caches to refresh data immediately
        queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] })
        queryClient.invalidateQueries({ queryKey: ['inventory-transfers'] })
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        queryClient.invalidateQueries({ queryKey: ['branch-inventory'] })
        queryClient.invalidateQueries({ queryKey: ['inventory'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        
        // Close dialog
        setShowCompletionDialog(false)
        setPendingTransferForCompletion(null)
      } else {
        toast({
          title: "Transfer Failed ❌",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during the transfer",
        variant: "destructive"
      })
      console.error('Direct transfer error:', error)
    } finally {
      setIsDirectTransferLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'REQUESTED': 'secondary',
      'PENDING': 'secondary', 
      'APPROVED': 'default',
      'IN_TRANSIT': 'default',
      'COMPLETED': 'default',
      'CANCELLED': 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Warehouse Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Central inventory hub for all Long Chau pharmacy operations
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setShowTransferDialog(true)} className="w-full sm:w-auto">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Request Transfer</span>
            <span className="sm:hidden">Transfer</span>
          </Button>
          <Button onClick={() => setShowWarehouseDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Warehouse</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWarehouses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">units across all warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">capacity utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTransfers}</div>
            <p className="text-xs text-muted-foreground">awaiting action</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="warehouses" className="w-full">
        <TabsList>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Warehouses Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Warehouse</TableHead>
                    <TableHead className="hidden sm:table-cell">Capacity</TableHead>
                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                    <TableHead className="hidden lg:table-cell">Utilization</TableHead>
                    <TableHead className="hidden xl:table-cell">Manager</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {warehousesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading warehouses...
                    </TableCell>
                  </TableRow>
                ) : warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No warehouses found
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((warehouse: any) => (
                    <TableRow key={warehouse.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{warehouse.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[180px]">{warehouse.address}</div>
                          {/* Mobile-only info */}
                          <div className="sm:hidden mt-2 space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Capacity: {warehouse.capacity?.toLocaleString()} units
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Stock: {warehouse.total_stock?.toLocaleString()} units
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Utilization: {(warehouse.utilization_percentage || 0).toFixed(1)}%
                            </div>
                            {warehouse.manager_name && (
                              <div className="text-xs text-muted-foreground">
                                Manager: {warehouse.manager_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-medium">{warehouse.capacity?.toLocaleString()}</span>
                        <span className="text-muted-foreground"> units</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-medium">{warehouse.total_stock?.toLocaleString()}</span>
                        <span className="text-muted-foreground"> units</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 lg:w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(warehouse.utilization_percentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {(warehouse.utilization_percentage || 0).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm">{warehouse.manager_name || 'Not assigned'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleAddInventory(warehouse.id)}
                            title="Add products"
                          >
                            <Package className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditWarehouse(warehouse)}
                            title="Edit warehouse"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteWarehouse.mutate(warehouse.id)}
                            disabled={deleteWarehouse.isPending}
                            title="Delete warehouse"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-medium">Warehouse Inventory</h3>
            <Button onClick={() => handleAddInventory()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Product to Warehouse</span>
              <span className="sm:hidden">Add Product</span>
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Warehouse</TableHead>
                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                    <TableHead className="hidden lg:table-cell">Min/Reorder</TableHead>
                    <TableHead className="hidden lg:table-cell">Cost Price</TableHead>
                    <TableHead className="hidden xl:table-cell">Status</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {warehouseInventory.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">{item.product_code}</div>
                        {/* Mobile-only info */}
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            Warehouse: {item.warehouse_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {item.current_stock?.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minimum_stock} | Reorder: {item.reorder_point}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost: ₫{parseFloat(item.cost_price).toLocaleString('vi-VN')}
                          </div>
                          <div className="mt-1">
                            {item.is_low_stock ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="h-2 w-2 mr-1" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-2 w-2 mr-1" />
                                In Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm">{item.warehouse_name}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-medium">{item.current_stock?.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        <div>Min: {item.minimum_stock}</div>
                        <div>Reorder: {item.reorder_point}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-medium">₫{parseFloat(item.cost_price).toLocaleString('vi-VN')}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {item.is_low_stock ? (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditInventory(item)}
                          title="Edit inventory"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteInventory.mutate(item.id)}
                          disabled={deleteInventory.isPending}
                          title="Remove from warehouse"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-medium">Inventory Transfers</h3>
            <Button onClick={() => setShowTransferDialog(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Request Transfer</span>
              <span className="sm:hidden">Request</span>
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Transfer #</TableHead>
                  <TableHead className="min-w-[150px]">Product</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[200px]">From → To</TableHead>
                  <TableHead className="hidden sm:table-cell">Quantity</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Requested By</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <span className="font-mono text-xs sm:text-sm">{transfer.transfer_number}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{transfer.product_name}</div>
                        <div className="text-xs text-muted-foreground">{transfer.product_code}</div>
                        {/* Mobile-only info */}
                        <div className="md:hidden mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            From: {transfer.source_warehouse_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            To: {transfer.destination_branch_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {transfer.quantity?.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By: {transfer.requested_by_name}
                          </div>
                          <div className="mt-1">
                            {getStatusBadge(transfer.status)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        <div className="font-medium truncate max-w-[100px]">{transfer.source_warehouse_name}</div>
                        <div className="text-muted-foreground text-center">↓</div>
                        <div className="truncate max-w-[100px]">{transfer.destination_branch_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-medium">{transfer.quantity?.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getStatusBadge(transfer.status)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm">{transfer.requested_by_name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        {/* Debug: Show the actual status and can_be_approved */}
                        <div className="text-xs text-gray-400 mb-1">
                          Status: "{transfer.status}" | Can approve: {transfer.can_be_approved ? 'Yes' : 'No'}
                        </div>
                        
                        {/* Show approve button for pending/requested status */}
                        {(['REQUESTED', 'pending', 'PENDING'].includes(transfer.status) || transfer.can_be_approved) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                            onClick={() => handleApproveTransfer(transfer)}
                            disabled={approveTransfer.isPending}
                          >
                            Approve
                          </Button>
                        )}
                        
                        {/* Show complete button for approved status */}
                        {(transfer.status === 'APPROVED' || transfer.status === 'approved') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                            onClick={() => handleCompleteTransfer(transfer)}
                            disabled={completeTransfer.isPending}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warehouse Dialog */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </DialogTitle>
          </DialogHeader>
          <WarehouseForm
            warehouse={editingWarehouse}
            onSubmit={handleWarehouseSubmit}
            onCancel={() => {
              setShowWarehouseDialog(false)
              setEditingWarehouse(null)
            }}
            isSubmitting={createWarehouse.isPending || updateWarehouse.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInventory ? 'Edit Warehouse Inventory' : 'Add Product to Warehouse'}
            </DialogTitle>
          </DialogHeader>
          <WarehouseInventoryForm
            warehouseInventory={editingInventory}
            warehouseId={selectedWarehouseForInventory}
            onSubmit={handleCreateInventory}
            onCancel={() => {
              setShowInventoryDialog(false)
              setEditingInventory(null)
              setSelectedWarehouseForInventory(undefined)
            }}
            isSubmitting={createInventory.isPending || updateInventory.isPending}
            warehouses={warehouses}
            products={products}
          />
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Inventory Transfer</DialogTitle>
          </DialogHeader>
          <InventoryTransferForm
            onSubmit={handleCreateTransfer}
            onCancel={() => setShowTransferDialog(false)}
            isSubmitting={createTransfer.isPending}
            warehouses={warehouses}
            branches={branches}
            products={products}
            users={users}
          />
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Approve transfer of <strong>{pendingTransferForApproval?.quantity}</strong> units of{' '}
              <strong>{pendingTransferForApproval?.product_name}</strong> from{' '}
              <strong>{pendingTransferForApproval?.source_warehouse_name}</strong> to{' '}
              <strong>{pendingTransferForApproval?.destination_branch_name}</strong>?
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Approved by:</label>
              
              <select 
                id="approver-select"
                className="w-full p-2 border rounded-md"
                defaultValue=""
              >
                <option value="">Select inventory manager...</option>
                {users
                  .filter(user => user.role === 'inventory_manager')
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || `${user.first_name} ${user.last_name}`}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false)
                  setPendingTransferForApproval(null)
                }}
                disabled={approveTransfer.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const selectElement = document.getElementById('approver-select') as HTMLSelectElement
                  const approverId = parseInt(selectElement.value)
                  if (approverId) {
                    handleConfirmApproval(approverId)
                  }
                }}
                disabled={approveTransfer.isPending}
              >
                {approveTransfer.isPending ? "Approving..." : "Approve Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete transfer of <strong>{pendingTransferForCompletion?.quantity}</strong> units of{' '}
              <strong>{pendingTransferForCompletion?.product_name}</strong> from{' '}
              <strong>{pendingTransferForCompletion?.source_warehouse_name}</strong> to{' '}
              <strong>{pendingTransferForCompletion?.destination_branch_name}</strong>?
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>📦 Stock Update:</strong> This will decrease warehouse stock by {pendingTransferForCompletion?.quantity} units and increase branch stock by the same amount.
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Backend Bug Workaround:</strong> The "Shadow Transfer" validates the transfer and marks it complete without modifying inventory records (avoiding deletions). The "Backend API" still has the deletion bug.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Received by:</label>
              <select 
                id="receiver-select"
                className="w-full p-2 border rounded-md"
                defaultValue=""
              >
                <option value="">Select staff member receiving items...</option>
                {users
                  .filter(user => ['pharmacist', 'manager', 'inventory_manager'].includes(user.role))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || `${user.first_name} ${user.last_name}`} ({user.role})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionDialog(false)
                  setPendingTransferForCompletion(null)
                }}
                disabled={completeTransfer.isPending || isDirectTransferLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => {
                  const selectElement = document.getElementById('receiver-select') as HTMLSelectElement
                  const receiverId = parseInt(selectElement.value)
                  if (receiverId) {
                    handleDirectTransferCompletion(receiverId)
                  }
                }}
                disabled={isDirectTransferLoading || completeTransfer.isPending}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {isDirectTransferLoading ? "Processing..." : "🟢 Shadow Transfer (Safe)"}
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => {
                  const selectElement = document.getElementById('receiver-select') as HTMLSelectElement
                  const receiverId = parseInt(selectElement.value)
                  if (receiverId) {
                    handleConfirmCompletion(receiverId)
                  }
                }}
                disabled={completeTransfer.isPending || isDirectTransferLoading}
                className="w-full sm:w-auto"
              >
                {completeTransfer.isPending ? "Completing..." : "⚠️ Backend API (Buggy)"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}