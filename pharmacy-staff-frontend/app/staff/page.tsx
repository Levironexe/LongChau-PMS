"use client"

import { useState } from "react"
import { useStaffOnly, useCreateUser, useCreateStaff, useUpdateUser, useDeleteUser, useStaffStats } from "@/hooks/api/useUsers"
import {
  useCreateStaffFactory,
  useCreateUserFactory,
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
  DialogTrigger,
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
  UserCog, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  Users,
  UserCheck,
  UserX
} from "lucide-react"
import { User as UserType } from "@/lib/types"

// Using staff roles from the unified User system
const staffRoles = [
  { value: "pharmacist", label: "Pharmacist", color: "default" },
  { value: "technician", label: "Pharmacy Technician", color: "secondary" },
  { value: "cashier", label: "Cashier", color: "outline" },
  { value: "manager", label: "Store Manager", color: "default" },
  { value: "inventory_manager", label: "Inventory Manager", color: "secondary" },
]

const permissions = {
  admin: ["all"],
  pharmacist: ["prescriptions", "inventory", "customers", "reports"],
  technician: ["inventory", "customers", "basic_reports"],
  cashier: ["sales", "customers"],
  manager: ["inventory", "staff", "reports", "customers", "sales"]
}

// Using the unified User interface for staff members
type StaffMember = UserType

export default function StaffPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [useFactoryPattern, setUseFactoryPattern] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "cashier",
    status: "active" as "active" | "inactive",
    notes: ""
  })

  // Real API calls using separated staff hooks
  const searchFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(roleFilter !== "all" && { role: roleFilter })
  }
  
  const { data: staff = [] } = useStaffOnly(searchFilters)
  const staffStats = useStaffStats()
  
  // API mutations
  const createStaffMutation = useCreateStaff()
  const updateStaffMutation = useUpdateUser()
  const deleteStaffMutation = useDeleteUser()
  
  // Factory pattern hooks
  const createStaffFactory = useCreateStaffFactory()
  const createUserFactory = useCreateUserFactory()
  const { canCreate: canCreateStaffViaFactory } = useCanCreateUserViaFactory(formData.role)
  
  // Handle success/error callbacks
  const handleSuccess = (message: string) => {
    toast({ title: "Success", description: message })
    setShowDialog(false)
    setEditingStaff(null)
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
      role: "cashier",
      status: "active",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStaff) {
      updateStaffMutation.mutate({ id: editingStaff.id, ...formData, role: formData.role as any })
    } else {
      // Create new staff using factory pattern if enabled and available
      if (useFactoryPattern && canCreateStaffViaFactory) {
        const factoryData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: "",
          notes: formData.notes,
          role: formData.role
        }
        createStaffFactory.mutate(factoryData)
      } else {
        createStaffMutation.mutate({ ...formData, role: formData.role as any })
      }
    }
  }

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      status: staffMember.status || "active",
      notes: staffMember.notes || ""
    })
    setShowDialog(true)
  }

  // Filtering is now handled by the API hooks
  const filteredStaff = staff

  const getRoleInfo = (role: string) => {
    return staffRoles.find(r => r.value === role) || staffRoles[0]
  }


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy staff members and their roles
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{staffStats.activeStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{staffStats.totalStaff - staffStats.activeStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pharmacists</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {staff.filter(s => s.role === 'pharmacist').length}
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
              placeholder="Search staff members..."
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
              {staffRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => {
              const roleInfo = getRoleInfo(member.role)
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {member.first_name} {member.last_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.color as any}>
                      {roleInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteStaffMutation.mutate(member.id)}
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

      {/* Add/Edit Staff Dialog */}
      <Dialog open={showDialog || !!editingStaff} onOpenChange={(open) => {
        if (!open) {
          setShowDialog(false)
          setEditingStaff(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
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
            
            {/* Factory Pattern Toggle - Only show for create mode */}
            {!editingStaff && canCreateStaffViaFactory && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="staff-factory-toggle" className="text-sm font-medium text-gray-900">
                      Use Factory Pattern
                    </Label>
                    <p className="text-xs text-gray-500">
                      Create this {staffRoles.find(r => r.value === formData.role)?.label.toLowerCase()} using the Factory Pattern with enhanced defaults and validation
                    </p>
                  </div>
                  <Switch
                    id="staff-factory-toggle"
                    checked={useFactoryPattern}
                    onCheckedChange={setUseFactoryPattern}
                  />
                </div>
                {useFactoryPattern && (
                  <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    ✨ Factory Pattern enabled - Enhanced creation with role-specific defaults and permissions
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Role Permissions Info */}
            <div className="space-y-2">
              <Label>Role Permissions</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex flex-wrap gap-1">
                  {permissions[formData.role as keyof typeof permissions]?.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingStaff(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStaffMutation.isPending || updateStaffMutation.isPending || createStaffFactory.isPending}>
                {editingStaff ? 'Update' : 'Create'} Staff Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first staff member"}
          </p>
          {!searchTerm && roleFilter === "all" && (
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          )}
        </div>
      )}
    </div>
  )
}