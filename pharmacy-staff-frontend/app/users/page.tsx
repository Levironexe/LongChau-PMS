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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Star,
  Shield,
  UserCog,
  Factory,
  Award
} from "lucide-react"
import { User as UserType } from "@/lib/types"

const userRoles = [
  { value: "customer", label: "Customer", color: "default", category: "customer" },
  { value: "vip_customer", label: "VIP Customer", color: "default", category: "customer" },
  { value: "pharmacist", label: "Pharmacist", color: "default", category: "staff" },
  { value: "technician", label: "Pharmacy Technician", color: "secondary", category: "staff" },
  { value: "cashier", label: "Cashier", color: "outline", category: "staff" },
  { value: "manager", label: "Store Manager", color: "default", category: "staff" },
  { value: "inventory_manager", label: "Inventory Manager", color: "secondary", category: "staff" }
]

export default function UsersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showFactoryDialog, setShowFactoryDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "customer" as UserType['role'],
    status: "active" as "active" | "inactive",
    address: "",
    date_of_birth: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock data using unified /users/ endpoint structure
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Simulate API call to /users/ endpoint
      return [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@email.com",
          phone: "+1-555-0123",
          role: "vip_customer",
          status: "active",
          address: "123 Main St, New York, NY 10001",
          date_of_birth: "1985-06-15",
          registration_date: "2023-01-15",
          notes: "Regular customer, prefers generic brands",
          total_orders: 25,
          total_spent: 450.75,
          loyalty_points: 230
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@email.com",
          phone: "+1-555-0124",
          role: "customer",
          status: "active",
          address: "456 Oak Ave, Brooklyn, NY 11201",
          date_of_birth: "1990-03-22",
          registration_date: "2023-03-20",
          notes: "Allergic to penicillin",
          total_orders: 8,
          total_spent: 125.50,
          loyalty_points: 62
        },
        {
          id: 3,
          first_name: "Dr. Sarah",
          last_name: "Wilson",
          email: "sarah.wilson@longchau.com",
          phone: "+1-555-0125",
          role: "pharmacist",
          status: "active",
          hire_date: "2023-01-15",
          notes: "Senior pharmacist with 5 years experience"
        },
        {
          id: 4,
          first_name: "Mike",
          last_name: "Johnson",
          email: "mike.johnson@longchau.com",
          phone: "+1-555-0126",
          role: "technician",
          status: "active",
          hire_date: "2023-03-20",
          notes: "Handles inventory management"
        }
      ] as UserType[]
    },
  })

  // Factory method mutations
  const createPharmacist = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /users/create-pharmacist/
      return Promise.resolve({ ...data, id: Date.now(), role: "pharmacist", hire_date: new Date().toISOString() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowFactoryDialog(false)
      resetForm()
    },
  })

  const createCustomer = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /users/create-customer/
      return Promise.resolve({ ...data, id: Date.now(), role: "customer", registration_date: new Date().toISOString() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const createVipCustomer = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /users/create-vip-customer/
      return Promise.resolve({ 
        ...data, 
        id: Date.now(), 
        role: "vip_customer", 
        registration_date: new Date().toISOString(),
        loyalty_points: 100 // VIP bonus
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowFactoryDialog(false)
      resetForm()
    },
  })

  const createStaff = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /users/create-staff/
      return Promise.resolve({ ...data, id: Date.now(), hire_date: new Date().toISOString() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowFactoryDialog(false)
      resetForm()
    },
  })

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof formData) => {
      // API call to /users/{id}/
      return Promise.resolve({ id, ...data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditingUser(null)
      resetForm()
    },
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => {
      // API call to /users/{id}/
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const upgradeToVip = useMutation({
    mutationFn: (id: number) => {
      // API call to /users/{id}/upgrade-to-vip/
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "customer",
      status: "active",
      address: "",
      date_of_birth: "",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, ...formData })
    } else {
      createCustomer.mutate(formData)
    }
  }

  const handleFactoryCreate = (type: string) => {
    switch(type) {
      case 'pharmacist':
        createPharmacist.mutate(formData)
        break
      case 'vip_customer':
        createVipCustomer.mutate(formData)
        break
      case 'staff':
        createStaff.mutate(formData)
        break
      default:
        createCustomer.mutate(formData)
    }
  }

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || "active",
      address: user.address || "",
      date_of_birth: user.date_of_birth || "",
      notes: user.notes || ""
    })
    setShowDialog(true)
  }

  const filteredUsers = users.filter((user: UserType) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    // Tab filtering
    if (activeTab === "customers") {
      return (user.role === "customer" || user.role === "vip_customer") && matchesSearch && matchesRole
    }
    if (activeTab === "staff") {
      return !["customer", "vip_customer"].includes(user.role) && matchesSearch && matchesRole
    }
    
    return matchesSearch && matchesRole
  })

  const getRoleInfo = (role: string) => {
    return userRoles.find(r => r.value === role) || userRoles[0]
  }

  const customers = users.filter(u => ["customer", "vip_customer"].includes(u.role))
  const vipCustomers = users.filter(u => u.role === "vip_customer")
  const staff = users.filter(u => !["customer", "vip_customer"].includes(u.role))
  const activeUsers = users.filter(u => u.status === "active")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Unified management for customers, VIP members, and staff using RBAC
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setShowDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button variant="outline" onClick={() => { resetForm(); setShowFactoryDialog(true) }}>
            <Factory className="h-4 w-4 mr-2" />
            Factory Create
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Members</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{vipCustomers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{staff.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {userRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role)
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.first_name} {user.last_name}
                                {user.role === "vip_customer" && <Crown className="h-3 w-3 text-yellow-600" />}
                                {user.loyalty_points && (
                                  <Badge variant="outline" className="text-xs">
                                    <Award className="h-2 w-2 mr-1" />
                                    {user.loyalty_points} pts
                                  </Badge>
                                )}
                              </div>
                              {user.address && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleInfo.color as any}>
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.total_orders && (
                              <div>{user.total_orders} orders</div>
                            )}
                            {user.total_spent && (
                              <div className="text-green-600">${user.total_spent.toFixed(2)}</div>
                            )}
                            {user.hire_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.hire_date).toLocaleDateString()}
                              </div>
                            )}
                            {user.registration_date && !user.hire_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.registration_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.role === "customer" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => upgradeToVip.mutate(user.id)}
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                VIP
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteUser.mutate(user.id)}
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
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.filter(u => ["customer", "vip_customer"].includes(u.role)).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'vip_customer' ? 'default' : 'secondary'}>
                          {user.role === 'vip_customer' && <Crown className="h-3 w-3 mr-1" />}
                          {user.role === 'vip_customer' ? 'VIP' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.total_orders || 0}</TableCell>
                      <TableCell>${(user.total_spent || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Award className="h-3 w-3 mr-1" />
                          {user.loyalty_points || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.role === "customer" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => upgradeToVip.mutate(user.id)}
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Upgrade
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(user)}
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

          <TabsContent value="staff" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.filter(u => !["customer", "vip_customer"].includes(u.role)).map((user) => {
                    const roleInfo = getRoleInfo(user.role)
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleInfo.color as any}>
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.hire_date && new Date(user.hire_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteUser.mutate(user.id)}
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
          </TabsContent>
        </div>
      </Tabs>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
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
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: UserType['role']) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes about this user..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingUser(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCustomer.isPending || updateUser.isPending}>
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Factory Method Dialog */}
      <Dialog open={showFactoryDialog} onOpenChange={setShowFactoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Factory Method User Creation</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Use factory methods to create users with proper defaults and validation
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleFactoryCreate('pharmacist')}
              >
                <Shield className="h-6 w-6 mb-2" />
                Create Pharmacist
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleFactoryCreate('vip_customer')}
              >
                <Crown className="h-6 w-6 mb-2" />
                Create VIP Customer
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleFactoryCreate('staff')}
              >
                <UserCog className="h-6 w-6 mb-2" />
                Create Staff Member
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleFactoryCreate('customer')}
              >
                <User className="h-6 w-6 mb-2" />
                Create Customer
              </Button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="factory_first_name">First Name</Label>
                  <Input
                    id="factory_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="factory_last_name">Last Name</Label>
                  <Input
                    id="factory_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="factory_email">Email</Label>
                  <Input
                    id="factory_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="factory_phone">Phone</Label>
                  <Input
                    id="factory_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFactoryDialog(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first user"}
          </p>
          {!searchTerm && roleFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      )}
    </div>
  )
}