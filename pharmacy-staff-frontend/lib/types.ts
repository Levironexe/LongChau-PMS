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
  status: "pending" | "completed"
  order_date: string
  items?: OrderItem[]
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
  items: {
    product_id: number
    quantity: number
  }[]
}
