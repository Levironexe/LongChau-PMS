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
  Truck, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Home
} from "lucide-react"
import { Delivery } from "@/lib/types"
import { 
  useDeliveries, 
  useCreateDelivery, 
  useUpdateDelivery, 
  useDeleteDelivery, 
  useScheduleDelivery,
  useDeliveryStats 
} from '@/hooks/api/useDeliveries'
import { useOrders } from '@/hooks/api/useOrders'
import { useUsers } from '@/hooks/api/useUsers'

// Remove interfaces - using types from API

export default function DeliveriesPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    order_id: "",
    delivery_type: "pickup" as "pickup" | "home",
    scheduled_date: "",
    delivery_address: "",
    assigned_staff: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Real API integration
  const { data: deliveries = [] } = useDeliveries()
  const { data: deliveryStats } = useDeliveryStats()
  const { data: orders = [] } = useOrders()
  const { data: staff = [] } = useUsers()

  const createDelivery = useCreateDelivery()
  
  // Override success handler for dialog management
  const handleCreateSuccess = () => {
    setShowDialog(false)
    resetForm()
  }

  const updateDelivery = useUpdateDelivery()
  
  // Override success handler for dialog management
  const handleUpdateSuccess = () => {
    setEditingDelivery(null)
    resetForm()
  }

  const scheduleDelivery = useScheduleDelivery()

  const updateDeliveryStatus = updateDelivery // Use the same hook for status updates

  const deleteDelivery = useDeleteDelivery()

  const resetForm = () => {
    setFormData({
      order_id: "",
      delivery_type: "pickup",
      scheduled_date: "",
      delivery_address: "",
      assigned_staff: "",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDelivery) {
      updateDelivery.mutate({ 
        id: editingDelivery.id, 
        delivery_type: formData.delivery_type,
        scheduled_date: formData.scheduled_date,
        delivery_address: formData.delivery_address,
        delivery_instructions: formData.notes,
        assigned_staff: formData.assigned_staff ? parseInt(formData.assigned_staff) : undefined
      }, {
        onSuccess: handleUpdateSuccess
      })
    } else {
      createDelivery.mutate({
        order: parseInt(formData.order_id),
        delivery_type: formData.delivery_type,
        scheduled_date: formData.scheduled_date,
        delivery_address: formData.delivery_address,
        delivery_instructions: formData.notes,
        assigned_staff: formData.assigned_staff ? parseInt(formData.assigned_staff) : undefined
      }, {
        onSuccess: handleCreateSuccess
      })
    }
  }

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery)
    setFormData({
      order_id: delivery.order_number || "",
      delivery_type: delivery.delivery_type,
      scheduled_date: delivery.scheduled_date ? new Date(delivery.scheduled_date).toISOString().slice(0, 16) : "",
      delivery_address: delivery.delivery_address || "",
      assigned_staff: delivery.assigned_staff ? delivery.assigned_staff.toString() : "",
      notes: delivery.delivery_instructions || ""
    })
    setShowDialog(true)
  }

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch = delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.id.toString().includes(searchTerm) ||
                         delivery.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || delivery.delivery_type === typeFilter
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Use stats from hook, fallback to manual calculation if not available
  const scheduledDeliveries = deliveries.filter(d => d.status === "scheduled")
  const inTransitDeliveries = deliveries.filter(d => d.status === "in_transit")
  const deliveredDeliveries = deliveries.filter(d => d.status === "delivered")
  const homeDeliveries = deliveries.filter(d => d.delivery_type === "home")
  const pickupDeliveries = deliveries.filter(d => d.delivery_type === "pickup")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="h-3 w-3" />
      case "in_transit": return <Truck className="h-3 w-3" />
      case "delivered": return <CheckCircle className="h-3 w-3" />
      case "cancelled": return <XCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "scheduled": return "secondary"
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
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">
            Unified management for pickup and home deliveries
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Delivery
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryStats?.total || deliveries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Home Deliveries</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deliveryStats?.home || homeDeliveries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pickups</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{deliveryStats?.pickup || pickupDeliveries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{deliveryStats?.inTransit || inTransitDeliveries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="home">Home Delivery</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deliveries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery #</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Assigned Staff</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>
                  <div className="font-medium">#{delivery.id}</div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{delivery.order_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {delivery.customer_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={delivery.delivery_type === 'home' ? 'default' : 'outline'}>
                    {delivery.delivery_type === 'home' && <Home className="h-3 w-3 mr-1" />}
                    {delivery.delivery_type === 'pickup' && <Package className="h-3 w-3 mr-1" />}
                    {delivery.delivery_type.charAt(0).toUpperCase() + delivery.delivery_type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(delivery.status)}>
                    {getStatusIcon(delivery.status)}
                    <span className="ml-1">
                      {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('_', ' ')}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(delivery.scheduled_date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(delivery.scheduled_date).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-3 w-3" />
                    {delivery.assigned_staff_name || "Unassigned"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(delivery)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {delivery.status !== "delivered" && delivery.status !== "cancelled" && (
                      <Select
                        value={delivery.status}
                        onValueChange={(status: Delivery["status"]) => 
                          updateDeliveryStatus.mutate({ id: delivery.id, status }, {
                            onSuccess: () => {}
                          })
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteDelivery.mutate(delivery.id)}
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

      {/* Create/Edit Delivery Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDelivery ? 'Edit Delivery' : 'Schedule New Delivery'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">Order</Label>
                <Select 
                  value={formData.order_id} 
                  onValueChange={(value) => setFormData({ ...formData, order_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        Order #{order.id} - {order.customer_name || 'Unknown Customer'} (₫{parseFloat(order.total_amount).toLocaleString('vi-VN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select 
                  value={formData.delivery_type} 
                  onValueChange={(value: "pickup" | "home") => 
                    setFormData({ ...formData, delivery_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="home">Home Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_staff">Assigned Staff</Label>
                <Select 
                  value={formData.assigned_staff} 
                  onValueChange={(value) => setFormData({ ...formData, assigned_staff: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter(member => member.role !== 'customer' && member.role !== 'vip_customer').map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.first_name} {member.last_name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.delivery_type === "home" && (
              <div className="space-y-2">
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Input
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Enter delivery address..."
                  required={formData.delivery_type === "home"}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Instructions</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special delivery instructions..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingDelivery(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDelivery.isPending || updateDelivery.isPending}>
                {editingDelivery ? 'Update' : 'Schedule'} Delivery
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by scheduling your first delivery"}
          </p>
          {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Delivery
            </Button>
          )}
        </div>
      )}
    </div>
  )
}