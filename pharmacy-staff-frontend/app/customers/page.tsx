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
import { CustomerForm } from "@/components/forms"
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
  }
  
  const handleError = (error: any) => {
    toast({ 
      title: "Error", 
      description: error?.message || "An error occurred",
      variant: "destructive" 
    })
  }



  const handleFormSubmit = (data: any) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate(
        { id: editingCustomer.id, ...data },
        {
          onSuccess: () => handleSuccess("Customer updated successfully!"),
          onError: handleError,
        }
      )
    } else {
      // Create new customer using factory pattern if enabled and available
      const factoryData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address || "",
        date_of_birth: data.date_of_birth || "",
        notes: data.notes || ""
      }
      
      if (data.role === "vip_customer") {
        if (useFactoryPattern && canCreateVipCustomerViaFactory) {
          createVipCustomerFactory.mutate(factoryData, {
            onSuccess: () => handleSuccess("VIP customer created successfully via Factory Pattern!"),
            onError: handleError,
          })
        } else {
          createVipCustomerMutation.mutate(data, {
            onSuccess: () => handleSuccess("VIP customer created successfully!"),
            onError: handleError,
          })
        }
      } else {
        if (useFactoryPattern && canCreateCustomerViaFactory) {
          createCustomerFactory.mutate(factoryData, {
            onSuccess: () => handleSuccess("Customer created successfully via Factory Pattern!"),
            onError: handleError,
          })
        } else {
          createCustomerMutation.mutate(data, {
            onSuccess: () => handleSuccess("Customer created successfully!"),
            onError: handleError,
          })
        }
      }
    }
  }

  const handleFormCancel = () => {
    setShowDialog(false)
    setEditingCustomer(null)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
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
        <Button onClick={() => setShowDialog(true)}>
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
                        onClick={() => upgradeToVipMutation.mutate(customer.id, {
                        onSuccess: () => handleSuccess("Customer upgraded to VIP successfully!"),
                        onError: handleError,
                      })}
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
                      onClick={() => deleteCustomerMutation.mutate(customer.id, {
                        onSuccess: () => handleSuccess("Customer deleted successfully!"),
                        onError: handleError,
                      })}
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
          <CustomerForm
            customer={editingCustomer}
            useFactoryPattern={useFactoryPattern}
            onFactoryPatternChange={setUseFactoryPattern}
            canCreateCustomerViaFactory={canCreateCustomerViaFactory}
            canCreateVipCustomerViaFactory={canCreateVipCustomerViaFactory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={
              createCustomerMutation.isPending || 
              updateCustomerMutation.isPending || 
              createCustomerFactory.isPending || 
              createVipCustomerFactory.isPending
            }
          />
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
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>
      )}
    </div>
  )
}