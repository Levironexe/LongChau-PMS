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
  Award, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Crown,
  Gift
} from "lucide-react"
import { LoyaltyPoints } from "@/lib/types"

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string 
  role: "customer" | "vip_customer"
  total_points?: number
}

export default function LoyaltyPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingPoints, setEditingPoints] = useState<LoyaltyPoints | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    user_id: "",
    points: "",
    transaction_type: "earned" as "earned" | "redeemed",
    description: ""
  })

  const queryClient = useQueryClient()

  // Mock data using /loyalty-points/ endpoint structure
  const { data: loyaltyPoints = [] } = useQuery({
    queryKey: ["loyalty-points"],
    queryFn: async () => {
      // Simulate API call to /loyalty-points/ endpoint
      return [
        {
          id: 1,
          user: 1,
          user_name: "John Doe",
          user_email: "john.doe@email.com",
          points: 50,
          earned_date: "2024-01-15T10:30:00Z",
          transaction_type: "earned",
          description: "Purchase reward - Order #123"
        },
        {
          id: 2,
          user: 1,
          user_name: "John Doe", 
          user_email: "john.doe@email.com",
          points: -20,
          earned_date: "2024-01-16T14:15:00Z",
          transaction_type: "redeemed",
          description: "Discount applied - Order #124"
        },
        {
          id: 3,
          user: 2,
          user_name: "Jane Smith",
          user_email: "jane.smith@email.com", 
          points: 25,
          earned_date: "2024-01-17T09:45:00Z",
          transaction_type: "earned",
          description: "VIP bonus points"
        },
        {
          id: 4,
          user: 3,
          user_name: "Robert Johnson",
          user_email: "robert.j@email.com",
          points: 75,
          earned_date: "2024-01-18T16:20:00Z", 
          transaction_type: "earned",
          description: "Prescription fill bonus"
        }
      ] as (LoyaltyPoints & { user_name: string, user_email: string })[]
    },
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      // Mock customers data - filtered to only show customers
      return [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe", 
          email: "john.doe@email.com",
          role: "vip_customer",
          total_points: 230
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@email.com", 
          role: "customer",
          total_points: 62
        },
        {
          id: 3,
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.j@email.com",
          role: "vip_customer", 
          total_points: 445
        }
      ] as Customer[]
    },
  })

  const awardPoints = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /loyalty-points/
      const customer = customers.find(c => c.id === parseInt(data.user_id))
      return Promise.resolve({ 
        ...data, 
        id: Date.now(),
        user: parseInt(data.user_id),
        user_name: customer ? `${customer.first_name} ${customer.last_name}` : "",
        user_email: customer?.email || "",
        points: data.transaction_type === "redeemed" ? -parseInt(data.points) : parseInt(data.points),
        earned_date: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const updatePoints = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof formData) => {
      // API call to /loyalty-points/{id}/
      return Promise.resolve({ id, ...data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] })
      setEditingPoints(null)
      resetForm()
    },
  })

  const deletePoints = useMutation({
    mutationFn: (id: number) => {
      // API call to /loyalty-points/{id}/
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] })
    },
  })

  const resetForm = () => {
    setFormData({
      user_id: "",
      points: "",
      transaction_type: "earned",
      description: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPoints) {
      updatePoints.mutate({ id: editingPoints.id, ...formData })
    } else {
      awardPoints.mutate(formData)
    }
  }

  const handleEdit = (points: any) => {
    setEditingPoints(points)
    setFormData({
      user_id: points.user.toString(),
      points: Math.abs(points.points).toString(),
      transaction_type: points.transaction_type,
      description: points.description || ""
    })
    setShowDialog(true)
  }

  const filteredPoints = loyaltyPoints.filter((points: any) => {
    const matchesSearch = points.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         points.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         points.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || points.transaction_type === typeFilter
    return matchesSearch && matchesType
  })

  const totalPointsEarned = loyaltyPoints.filter(p => p.transaction_type === "earned").reduce((sum, p) => sum + Math.abs(p.points), 0)
  const totalPointsRedeemed = loyaltyPoints.filter(p => p.transaction_type === "redeemed").reduce((sum, p) => sum + Math.abs(p.points), 0)
  const earnedTransactions = loyaltyPoints.filter(p => p.transaction_type === "earned")
  const redeemedTransactions = loyaltyPoints.filter(p => p.transaction_type === "redeemed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loyalty Points Management</h1>
          <p className="text-muted-foreground">
            Award and manage customer loyalty points and rewards
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Award Points
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPointsEarned.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalPointsRedeemed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned Transactions</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{earnedTransactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{redeemedTransactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Points Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {customer.first_name} {customer.last_name}
                        {customer.role === "vip_customer" && <Crown className="h-3 w-3 text-yellow-600" />}
                      </div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      <Award className="h-4 w-4 mr-1" />
                      {customer.total_points || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
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
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="earned">Earned</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Points Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPoints.map((points: any) => (
              <TableRow key={points.id}>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {points.user_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{points.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`font-bold ${points.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {points.points > 0 ? '+' : ''}{points.points}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={points.transaction_type === 'earned' ? 'default' : 'secondary'}>
                    {points.transaction_type === 'earned' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {points.transaction_type === 'redeemed' && <TrendingDown className="h-3 w-3 mr-1" />}
                    {points.transaction_type.charAt(0).toUpperCase() + points.transaction_type.slice(1)}
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
                  <div className="text-sm">{points.description}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(points)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deletePoints.mutate(points.id)}
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

      {/* Award/Edit Points Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPoints ? 'Edit Points Transaction' : 'Award Loyalty Points'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">Customer</Label>
                <Select 
                  value={formData.user_id} 
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center gap-2">
                          {customer.first_name} {customer.last_name}
                          {customer.role === "vip_customer" && <Crown className="h-3 w-3 text-yellow-600" />}
                          <span className="text-muted-foreground">({customer.total_points || 0} pts)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Transaction Type</Label>
                <Select 
                  value={formData.transaction_type} 
                  onValueChange={(value: "earned" | "redeemed") => 
                    setFormData({ ...formData, transaction_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earned">Earned Points</SelectItem>
                    <SelectItem value="redeemed">Redeemed Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="Enter number of points..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the reason for this points transaction..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingPoints(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={awardPoints.isPending || updatePoints.isPending}>
                {editingPoints ? 'Update' : 'Award'} Points
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredPoints.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No point transactions found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || typeFilter !== "all" ? "Try adjusting your search terms" : "Get started by awarding points to customers"}
          </p>
          {!searchTerm && typeFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Award Points
            </Button>
          )}
        </div>
      )}
    </div>
  )
}