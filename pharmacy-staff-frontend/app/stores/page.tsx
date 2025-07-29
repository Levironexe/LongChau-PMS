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
  Store, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Building
} from "lucide-react"
import { api } from "@/lib/api"

interface Branch {
  id: number
  name: string
  address: string
  phone: string
  email: string
  manager_name: string
  status: "active" | "inactive" | "maintenance"
  opening_hours: string
  established_date: string
  notes?: string
  total_products?: number
  staff_count?: number
}

export default function StoresPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingStore, setEditingStore] = useState<Branch | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager_name: "",
    status: "active" as "active" | "inactive" | "maintenance",
    opening_hours: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock data - replace with actual API calls
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      return [
        {
          id: 1,
          name: "Long Chau - District 1",
          address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
          phone: "+84-28-3822-1234",
          email: "district1@longchau.com.vn",
          manager_name: "Nguyen Van Nam",
          status: "active",
          opening_hours: "7:00 AM - 10:00 PM",
          established_date: "2020-01-15",
          notes: "Main flagship store in the city center",
          total_products: 1250,
          staff_count: 15
        },
        {
          id: 2,
          name: "Long Chau - District 3",
          address: "456 Vo Van Tan Street, District 3, Ho Chi Minh City",
          phone: "+84-28-3822-5678",
          email: "district3@longchau.com.vn",
          manager_name: "Tran Thi Mai",
          status: "active",
          opening_hours: "6:30 AM - 11:00 PM",
          established_date: "2020-06-20",
          notes: "24/7 emergency pharmacy services available",
          total_products: 980,
          staff_count: 12
        },
        {
          id: 3,
          name: "Long Chau - Tan Binh",
          address: "789 Cong Hoa Street, Tan Binh District, Ho Chi Minh City",
          phone: "+84-28-3822-9012",
          email: "tanbinh@longchau.com.vn",
          manager_name: "Le Van Duc",
          status: "maintenance",
          opening_hours: "8:00 AM - 9:00 PM",
          established_date: "2021-03-10",
          notes: "Currently undergoing renovation - reopening next month",
          total_products: 750,
          staff_count: 8
        },
        {
          id: 4,
          name: "Long Chau - Thu Duc",
          address: "321 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City",
          phone: "+84-28-3822-3456",
          email: "thuduc@longchau.com.vn",
          manager_name: "Pham Thi Lan",
          status: "active",
          opening_hours: "7:30 AM - 10:30 PM",
          established_date: "2021-11-05",
          notes: "Newest branch with modern facilities",
          total_products: 1100,
          staff_count: 14
        }
      ] as Branch[]
    },
  })

  const createStore = useMutation({
    mutationFn: (data: typeof formData) => {
      // Replace with actual API call
      return Promise.resolve({ 
        ...data, 
        id: Date.now(), 
        established_date: new Date().toISOString().split('T')[0],
        total_products: 0,
        staff_count: 0
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const updateStore = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof formData) => {
      // Replace with actual API call
      return Promise.resolve({ id, ...data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
      setEditingStore(null)
      resetForm()
    },
  })

  const deleteStore = useMutation({
    mutationFn: (id: number) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    },
  })

  const updateStoreStatus = useMutation({
    mutationFn: ({ id, status }: { id: number, status: Branch["status"] }) => {
      // Replace with actual API call
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      manager_name: "",
      status: "active",
      opening_hours: "",
      notes: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStore) {
      updateStore.mutate({ id: editingStore.id, ...formData })
    } else {
      createStore.mutate(formData)
    }
  }

  const handleEdit = (store: Branch) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
      manager_name: store.manager_name,
      status: store.status,
      opening_hours: store.opening_hours,
      notes: store.notes || ""
    })
    setShowDialog(true)
  }

  const filteredStores = stores.filter((store: Branch) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || store.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeStores = stores.filter(s => s.status === "active")
  const inactiveStores = stores.filter(s => s.status === "inactive")
  const maintenanceStores = stores.filter(s => s.status === "maintenance")
  const totalProducts = stores.reduce((sum, s) => sum + (s.total_products || 0), 0)

  const getStatusIcon = (status: Branch["status"]) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3" />
      case "inactive": return <XCircle className="h-3 w-3" />
      case "maintenance": return <Clock className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status: Branch["status"]) => {
    switch (status) {
      case "active": return "default"
      case "inactive": return "destructive"
      case "maintenance": return "secondary"
      default: return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">
            Manage Long Chau pharmacy branches and locations
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceStores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
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
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stores Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Info</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {store.address}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Est. {new Date(store.established_date).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {store.phone}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {store.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{store.manager_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(store.status)}>
                    {getStatusIcon(store.status)}
                    <span className="ml-1">{store.status.charAt(0).toUpperCase() + store.status.slice(1)}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{store.opening_hours}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{store.total_products || 0} products</div>
                    <div className="text-muted-foreground">{store.staff_count || 0} staff</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(store)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Select
                      value={store.status}
                      onValueChange={(status: Branch["status"]) => 
                        updateStoreStatus.mutate({ id: store.id, status })
                      }
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteStore.mutate(store.id)}
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

      {/* Add/Edit Store Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Long Chau - District Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "active" | "inactive" | "maintenance") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Street address, District, City"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+84-28-3822-xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="store@longchau.com.vn"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_name">Manager Name</Label>
                <Input
                  id="manager_name"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  required
                  placeholder="Full name of store manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  required
                  placeholder="7:00 AM - 10:00 PM"
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
                placeholder="Any special notes about this store..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingStore(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStore.isPending || updateStore.isPending}>
                {editingStore ? 'Update' : 'Create'} Store
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stores found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first store"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          )}
        </div>
      )}
    </div>
  )
}