"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { 
  ShoppingCart, 
  Search, 
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Package,
  Calendar,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  Plus
} from "lucide-react"
import { useOrders, useCreateOrder, useUpdateOrder, useTransitionOrder, useDeleteOrder, useOrderStats } from "@/hooks/api/useOrders"
import { useUsers } from "@/hooks/api/useUsers"
import { OrderForm } from "@/components/forms/OrderForm"
import { Order } from "@/lib/validations/order"

export default function OrdersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const queryClient = useQueryClient()

  // API hooks
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useOrders({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter as Order['status'] }),
    ...(typeFilter !== "all" && { order_type: typeFilter as Order['order_type'] })
  })
  
  const orderStats = useOrderStats()
  const { data: customers = [] } = useUsers({ role: 'customer' })

  // Mutations
  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const transitionOrderMutation = useTransitionOrder()
  const deleteOrderMutation = useDeleteOrder()

  // Handle order form submission
  const handleOrderSubmit = async (orderData: any) => {
    try {
      // Transform orderData to match CreateOrderRequest interface
      const transformedData = {
        customer: orderData.customer,
        order_type: orderData.order_type,
        branch: orderData.branch || 1,
        created_by: orderData.created_by,
        notes: orderData.notes || undefined,
        items: orderData.items || [],
        ...(orderData.prescription && { prescription: orderData.prescription }),
        ...(orderData.validated_by && { validated_by: orderData.validated_by }),
        ...(orderData.delivery_address && { delivery_address: orderData.delivery_address }),
        ...(orderData.delivery_instructions && { delivery_instructions: orderData.delivery_instructions }),
        ...(orderData.unregistered_customer_name && { 
          unregistered_customer_name: orderData.unregistered_customer_name,
          unregistered_customer_phone: orderData.unregistered_customer_phone,
          unregistered_customer_email: orderData.unregistered_customer_email,
          unregistered_customer_address: orderData.unregistered_customer_address
        })
      }
      
      if (editingOrder) {
        await updateOrderMutation.mutateAsync({
          id: editingOrder.id!,
          ...transformedData,
        })
      } else {
        await createOrderMutation.mutateAsync(transformedData)
      }
      setShowDialog(false)
      setEditingOrder(null)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (error) {
      console.error('Order submission failed:', error)
      throw error
    }
  }

  const handleOrderCancel = () => {
    setShowDialog(false)
    setEditingOrder(null)
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setShowDialog(true)
  }

  const handleViewDetails = (order: Order) => {
    setViewingOrder(order)
    setShowDetailsDialog(true)
  }

  const handleStatusChange = async (orderId: number, newStatus: Order["status"]) => {
    if (!newStatus) return
    
    try {
      await transitionOrderMutation.mutateAsync({ 
        id: orderId, 
        status: newStatus 
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  const handleDelete = async (orderId: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderMutation.mutateAsync(orderId)
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      } catch (error) {
        console.error('Order deletion failed:', error)
      }
    }
  }

  const filteredOrders = orders

  const pendingOrders = orderStats.pendingOrders
  const processingOrders = orderStats.processingOrders  
  const completedOrders = orderStats.completedOrders
  const totalRevenue = orderStats.totalRevenue

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3" />
      case "processing": return <ClipboardList className="h-3 w-3" />
      case "completed": return <CheckCircle className="h-3 w-3" />
      case "cancelled": return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "secondary" as const
      case "processing": return "default" as const
      case "completed": return "default" as const
      case "cancelled": return "destructive" as const
      default: return "secondary" as const
    }
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numAmount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders with validated forms and real-time inventory tracking
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in_store">In-Store</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.order_number || `#${order.id}`}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_name || 'Unknown Customer'}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer_role === 'vip_customer' ? 'VIP Customer' : 'Regular Customer'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {order.order_type === 'in_store' ? 'In-Store' :
                     order.order_type === 'online' ? 'Online' :
                     order.order_type === 'prescription' ? 'Prescription' : 
                     order.order_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {order.order_date 
                      ? new Date(order.order_date).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </div>
                  {order.order_date && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.order_date).toLocaleTimeString('vi-VN')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {order.total_amount ? formatCurrency(order.total_amount) : formatCurrency(0)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(order)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(status: Order["status"]) => 
                            handleStatusChange(order.id!, status)
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(order.id!)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Order Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            order={editingOrder || undefined}
            onSubmit={handleOrderSubmit}
            onCancel={handleOrderCancel}
            isSubmitting={createOrderMutation.isPending || updateOrderMutation.isPending}
            mode={editingOrder ? 'edit' : 'create'}
            onStatusChange={handleStatusChange}
          />
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order Details - {viewingOrder?.order_number || `#${viewingOrder?.id}`}
            </DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                  <div className="font-medium">{viewingOrder.customer_name || 'Unknown Customer'}</div>
                  <div className="text-sm text-muted-foreground">
                    {viewingOrder.customer_role === 'vip_customer' ? 'VIP Customer' : 'Regular Customer'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                  <div className="font-medium">
                    {viewingOrder.order_date 
                      ? new Date(viewingOrder.order_date).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </div>
                  {viewingOrder.order_date && (
                    <div className="text-sm text-muted-foreground">
                      {new Date(viewingOrder.order_date).toLocaleTimeString('vi-VN')}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={getStatusVariant(viewingOrder.status)} className="mt-1">
                    {getStatusIcon(viewingOrder.status)}
                    <span className="ml-1">
                      {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                    </span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order Type</Label>
                  <Badge variant="outline" className="mt-1">
                    {viewingOrder.order_type === 'in_store' ? 'In-Store' :
                     viewingOrder.order_type === 'online' ? 'Online' :
                     viewingOrder.order_type === 'prescription' ? 'Prescription' :
                     viewingOrder.order_type}
                  </Badge>
                </div>
              </div>

              {viewingOrder.order_type === 'online' && viewingOrder.delivery_address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Delivery Address</Label>
                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                    {viewingOrder.delivery_address}
                    {viewingOrder.delivery_instructions && (
                      <div className="mt-1 text-muted-foreground">
                        Instructions: {viewingOrder.delivery_instructions}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Order Items</Label>
                <div className="mt-2 space-y-2">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id || item.product} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{item.product_name || 'Unknown Product'}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit_price || '0')} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.total_price || (parseFloat(item.unit_price || '0') * item.quantity))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 bg-muted rounded font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(viewingOrder.total_amount || '0')}</span>
                  </div>
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                    {viewingOrder.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredOrders.length === 0 && !ordersLoading && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by creating your first order"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          )}
        </div>
      )}
    </div>
  )
}