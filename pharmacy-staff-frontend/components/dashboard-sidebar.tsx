"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  Pill,
  UserCog,
  Store,
  FileText,
  Truck,
  Award,
  Crown,
  Factory
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Warehouse,
    badge: "3", // Low stock alerts
  },
  {
    title: "Warehouse",
    href: "/warehouse",
    icon: Warehouse,
    badge: "2", // Pending requests
  },
  {
    title: "Stores",
    href: "/stores",
    icon: Store,
  },
  // UNIFIED USER MANAGEMENT (RBAC)
  {
    title: "Users",
    href: "/users",
    icon: Users,
    badge: "NEW", // Unified users endpoint
  },
  // Legacy pages (kept for backward compatibility)
  {
    title: "Customers (Legacy)",
    href: "/customers",
    icon: Crown,
  },
  {
    title: "Staff (Legacy)",
    href: "/staff",
    icon: UserCog,
  },
  // UNIFIED ORDER SYSTEM
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    badge: "UPD", // Updated with order types
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: FileText,
  },
  // NEW UNIFIED DELIVERY SYSTEM
  {
    title: "Deliveries",
    href: "/deliveries",
    icon: Truck,
    badge: "NEW",
  },
  // NEW LOYALTY POINTS SYSTEM
  {
    title: "Loyalty Points",
    href: "/loyalty",
    icon: Award,
    badge: "NEW",
  },
  // NEW REPORTS SYSTEM
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    badge: "NEW",
  },
  // Legacy analytics
  {
    title: "Analytics (Legacy)",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col border-r bg-white", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Long Chau</h2>
            <p className="text-xs text-muted-foreground">Pharmacy Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-11">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@longchau.com</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <DashboardSidebar />
      </SheetContent>
    </Sheet>
  )
}