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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { Report } from "@/lib/types"

export default function ReportsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("generate")
  const [formData, setFormData] = useState({
    report_type: "sales" as "sales" | "staff_performance" | "inventory",
    date_from: "",
    date_to: "",
    branch_id: "",
    staff_id: "",
    product_category: ""
  })

  const queryClient = useQueryClient()

  // Mock data using /reports/ endpoint structure
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      // Simulate API call to /reports/ endpoint
      return [
        {
          id: 1,
          report_type: "sales",
          generated_date: "2024-01-15T10:30:00Z",
          parameters: {
            date_from: "2024-01-01",
            date_to: "2024-01-31",
            branch_id: 1
          },
          data: {
            total_sales: 15420.50,
            total_orders: 245,
            avg_order_value: 62.94,
            top_products: ["Paracetamol", "Vitamin D", "Antibiotics"]
          }
        },
        {
          id: 2,
          report_type: "staff_performance", 
          generated_date: "2024-01-14T14:15:00Z",
          parameters: {
            date_from: "2024-01-01",
            date_to: "2024-01-31",
            staff_roles: ["pharmacist", "technician"]
          },
          data: {
            total_staff: 12,
            performance_scores: {
              "Dr. Sarah Wilson": 95,
              "Mike Johnson": 88,
              "Lisa Davis": 92
            }
          }
        },
        {
          id: 3,
          report_type: "inventory",
          generated_date: "2024-01-16T09:45:00Z", 
          parameters: {
            low_stock_threshold: 10,
            product_categories: ["medicines", "supplements"]
          },
          data: {
            total_products: 156,
            low_stock_items: 8,
            out_of_stock_items: 2,
            total_value: 45600.75
          }
        }
      ] as Report[]
    },
  })

  // Mock chart data
  const salesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales',
      data: [12000, 15000, 18000, 16000, 20000, 25000]
    }]
  }

  const topProductsData = [
    { name: 'Paracetamol 500mg', sales: 1250, revenue: 7495.50 },
    { name: 'Vitamin D3', sales: 890, revenue: 16020.00 },
    { name: 'Amoxicillin', sales: 645, revenue: 8062.50 },
    { name: 'Blood Pressure Monitor', sales: 234, revenue: 11700.00 },
    { name: 'Insulin', sales: 178, revenue: 8544.60 }
  ]

  const staffPerformanceData = [
    { name: 'Dr. Sarah Wilson', role: 'Pharmacist', orders: 145, score: 95, revenue: 12450.30 },
    { name: 'Mike Johnson', role: 'Technician', orders: 89, score: 88, revenue: 6890.20 },
    { name: 'Lisa Davis', role: 'Pharmacist', orders: 123, score: 92, revenue: 11230.50 },
    { name: 'John Smith', role: 'Cashier', orders: 67, score: 85, revenue: 4567.80 }
  ]

  const generateReport = useMutation({
    mutationFn: (data: typeof formData) => {
      // API call to /reports/{report_type}/
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            ...data, 
            id: Date.now(), 
            generated_date: new Date().toISOString(),
            data: getMockReportData(data.report_type)
          })
        }, 2000) // Simulate API delay
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const deleteReport = useMutation({
    mutationFn: (id: number) => {
      // API call to /reports/{id}/
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
  })

  const getMockReportData = (type: string) => {
    switch(type) {
      case 'sales':
        return {
          total_sales: Math.floor(Math.random() * 50000) + 10000,
          total_orders: Math.floor(Math.random() * 500) + 100,
          avg_order_value: Math.floor(Math.random() * 100) + 30
        }
      case 'staff_performance':
        return {
          total_staff: Math.floor(Math.random() * 20) + 5,
          avg_performance: Math.floor(Math.random() * 30) + 70
        }
      case 'inventory':
        return {
          total_products: Math.floor(Math.random() * 200) + 100,
          low_stock_items: Math.floor(Math.random() * 20) + 5,
          total_value: Math.floor(Math.random() * 100000) + 20000
        }
      default:
        return {}
    }
  }

  const resetForm = () => {
    setFormData({
      report_type: "sales",
      date_from: "",
      date_to: "",
      branch_id: "",
      staff_id: "",
      product_category: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateReport.mutate(formData)
  }

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch = report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toString().includes(searchTerm)
    const matchesType = typeFilter === "all" || report.report_type === typeFilter
    return matchesSearch && matchesType
  })

  const salesReports = reports.filter(r => r.report_type === "sales")
  const staffReports = reports.filter(r => r.report_type === "staff_performance")
  const inventoryReports = reports.filter(r => r.report_type === "inventory")

  const getReportIcon = (type: string) => {
    switch (type) {
      case "sales": return <DollarSign className="h-4 w-4" />
      case "staff_performance": return <Users className="h-4 w-4" />
      case "inventory": return <Package className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "sales": return "Sales Report"
      case "staff_performance": return "Staff Performance"
      case "inventory": return "Inventory Report"
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and manage pharmacy reports using unified data
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Reports</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{salesReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Reports</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{staffReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Reports</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{inventoryReports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({ ...formData, report_type: "sales" })
              setShowDialog(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Sales Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive sales analytics including revenue, orders, and product performance.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({ ...formData, report_type: "staff_performance" })
              setShowDialog(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Staff Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyze staff performance metrics, productivity, and efficiency using RBAC data.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({ ...formData, report_type: "inventory" })
              setShowDialog(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Inventory Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track inventory levels, stock movements, and identify low-stock items.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Dashboard Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            {/* Sales Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sales Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Top Products</h4>
                    <div className="space-y-2">
                      {topProductsData.map((product, index) => (
                        <div key={product.name} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.sales} units sold</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">${product.revenue.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Revenue Trends</h4>
                    <div className="h-40 bg-muted rounded flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Staff Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders Processed</TableHead>
                      <TableHead>Performance Score</TableHead>
                      <TableHead>Revenue Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerformanceData.map((staff) => (
                      <TableRow key={staff.name}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff.role}</Badge>
                        </TableCell>
                        <TableCell>{staff.orders}</TableCell>
                        <TableCell>
                          <div className={`font-medium ${staff.score >= 90 ? 'text-green-600' : staff.score >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {staff.score}%
                          </div>
                        </TableCell>
                        <TableCell>${staff.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
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
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="staff_performance">Staff Performance</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reports Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getReportIcon(report.report_type)}
                          <div>
                            <div className="font-medium">Report #{report.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {getReportTypeLabel(report.report_type)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.report_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.generated_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(report.generated_date).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.parameters.date_from && report.parameters.date_to && (
                            <div>{report.parameters.date_from} to {report.parameters.date_to}</div>
                          )}
                          {report.parameters.branch_id && (
                            <div className="text-muted-foreground">Branch: {report.parameters.branch_id}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Download report"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteReport.mutate(report.id)}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate {getReportTypeLabel(formData.report_type)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type</Label>
                <Select 
                  value={formData.report_type} 
                  onValueChange={(value: "sales" | "staff_performance" | "inventory") => 
                    setFormData({ ...formData, report_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="staff_performance">Staff Performance</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch (Optional)</Label>
                <Select 
                  value={formData.branch_id} 
                  onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    <SelectItem value="1">Main Branch</SelectItem>
                    <SelectItem value="2">Downtown Branch</SelectItem>
                    <SelectItem value="3">Mall Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={formData.date_from}
                  onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={formData.date_to}
                  onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                  required
                />
              </div>
            </div>

            {formData.report_type === "staff_performance" && (
              <div className="space-y-2">
                <Label htmlFor="staff_id">Specific Staff (Optional)</Label>
                <Select 
                  value={formData.staff_id} 
                  onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All staff members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Staff</SelectItem>
                    <SelectItem value="1">Dr. Sarah Wilson</SelectItem>
                    <SelectItem value="2">Mike Johnson</SelectItem>
                    <SelectItem value="3">Lisa Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.report_type === "inventory" && (
              <div className="space-y-2">
                <Label htmlFor="product_category">Product Category (Optional)</Label>
                <Select 
                  value={formData.product_category} 
                  onValueChange={(value) => setFormData({ ...formData, product_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="medicines">Medicines</SelectItem>
                    <SelectItem value="supplements">Supplements</SelectItem>
                    <SelectItem value="devices">Medical Devices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generateReport.isPending}>
                {generateReport.isPending ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredReports.length === 0 && activeTab === "history" && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || typeFilter !== "all" ? "Try adjusting your search terms" : "Get started by generating your first report"}
          </p>
          {!searchTerm && typeFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
        </div>
      )}
    </div>
  )
}