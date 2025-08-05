"use client"

import { useState } from "react"
import { 
  useBranches, 
  useCreateBranch, 
  useUpdateBranch, 
  useDeleteBranch, 
  useBranchStats,
  useBranch,
  useBranchStaffSummary,
  useBranchConfigs,
  useCreateBranchConfig,
  useUpdateBranchConfig,
  useDeleteBranchConfig
} from "@/hooks/api/useBranches"
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
  Building,
  Settings,
  Eye,
  UserCheck,
  Package,
  DollarSign
} from "lucide-react"
import { Branch, BranchConfig } from "@/lib/types"

export default function BranchesPage() {
  const [showBranchDialog, setShowBranchDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [editingConfig, setEditingConfig] = useState<BranchConfig | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [branchFormData, setBranchFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager_name: "",
    status: "active" as "active" | "inactive" | "maintenance",
    opening_hours: "",
    notes: ""
  })
  const [configFormData, setConfigFormData] = useState({
    branch: 0,
    setting_name: "",
    setting_value: "",
    setting_type: "string" as "string" | "number" | "boolean"
  })

  // API data - integrated with real endpoints
  const { data: branches = [], isLoading: branchesLoading, error: branchesError } = useBranches({ 
    search: searchTerm, 
    status: statusFilter === "all" ? undefined : statusFilter 
  })
  const { totalBranches, activeBranches, maintenanceBranches, totalProducts, totalStaff } = useBranchStats()
  const { data: branchConfigs = [] } = useBranchConfigs()

  // Branch detail data
  const { data: branchDetail } = useBranch(selectedBranch?.id || 0)
  const { data: staffSummary } = useBranchStaffSummary(selectedBranch?.id || 0)

  // Branch mutations
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const deleteBranch = useDeleteBranch()

  // Configuration mutations
  const createConfig = useCreateBranchConfig()
  const updateConfig = useUpdateBranchConfig()
  const deleteConfig = useDeleteBranchConfig()

  const resetBranchForm = () => {
    setBranchFormData({
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

  const resetConfigForm = () => {
    setConfigFormData({
      branch: 0,
      setting_name: "",
      setting_value: "",
      setting_type: "string"
    })
  }

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBranch) {
      updateBranch.mutate({ id: editingBranch.id, ...branchFormData })
    } else {
      createBranch.mutate(branchFormData)
    }
  }

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let processedValue: string | number | boolean = configFormData.setting_value

    // Convert value based on type
    if (configFormData.setting_type === "number") {
      processedValue = parseFloat(configFormData.setting_value as string)
    } else if (configFormData.setting_type === "boolean") {
      processedValue = String(configFormData.setting_value) === "true"
    }

    const configData = {
      branch: configFormData.branch,
      setting_name: configFormData.setting_name,
      setting_value: processedValue,
      setting_type: configFormData.setting_type
    }

    if (editingConfig) {
      updateConfig.mutate({ id: editingConfig.id, ...configData })
    } else {
      createConfig.mutate(configData)
    }
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setBranchFormData({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      manager_name: branch.manager_name || "",
      status: branch.status || "active",
      opening_hours: branch.opening_hours || "",
      notes: branch.notes || ""
    })
    setShowBranchDialog(true)
  }

  const handleEditConfig = (config: BranchConfig) => {
    setEditingConfig(config)
    setConfigFormData({
      branch: config.branch,
      setting_name: config.setting_name,
      setting_value: config.setting_value.toString(),
      setting_type: config.setting_type
    })
    setShowConfigDialog(true)
  }

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch)
    setShowDetailDialog(true)
  }

  // Handle mutation success callbacks
  if (createBranch.isSuccess && !createBranch.isPending) {
    setShowBranchDialog(false)
    resetBranchForm()
    createBranch.reset()
  }
  
  if (updateBranch.isSuccess && !updateBranch.isPending) {
    setEditingBranch(null)
    setShowBranchDialog(false)
    resetBranchForm()
    updateBranch.reset()
  }

  if (createConfig.isSuccess && !createConfig.isPending) {
    setShowConfigDialog(false)
    resetConfigForm()
    createConfig.reset()
  }
  
  if (updateConfig.isSuccess && !updateConfig.isPending) {
    setEditingConfig(null)
    setShowConfigDialog(false)
    resetConfigForm()
    updateConfig.reset()
  }

  const getStatusIcon = (status?: Branch["status"]) => {
    switch (status) {
      case "active": return <CheckCircle className="h-3 w-3" />
      case "inactive": return <XCircle className="h-3 w-3" />
      case "maintenance": return <Clock className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status?: Branch["status"]) => {
    switch (status) {
      case "active": return "default"
      case "inactive": return "destructive"
      case "maintenance": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage Long Chau pharmacy branches, configurations, and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { resetConfigForm(); setShowConfigDialog(true) }}>
            <Settings className="h-4 w-4 mr-2" />
            Add Config
          </Button>
          <Button onClick={() => { resetBranchForm(); setShowBranchDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBranches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeBranches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceBranches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStaff}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalProducts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="branches" className="w-full">
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
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
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {branchesError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">Error loading branches: {branchesError.message}</p>
            </div>
          )}

          {/* Branches Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading branches...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" ? "No branches match your filters" : "No branches found"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {branch.address}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Est. {branch.established_date ? new Date(branch.established_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {branch.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {branch.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{branch.manager_name || "Not assigned"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Hours: {branch.opening_hours || "Not set"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(branch.status)}>
                        {getStatusIcon(branch.status)}
                        <span className="ml-1">{branch.status ? branch.status.charAt(0).toUpperCase() + branch.status.slice(1) : 'Unknown'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {branch.total_products || 0} products
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <UserCheck className="h-3 w-3" />
                          {branch.staff_count || 0} staff
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(branch)}
                          title="View details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditBranch(branch)}
                          title="Edit branch"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteBranch.mutate(branch.id)}
                          disabled={deleteBranch.isPending}
                          title="Delete branch"
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
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          {/* Branch Configurations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Setting Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchConfigs.map((config) => {
                    const branch = branches.find(b => b.id === config.branch)
                    return (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div className="font-medium">{branch?.name || `Branch ${config.branch}`}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{config.setting_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {config.setting_type === "boolean" 
                              ? (config.setting_value ? "True" : "False")
                              : (config.setting_value?.toString() || "N/A")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {config.setting_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditConfig(config)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => deleteConfig.mutate(config.id)}
                              disabled={deleteConfig.isPending}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Branch Dialog */}
      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBranchSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  required
                  placeholder="Long Chau - District Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={branchFormData.status} 
                  onValueChange={(value: "active" | "inactive" | "maintenance") => 
                    setBranchFormData({ ...branchFormData, status: value })
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
                value={branchFormData.address}
                onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                required
                placeholder="Street address, District, City"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={branchFormData.phone}
                  onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                  required
                  placeholder="+84-28-3822-xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={branchFormData.email}
                  onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                  required
                  placeholder="branch@longchau.com.vn"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_name">Manager Name</Label>
                <Input
                  id="manager_name"
                  value={branchFormData.manager_name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, manager_name: e.target.value })}
                  placeholder="Full name of branch manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  value={branchFormData.opening_hours}
                  onChange={(e) => setBranchFormData({ ...branchFormData, opening_hours: e.target.value })}
                  placeholder="7:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={branchFormData.notes}
                onChange={(e) => setBranchFormData({ ...branchFormData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes about this branch..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBranchDialog(false)
                  setEditingBranch(null)
                  resetBranchForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBranch.isPending || updateBranch.isPending}>
                {createBranch.isPending || updateBranch.isPending ? (
                  editingBranch ? 'Updating...' : 'Creating...'
                ) : (
                  editingBranch ? 'Update Branch' : 'Create Branch'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Branch Configuration' : 'Add Branch Configuration'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="config-branch">Branch</Label>
              <Select 
                value={configFormData.branch.toString()} 
                onValueChange={(value) => setConfigFormData({ ...configFormData, branch: parseInt(value) })}
                disabled={!!editingConfig}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting-name">Setting Name</Label>
              <Input
                id="setting-name"
                value={configFormData.setting_name}
                onChange={(e) => setConfigFormData({ ...configFormData, setting_name: e.target.value })}
                required
                placeholder="e.g., max_customers_per_day, enable_delivery, tax_rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting-type">Setting Type</Label>
              <Select 
                value={configFormData.setting_type} 
                onValueChange={(value: "string" | "number" | "boolean") => 
                  setConfigFormData({ ...configFormData, setting_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting-value">Setting Value</Label>
              {configFormData.setting_type === "boolean" ? (
                <Select 
                  value={configFormData.setting_value.toString()} 
                  onValueChange={(value) => setConfigFormData({ ...configFormData, setting_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="setting-value"
                  type={configFormData.setting_type === "number" ? "number" : "text"}
                  value={configFormData.setting_value}
                  onChange={(e) => setConfigFormData({ ...configFormData, setting_value: e.target.value })}
                  required
                  placeholder={
                    configFormData.setting_type === "number" 
                      ? "Enter a number" 
                      : "Enter text value"
                  }
                  step={configFormData.setting_type === "number" ? "0.01" : undefined}
                />
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Configuration Examples</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>max_customers_per_day:</strong> number (100)</div>
                <div><strong>enable_home_delivery:</strong> boolean (true/false)</div>
                <div><strong>delivery_radius_km:</strong> number (5.5)</div>
                <div><strong>tax_rate:</strong> number (10.5)</div>
                <div><strong>currency:</strong> string (VND)</div>
                <div><strong>theme:</strong> string (light/dark)</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfigDialog(false)
                  setEditingConfig(null)
                  resetConfigForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createConfig.isPending || updateConfig.isPending}>
                {createConfig.isPending || updateConfig.isPending ? (
                  editingConfig ? 'Updating...' : 'Creating...'
                ) : (
                  editingConfig ? 'Update Configuration' : 'Create Configuration'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Branch Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Details - {selectedBranch?.name}</DialogTitle>
          </DialogHeader>
          {selectedBranch && (
            <div className="space-y-6">
              {/* Branch Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Branch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground">{selectedBranch.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Manager</Label>
                    <p className="text-sm text-muted-foreground">{selectedBranch.manager_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">{selectedBranch.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedBranch.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Opening Hours</Label>
                    <p className="text-sm text-muted-foreground">{selectedBranch.opening_hours || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={getStatusVariant(selectedBranch.status)}>
                      {getStatusIcon(selectedBranch.status)}
                      <span className="ml-1">{selectedBranch.status}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Summary */}
              {staffSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Staff Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(staffSummary).map(([role, count]) => (
                        <div key={role} className="text-center">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {role.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedBranch.total_products || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Staff Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedBranch.staff_count || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Established</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {selectedBranch.established_date ? new Date(selectedBranch.established_date).getFullYear() : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedBranch.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedBranch.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {!branchesLoading && branches.length === 0 && !branchesError && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No branches found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first branch"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => { resetBranchForm(); setShowBranchDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          )}
        </div>
      )}
    </div>
  )
}