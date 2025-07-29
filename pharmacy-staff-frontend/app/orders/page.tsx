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
  ShoppingCart, 
  Plus, 
  Minus,
  Search, 
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Package,
  User,
  Calendar,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { api } from "@/lib/api"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  price: string
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  order_date: string
  status: "pending" | "processing" | "completed" | "cancelled"
  total_amount: number
  items: OrderItem[]
  notes?: string
  payment_method: "cash" | "card" | "insurance"
}

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  customer_type: "regular" | "vip"
}

interface Product {
  id: number
  name: string
  price: string
  stock: number
  requires_prescription: boolean
}

export default function OrdersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cartItems, setCartItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customer_id: "",
    payment_method: "cash" as "cash" | "card" | "insurance",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock data - replace with actual API calls
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      return [
        {
          id: 1,
          customer_id: 1,
          customer_name: "John Doe",
          customer_email: "john.doe@email.com",
          order_date: "2024-01-15T10:30:00Z",
          status: "completed",
          total_amount: 45.50,
          payment_method: "card",
          notes: "Regular refill order",
          items: [
            {
              id: 1,
              product_id: 1,
              product_name: "Paracetamol 500mg",
              price: "5.99",
              quantity: 2,
              subtotal: 11.98
            },
            {
              id: 2,
              product_id: 3,
              product_name: "Vitamin D3 1000IU",
              price: "18.00",
              quantity: 1,
              subtotal: 18.00
            }
          ]
        },
        {
          id: 2,
          customer_id: 2,
          customer_name: "Jane Smith",
          customer_email: "jane.smith@email.com",
          order_date: "2024-01-16T14:15:00Z",
          status: "processing",
          total_amount: 12.50,
          payment_method: "insurance",
          notes: "Prescription order - verify insurance",
          items: [
            {
              id: 3,
              product_id: 2,
              product_name: "Amoxicillin 250mg",
              price: "12.50",
              quantity: 1,
              subtotal: 12.50
            }
          ]
        },
        {
          id: 3,
          customer_id: 3,
          customer_name: "Robert Johnson",
          customer_email: "robert.j@email.com",
          order_date: "2024-01-17T09:45:00Z",
          status: "pending",
          total_amount: 23.99,
          payment_method: "cash",
          items: [
            {
              id: 4,
              product_id: 1,
              product_name: "Paracetamol 500mg",
              price: "5.99",
              quantity: 4,
              subtotal: 23.96
            }
          ]
        }
      ] as Order[]
    },
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      // Mock data matching customers page structure
      return [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@email.com",
          phone: "+1-555-0123",
          customer_type: "vip"
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@email.com",
          phone: "+1-555-0124",
          customer_type: "regular"
        },
        {
          id: 3,
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.j@email.com",
          phone: "+1-555-0125",
          customer_type: "vip"
        }
      ] as Customer[]
    },
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Mock data matching products page structure
      return [
        {
          id: 1,
          name: "Paracetamol 500mg",
          price: "5.99",
          stock: 150,
          requires_prescription: false
        },
        {
          id: 2,
          name: "Amoxicillin 250mg",
          price: "12.50",
          stock: 75,
          requires_prescription: true
        },
        {
          id: 3,
          name: "Vitamin D3 1000IU",
          price: "18.00",
          stock: 200,
          requires_prescription: false
        }
      ] as Product[]
    },
  })

  const createOrder = useMutation({
    mutationFn: (data: typeof formData & { items: any[] }) => {
      // Replace with actual API call
      const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
      const customer = customers.find(c => c.id === parseInt(data.customer_id))
      return Promise.resolve({ 
        ...data, 
        id: Date.now(), 
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : "",
        customer_email: customer?.email || "",
        order_date: new Date().toISOString(),
        status: "pending",
        total_amount: total,
        items: cartItems.map((item, index) => ({
          id: Date.now() + index,
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          subtotal: parseFloat(item.price) * item.quantity
        }))
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const updateOrder = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Order>) => {
      // Replace with actual API call
      return Promise.resolve({ id, ...data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setEditingOrder(null)
      resetForm()
    },
  })

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: number, status: Order["status"] }) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const deleteOrder = useMutation({
    mutationFn: (id: number) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const resetForm = () => {
    setFormData({
      customer_id: "",
      payment_method: "cash",
      notes: ""
    })
    setCartItems([])
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
      customer_id: order.customer_id.toString(),
      payment_method: order.payment_method,
      notes: order.notes || ""
    })
    setCartItems(order.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      price: item.price,
      quantity: item.quantity
    })))
    setShowDialog(true)
  }

  const handleViewDetails = (order: Order) => {
    setViewingOrder(order)
    setShowDetailsDialog(true)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0).toFixed(2)
  }

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingOrders = orders.filter(o => o.status === "pending")
  const processingOrders = orders.filter(o => o.status === "processing")
  const completedOrders = orders.filter(o => o.status === "completed")
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.total_amount, 0)

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
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
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
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer_email}</div>
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
                    {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">${order.total_amount.toFixed(2)}</div>
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
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name} ({customer.customer_type})
                      </SelectItem>
                    ))}
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
                {products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${product.price} | Stock: {product.stock}
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
                ))}
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
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
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
                    Total: ${calculateTotal()}
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
                  <div className="font-medium">{viewingOrder.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{viewingOrder.customer_email}</div>
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
                    {viewingOrder.payment_method.charAt(0).toUpperCase() + viewingOrder.payment_method.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Order Items</Label>
                <div className="mt-2 space-y-2">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 bg-muted rounded font-bold">
                    <span>Total</span>
                    <span>${viewingOrder.total_amount.toFixed(2)}</span>
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
