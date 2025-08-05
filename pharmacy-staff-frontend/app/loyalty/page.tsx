"use client"

import { useState } from "react"
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
  Award, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  Crown,
  Gift,
  AlertCircle,
  Loader2
} from "lucide-react"
import { 
  useLoyaltyPoints, 
  useAwardPoints, 
  useUpdatePoints, 
  useDeletePoints,
  useLoyaltyPointsStats
} from "@/hooks/api/useLoyaltyPoints"
import { useUsers } from "@/hooks/api/useUsers"
import { LoyaltyPoints } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function LoyaltyPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingPoints, setEditingPoints] = useState<LoyaltyPoints | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    customer: "",
    points: "",
    expiry_date: "",
    transaction_reference: ""
  })

  // API Hooks
  const { data: loyaltyPointsResponse, isLoading: isLoadingPoints, error: pointsError } = useLoyaltyPoints({
    search: searchTerm || undefined,
    is_expired: statusFilter === "expired" ? true : statusFilter === "active" ? false : undefined,
  })

  const { data: customersResponse, isLoading: isLoadingCustomers } = useUsers({
    role: "customer,vip_customer" // Get both regular and VIP customers
  })

  const { data: stats } = useLoyaltyPointsStats()

  const awardPointsMutation = useAwardPoints()
  const updatePointsMutation = useUpdatePoints()
  const deletePointsMutation = useDeletePoints()

  // Extract data from API responses
  const loyaltyPoints = loyaltyPointsResponse?.results || []
  const customers = customersResponse || []

  // Filter points based on search and status
  const filteredPoints = loyaltyPoints.filter((points) => {
    const matchesSearch = !searchTerm || 
      points.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      points.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "expired" && points.is_expired) ||
      (statusFilter === "active" && !points.is_expired)
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer || !formData.points || !formData.expiry_date || !formData.transaction_reference) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      })
      return
    }

    const pointsValue = parseInt(formData.points)
    if (isNaN(pointsValue) || pointsValue <= 0) {
      toast({ 
        title: "Error", 
        description: "Points must be a positive number",
        variant: "destructive" 
      })
      return
    }

    try {
      if (editingPoints) {
        await updatePointsMutation.mutateAsync({
          id: editingPoints.id,
          customer: parseInt(formData.customer),
          points: pointsValue,
          expiry_date: formData.expiry_date,
          transaction_reference: formData.transaction_reference
        })
        toast({ title: "Success", description: "Loyalty points updated successfully" })
      } else {
        await awardPointsMutation.mutateAsync({
          customer: parseInt(formData.customer),
          points: pointsValue,
          expiry_date: formData.expiry_date,
          transaction_reference: formData.transaction_reference
        })
        toast({ title: "Success", description: "Loyalty points awarded successfully" })
      }
      
      setShowDialog(false)
      setEditingPoints(null)
      setFormData({
        customer: "",
        points: "",
        expiry_date: "",
        transaction_reference: ""
      })
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to save loyalty points",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = (points: LoyaltyPoints) => {
    setEditingPoints(points)
    setFormData({
      customer: points.customer.toString(),
      points: points.points.toString(),
      expiry_date: points.expiry_date,
      transaction_reference: points.transaction_reference
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this loyalty points record?")) {
      try {
        await deletePointsMutation.mutateAsync(id)
        toast({ title: "Success", description: "Loyalty points record deleted successfully" })
      } catch (error: any) {
        toast({ 
          title: "Error", 
          description: error?.message || "Failed to delete loyalty points record",
          variant: "destructive" 
        })
      }
    }
  }

  const openAddDialog = () => {
    setEditingPoints(null)
    setFormData({
      customer: "",
      points: "",
      expiry_date: "",
      transaction_reference: ""
    })
    setShowDialog(true)
  }

  if (pointsError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load loyalty points</h3>
              <p className="text-muted-foreground">{pointsError?.message || "Please try again later"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Points Management</h1>
          <p className="text-muted-foreground">Manage customer loyalty points and rewards</p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Award Points
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Point Records</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoints ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalRecords || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Awarded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoints ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalPoints || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoints ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.activeCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Non-expired records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Points</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoints ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.expiredCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expired records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Points Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCustomers ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {stats?.customerSummary?.slice(0, 6).map((customer: any) => (
                <Card key={customer.customer_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {customer.customer_name}
                          {customer.has_expired && <AlertCircle className="h-3 w-3 text-yellow-600" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.records_count} records
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        <Award className="h-4 w-4 mr-1" />
                        {customer.total_points}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer or transaction reference..."
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
              <SelectItem value="all">All Points</SelectItem>
              <SelectItem value="active">Active Points</SelectItem>
              <SelectItem value="expired">Expired Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Points Records Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Earned Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Transaction Reference</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingPoints ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredPoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-6 text-muted-foreground">
                  No loyalty points records found
                </TableCell>
              </TableRow>
            ) : (
              filteredPoints.map((points) => (
                <TableRow key={points.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {points.customer_name}
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {points.customer}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-green-600">
                      +{points.points}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={points.is_expired ? "destructive" : "default"}>
                      {points.is_expired ? (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Active
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(points.earned_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(points.earned_date).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(points.expiry_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">
                      {points.transaction_reference}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(points)}
                        disabled={updatePointsMutation.isPending}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(points.id)}
                        disabled={deletePointsMutation.isPending}
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

      {/* Award/Edit Points Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPoints ? "Edit Loyalty Points" : "Award Loyalty Points"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customer}
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer: value }))}
                disabled={!!editingPoints}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter(customer => customer.role === "customer" || customer.role === "vip_customer")
                    .map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center gap-2">
                          {customer.first_name} {customer.last_name}
                          {customer.role === "vip_customer" && <Crown className="h-3 w-3 text-yellow-600" />}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                placeholder="Enter points to award"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_reference">Transaction Reference *</Label>
              <Input
                id="transaction_reference"
                value={formData.transaction_reference}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_reference: e.target.value }))}
                placeholder="e.g., ORD-2025-001, PROMO-VIP-AUG"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={awardPointsMutation.isPending || updatePointsMutation.isPending}
              >
                {(awardPointsMutation.isPending || updatePointsMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingPoints ? "Update Points" : "Award Points"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}