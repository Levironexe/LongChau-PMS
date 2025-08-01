export interface Product {
  id: number
  name: string
  product_type: "medicine" | "supplement"
  price: string // Decimal as string
  requires_prescription: boolean
  created_at: string
  stock?: number // From backend calculation
}

export interface Inventory {
  id: number
  product: number // Product ID
  product_name?: string // From backend
  current_stock: number
  minimum_stock: number
  is_low_stock?: boolean // From backend calculation
  created_at: string
}

// Unified User interface (replaces separate Customer/Staff interfaces)
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: "customer" | "vip_customer" | "pharmacist" | "technician" | "manager" | "cashier" | "inventory_manager"
  status?: "active" | "inactive"
  address?: string
  date_of_birth?: string
  registration_date: string
  hire_date?: string
  notes?: string
  total_orders?: number
  total_spent?: number
  loyalty_points?: number
}

// Legacy Customer interface for backward compatibility
export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  customer_type: "regular" | "vip"
  created_at: string
}

export interface Order {
  id: number
  customer: number // Customer ID
  customer_name?: string // From backend
  total_amount: string // Decimal as string
  status: "pending" | "processing" | "completed" | "cancelled"
  order_type: "prescription" | "in_store" | "online"
  order_date: string
  items?: OrderItem[]
  available_transitions?: string[]
  payment_method?: "cash" | "card" | "insurance"
  notes?: string
}

export interface OrderItem {
  id: number
  order: number
  product: number
  product_name?: string
  quantity: number
  unit_price: string
}

export interface CreateOrderRequest {
  customer_id: number
  order_type: "prescription" | "in_store" | "online"
  payment_method?: "cash" | "card" | "insurance"
  items: {
    product_id: number
    quantity: number
  }[]
  notes?: string
}

// New interfaces for API changes
export interface LoyaltyPoints {
  id: number
  user: number
  points: number
  earned_date: string
  transaction_type: "earned" | "redeemed"
  description?: string
}

export interface Delivery {
  id: number
  order: number
  delivery_type: "pickup" | "home"
  status: "scheduled" | "in_transit" | "delivered" | "cancelled"
  scheduled_date: string
  delivery_address?: string
  assigned_staff?: number
  notes?: string
}

export interface Report {
  id: number
  report_type: "sales" | "staff_performance" | "inventory"
  generated_date: string
  parameters: Record<string, any>
  data: any
}

// Factory method request interfaces
export interface CreateUserRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: User['role']
  address?: string
  date_of_birth?: string
  notes?: string
}

export interface OrderTransition {
  from_status: string
  to_status: string
  allowed: boolean
  reason?: string
}
