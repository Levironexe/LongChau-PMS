"use client"

import { useState } from "react"
import { useCustomersOnly, useCreateUser, useCreateVipCustomer, useUpdateUser, useUpgradeToVip, useDeleteUser, useCustomerStats } from "@/hooks/api/useUsers"
import {
  useCreateCustomerFactory,
  useCreateVipCustomerFactory,
  useCanCreateUserViaFactory
} from "@/hooks/api/useUserFactory"
import { toast } from "@/hooks/use-toast"
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
import { Switch } from "@/components/ui/switch"
import { 
  Users, 
  Plus, 
  Search, 
  Crown,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  UserCheck,
  Star
} from "lucide-react"
import { User as UserType } from "@/lib/types"

// Using the unified User interface with customer roles
type Customer = UserType

export default function CustomersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [useFactoryPattern, setUseFactoryPattern] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "customer" as "customer" | "vip_customer",
    address: "",
    date_of_birth: "",
    notes: ""
  })

  // Real API calls using separated customer hooks
  const searchFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(typeFilter !== "all" && { role: typeFilter })
  }
  
  const { data: customers = [], isLoading, error } = useCustomersOnly(searchFilters)
  const customerStats = useCustomerStats()
  
  // API mutations
  const createCustomerMutation = useCreateUser()
  const createVipCustomerMutation = useCreateVipCustomer()
  const updateCustomerMutation = useUpdateUser()
  const deleteCustomerMutation = useDeleteUser()
  const upgradeToVipMutation = useUpgradeToVip()
  
  // Factory pattern hooks
  const createCustomerFactory = useCreateCustomerFactory()
  const createVipCustomerFactory = useCreateVipCustomerFactory()
  const { canCreate: canCreateCustomerViaFactory } = useCanCreateUserViaFactory('customer')
  const { canCreate: canCreateVipCustomerViaFactory } = useCanCreateUserViaFactory('vip_customer')
  
  // Handle success/error callbacks
  const handleSuccess = (message: string) => {
    toast({ title: "Success", description: message })
    setShowDialog(false)
    setEditingCustomer(null)
    resetForm()
  }
  
  const handleError = (error: any) => {
    toast({ 
      title: "Error", 
      description: error?.message || "An error occurred",
      variant: "destructive" 
    })
  }


  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "customer",
      address: "",
      date_of_birth: "",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, ...formData })
    } else {
      // Create new customer using factory pattern if enabled and available
      const factoryData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || "",
        date_of_birth: formData.date_of_birth || "",
        notes: formData.notes || ""
      }
      
      if (formData.role === "vip_customer") {
        if (useFactoryPattern && canCreateVipCustomerViaFactory) {
          createVipCustomerFactory.mutate(factoryData)
        } else {
          createVipCustomerMutation.mutate(formData)
        }
      } else {
        if (useFactoryPattern && canCreateCustomerViaFactory) {
          createCustomerFactory.mutate(factoryData)
        } else {
          createCustomerMutation.mutate(formData)
        }
      }
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role as "customer" | "vip_customer",
      address: customer.address || "",
      date_of_birth: customer.date_of_birth || "",
      notes: customer.notes || ""
    })
    setShowDialog(true)
  }

  // Filtering is now handled by the API hooks, just use the data directly
  const filteredCustomers = customers

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy customers and VIP members
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Members</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{customerStats.vipCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Members</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{customerStats.regularCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customerStats.activeCustomers}</div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="customer">Regular</SelectItem>
              <SelectItem value="vip_customer">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      {customer.address && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={customer.role === 'vip_customer' ? 'default' : 'secondary'}>
                      {customer.role === 'vip_customer' && <Crown className="h-3 w-3 mr-1" />}
                      {customer.role === 'vip_customer' ? 'VIP' : 'REGULAR'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{customer.total_orders || 0}</div>
                    <div className="text-xs text-muted-foreground">orders</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">₫{(customer.total_spent || 0).toLocaleString('vi-VN')}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {customer.registration_date ? new Date(customer.registration_date).toLocaleDateString() : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {customer.role === "customer" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => upgradeToVipMutation.mutate(customer.id)}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteCustomerMutation.mutate(customer.id)}
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Customer Type</Label>
                <Select value={formData.role} onValueChange={(value: "customer" | "vip_customer") => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Regular</SelectItem>
                    <SelectItem value="vip_customer">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            {/* Factory Pattern Toggle - Only show for create mode */}
            {!editingCustomer && (
              (formData.role === 'customer' && canCreateCustomerViaFactory) ||
              (formData.role === 'vip_customer' && canCreateVipCustomerViaFactory)
            ) && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="customer-factory-toggle" className="text-sm font-medium text-gray-900">
                      Use Factory Pattern
                    </Label>
                    <p className="text-xs text-gray-500">
                      Create this {formData.role === 'vip_customer' ? 'VIP customer' : 'customer'} using the Factory Pattern with enhanced defaults and automatic benefits
                    </p>
                  </div>
                  <Switch
                    id="customer-factory-toggle"
                    checked={useFactoryPattern}
                    onCheckedChange={setUseFactoryPattern}
                  />
                </div>
                {useFactoryPattern && (
                  <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    ✨ Factory Pattern enabled - {formData.role === 'vip_customer' ? 'VIP benefits and enhanced features' : 'Enhanced customer creation with optimizations'}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes about this customer..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingCustomer(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending || createCustomerFactory.isPending || createVipCustomerFactory.isPending}>
                {editingCustomer ? 'Update' : 'Create'} Customer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || typeFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first customer"}
          </p>
          {!searchTerm && typeFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>
      )}
    </div>
  )
}