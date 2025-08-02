"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { useOrders } from "@/hooks/api/useOrders"
import { useUsers } from "@/hooks/api/useUsers"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  UserCog,
  BarChart3
} from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { OrdersChart } from "@/components/charts/OrdersChart"
import { InventoryStatusChart } from "@/components/charts/InventoryStatusChart"
import { useMemo } from "react"

export default function HomePage() {
  // Mock products data for dashboard - replace with actual products API when available
  const products = useMemo(() => [
    { id: 1, name: "Paracetamol 500mg", stock: 150, low_stock_threshold: 50 },
    { id: 2, name: "Ibuprofen 400mg", stock: 120, low_stock_threshold: 30 },
    { id: 3, name: "Amoxicillin 500mg", stock: 80, low_stock_threshold: 25 }
  ], [])

  const { data: allUsers = [] } = useUsers()
  const customers = allUsers.filter(user => ['customer', 'vip_customer'].includes(user.role))

  const { data: orders = [] } = useOrders()

  // Mock low stock data for dashboard - replace with actual inventory API when available  
  const lowStock = products.filter(product => product.stock < product.low_stock_threshold)

  const todayOrders = orders.filter(
    (order: any) => new Date(order.order_date).toDateString() === new Date().toDateString(),
  )

  const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0)

  // Generate chart data based on real orders data
  const revenueData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date
    }).reverse()
    
    return last7Days.map(date => {
      const dayOrders = orders.filter((order: any) => 
        new Date(order.order_date).toDateString() === date.toDateString()
      )
      const dayRevenue = dayOrders.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total_amount || 0), 0
      )
      
      return {
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      }
    })
  }, [orders])

  const ordersData = useMemo(() => {
    const orderTypes = ['prescription', 'in_store', 'online']
    return orderTypes.map(type => ({
      date: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      orders: orders.filter((order: any) => order.order_type === type).length,
      type
    }))
  }, [orders])

  const inventoryData = useMemo(() => {
    const inStock = products.filter(p => p.stock >= p.low_stock_threshold).length
    const lowStockCount = lowStock.length
    const outOfStock = 0 // No out of stock products in current data
    
    return [
      { status: 'In Stock', count: inStock, color: '#10b981' },
      { status: 'Low Stock', count: lowStockCount, color: '#f59e0b' },
      { status: 'Out of Stock', count: outOfStock, color: '#ef4444' }
    ].filter(item => item.count > 0)
  }, [products, lowStock])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your pharmacy today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/orders">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₫{todayRevenue.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 inline mr-1" />
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStock.length}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 inline mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Charts and Analytics */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="space-y-4">
                <div className="h-[200px]">
                  <RevenueChart data={revenueData} />
                </div>
              </TabsContent>
              <TabsContent value="orders" className="space-y-4">
                <div className="h-[200px]">
                  <OrdersChart data={ordersData} />
                </div>
              </TabsContent>
              <TabsContent value="inventory" className="space-y-4">
                <div className="h-[200px]">
                  <InventoryStatusChart data={inventoryData} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 6).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name || 'Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">₫{parseFloat(order.total_amount).toLocaleString('vi-VN')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Low Stock */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/products">
                  <Package className="h-4 w-4 mr-3" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/inventory">
                  <Activity className="h-4 w-4 mr-3" />
                  Check Inventory
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/customers">
                  <Users className="h-4 w-4 mr-3" />
                  Manage Customers
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/staff">
                  <UserCog className="h-4 w-4 mr-3" />
                  Manage Staff
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/orders">
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Order
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Items</CardTitle>
            <Badge variant={lowStock.length > 0 ? "destructive" : "secondary"}>
              {lowStock.length} items
            </Badge>
          </CardHeader>
          <CardContent>
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={(item.stock_level / 50) * 100} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {item.stock_level} left
                        </span>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Low
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/inventory">View All</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All items are well stocked!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}