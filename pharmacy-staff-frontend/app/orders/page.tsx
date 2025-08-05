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
import { Textarea } from "@/components/ui/textarea"
import { 
  ShoppingCart, 
  Plus, 
  Minus,
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
  XCircle
} from "lucide-react"
import { useOrders, useCreateOrder, useUpdateOrder, useTransitionOrder, useDeleteOrder, useOrderStats } from "@/hooks/api/useOrders"
import { useCustomersOnly } from "@/hooks/api/useUsers"
import { useProducts } from "@/hooks/api/useProducts"

import { Order, User, Product } from "@/lib/types"

export default function OrdersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [cartItems, setCartItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customer_id: "",
    order_type: "in_store" as "prescription" | "in_store" | "online",
    payment_method: "cash" as "cash" | "card" | "insurance",
    notes: ""
  })

  const queryClient = useQueryClient()

  // API hooks
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useOrders({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter as Order['status'] }),
    ...(typeFilter !== "all" && { order_type: typeFilter as Order['order_type'] })
  })
  
  const orderStats = useOrderStats()

  const { data: customers = [], isLoading: customersLoading } = useCustomersOnly()
  const { data: products = [], isLoading: productsLoading } = useProducts()

  // Utility functions
  const resetForm = () => {
    setFormData({
      customer_id: "",
      order_type: "in_store",
      payment_method: "cash",
      notes: ""
    })
    setCartItems([])
  }

  const createOrderMutation = useCreateOrder()
  
  const createOrder = {
    mutate: (data: any) => {
      createOrderMutation.mutate({
        customer: parseInt(data.customer_id),
        order_type: data.order_type,
        payment_method: data.payment_method,
        items: cartItems.map(item => ({
          product: item.product_id,
          quantity: item.quantity
        })),
        notes: data.notes,
        branch: 1 // Default branch - should be dynamic in production
      })
    },
    isPending: createOrderMutation.isPending
  }
  
  // Handle successful order creation
  if (createOrderMutation.isSuccess && !createOrderMutation.isPending) {
    setShowDialog(false)
    resetForm()
  }

  const updateOrderMutation = useUpdateOrder()
  
  const updateOrder = {
    mutate: (data: any) => {
      updateOrderMutation.mutate({
        id: data.id,
        customer: parseInt(data.customer_id),
        payment_method: data.payment_method,
        notes: data.notes
      })
    },
    isPending: updateOrderMutation.isPending
  }
  
  // Handle successful order update
  if (updateOrderMutation.isSuccess && !updateOrderMutation.isPending) {
    setEditingOrder(null)
    resetForm()
  }

  const transitionOrderMutation = useTransitionOrder()
  
  const updateOrderStatus = {
    mutate: ({ id, status }: { id: number, status: Order["status"] }) => {
      transitionOrderMutation.mutate({ id, status })
    },
    isPending: transitionOrderMutation.isPending
  }

  const deleteOrderMutation = useDeleteOrder()
  
  const deleteOrder = {
    mutate: (id: number) => {
      deleteOrderMutation.mutate(id)
    },
    isPending: deleteOrderMutation.isPending
  }

  const addToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.product_id === product.id)
    if (existing) {
      setCartItems(
        cartItems.map((item) => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: number, change: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      })
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingOrder) {
      updateOrder.mutate({ 
        id: editingOrder.id, 
        customer_id: parseInt(formData.customer_id),
        payment_method: formData.payment_method,
        notes: formData.notes
      })
    } else {
      createOrder.mutate({ ...formData, items: cartItems })
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customer_id: order.customer.toString(),
      order_type: order.order_type,
      payment_method: order.payment_method || "cash",
      notes: order.notes || ""
    })
    setCartItems(order.items?.map(item => ({
      product_id: item.product,
      product_name: item.product_name || 'Unknown Product',
      price: item.unit_price,
      quantity: item.quantity
    })) || [])
    setShowDialog(true)
  }

  const handleViewDetails = (order: Order) => {
    setViewingOrder(order)
    setShowDetailsDialog(true)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0).toFixed(2)
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
      case "pending": return "secondary"
      case "processing": return "default"
      case "completed": return "default"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track order status
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
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
            <div className="text-2xl font-bold text-green-600">₫{totalRevenue.toLocaleString('vi-VN')}</div>
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
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">#{order.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_name || 'Unknown Customer'}</div>
                    <div className="text-sm text-muted-foreground">{customers.find(c => c.id === order.customer)?.email || 'No email'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.order_date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.order_date).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {order.payment_method ? order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1) : 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">₫{parseFloat(order.total_amount).toLocaleString('vi-VN')}</div>
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
                            updateOrderStatus.mutate({ id: order.id, status })
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
                      onClick={() => deleteOrder.mutate(order.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer</Label>
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersLoading ? (
                      <SelectItem value="" disabled>Loading customers...</SelectItem>
                    ) : customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.first_name} {customer.last_name} ({customer.role === 'vip_customer' ? 'VIP' : 'Regular'})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No customers found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value: "cash" | "card" | "insurance") => 
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Products</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {productsLoading ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    Loading products...
                  </div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ₫{parseFloat(product.price).toLocaleString('vi-VN')} | Stock: {product.stock}
                          {product.requires_prescription && " | Rx Required"}
                        </div>
                      </div>
                      <Button 
                        type="button"
                        size="sm" 
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No products found
                  </div>
                )}
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{item.product_name}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.product_id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="w-16 text-right">
                          ₫{(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')}
                        </span>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-bold text-lg border-t pt-2">
                    Total: ₫{parseFloat(calculateTotal()).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes about this order..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingOrder(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.customer_id || cartItems.length === 0 || createOrder.isPending || updateOrder.isPending}
              >
                {editingOrder ? 'Update' : 'Create'} Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{viewingOrder?.id}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                  <div className="font-medium">{viewingOrder.customer_name || 'Unknown Customer'}</div>
                  <div className="text-sm text-muted-foreground">{customers.find(c => c.id === viewingOrder.customer)?.email || 'No email'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                  <div className="font-medium">
                    {new Date(viewingOrder.order_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(viewingOrder.order_date).toLocaleTimeString()}
                  </div>
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
                  <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                  <Badge variant="outline" className="mt-1">
                    {viewingOrder.payment_method ? viewingOrder.payment_method.charAt(0).toUpperCase() + viewingOrder.payment_method.slice(1) : 'Unknown'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Order Items</Label>
                <div className="mt-2 space-y-2">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{item.product_name || 'Unknown Product'}</div>
                        <div className="text-sm text-muted-foreground">
                          ₫{parseFloat(item.unit_price).toLocaleString('vi-VN')} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">₫{(parseFloat(item.unit_price) * item.quantity).toLocaleString('vi-VN')}</div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 bg-muted rounded font-bold">
                    <span>Total</span>
                    <span>₫{parseFloat(viewingOrder.total_amount).toLocaleString('vi-VN')}</span>
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

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by creating your first order"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
