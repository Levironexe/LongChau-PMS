"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Warehouse, 
  Package,
  Truck,
  Settings,
  Calendar,
  Building2
} from "lucide-react"

export default function WarehousePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Central warehouse operations and distribution management
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Warehouse className="h-24 w-24 text-blue-600" />
            <div className="absolute -top-2 -right-2">
              <div className="h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Settings className="h-3 w-3 text-white animate-spin" />
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Warehouse Features Coming Soon</h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          We're building comprehensive warehouse management tools to streamline your operations and improve efficiency across all Long Chau locations.
        </p>

        {/* Feature Preview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Inventory Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced inventory tracking, automated reorder points, and real-time stock monitoring across all warehouse locations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                Distribution Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Optimize delivery routes, track shipments, and manage distribution to branch locations efficiently.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Multi-Warehouse Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage multiple warehouse facilities, transfer stock between locations, and coordinate operations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Scheduled Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automate routine tasks, schedule deliveries, and plan warehouse operations with advanced scheduling.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-600" />
                Quality Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Implement quality checks, expiry date monitoring, and compliance tracking for pharmaceutical products.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Warehouse className="h-5 w-5" />
                And Much More...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600">
                Comprehensive reporting, analytics, integration with existing systems, and mobile warehouse management.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-6">
            These features are in active development. For now, you can manage inventory through the Branch system and track stock levels via the Inventory page.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="/branches">Manage Branches</a>
            </Button>
            <Button asChild>
              <a href="/inventory">View Inventory</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}