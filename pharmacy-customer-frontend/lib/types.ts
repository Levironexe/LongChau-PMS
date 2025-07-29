export interface Product {
  id: number
  name: string
  product_type: "medicine" | "supplement"
  price: string
  requires_prescription: boolean
  created_at: string
  stock?: number
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
  customer: number
  customer_name?: string
  total_amount: string
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

export interface CartItem {
  product: Product
  quantity: number
}
