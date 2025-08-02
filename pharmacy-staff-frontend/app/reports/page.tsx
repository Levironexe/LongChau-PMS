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
import { Report, CreateReportRequest } from "@/lib/types"
import { useReports, useGenerateReport, useDeleteReport } from "@/hooks/api/useReports"
import { useBranches } from "@/hooks/api/useBranches"
import { useUsers } from "@/hooks/api/useUsers"
import { TopProductsChart } from "@/components/charts/TopProductsChart"
import { StaffPerformanceChart } from "@/components/charts/StaffPerformanceChart"

export default function ReportsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("generate")
  const [formData, setFormData] = useState({
    report_name: "",
    report_type: "sales" as "sales" | "staff_performance" | "inventory" | "prescription",
    start_date: "",
    end_date: "",
    branch: 1,
    generated_by: 1
  })

  const queryClient = useQueryClient()

  // Use real API hooks
  const { data: reportsResponse, isLoading: reportsLoading, error: reportsError } = useReports()
  const { data: branches = [] } = useBranches()
  const { data: users = [] } = useUsers({ role: "pharmacist" })
  
  const reports = reportsResponse?.results || []

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

  const generateReportMutation = useGenerateReport()
  const deleteReportMutation = useDeleteReport()


  const resetForm = () => {
    setFormData({
      report_name: "",
      report_type: "sales",
      start_date: "",
      end_date: "",
      branch: branches.length > 0 ? branches[0].id : 1,
      generated_by: users.length > 0 ? users[0].id : 1
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.report_name.trim()) {
      alert("Please enter a report name")
      return
    }
    generateReportMutation.mutate(formData)
  }

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch = report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toString().includes(searchTerm) ||
                         report.report_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                            <div className="font-medium text-sm">₫{product.revenue.toLocaleString('vi-VN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Top Products Performance</h4>
                    <div className="h-40">
                      <TopProductsChart data={topProductsData} />
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
                        <TableCell>₫{staff.revenue.toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Performance Overview</h4>
                  <div className="h-[200px]">
                    <StaffPerformanceChart data={staffPerformanceData} />
                  </div>
                </div>
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
                          {new Date(report.generated_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(report.generated_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{report.start_date} to {report.end_date}</div>
                          <div className="text-muted-foreground">Branch: {report.branch_name}</div>
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
                            onClick={() => deleteReportMutation.mutate(report.id)}
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
                  onValueChange={(value: "sales" | "staff_performance" | "inventory" | "prescription") => 
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
                    <SelectItem value="prescription">Prescription Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select 
                  value={formData.branch.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, branch: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_name">Report Name</Label>
                <Input
                  id="report_name"
                  type="text"
                  value={formData.report_name}
                  onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
                  placeholder="Enter report name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generated_by">Generated By</Label>
                <Select value={formData.generated_by.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, generated_by: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">From Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">To Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>


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
              <Button type="submit" disabled={generateReportMutation.isPending}>
                {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
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