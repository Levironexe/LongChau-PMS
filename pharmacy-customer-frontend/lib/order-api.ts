import { api } from './api'
import { CartItem } from './types'

export interface CreateOrderRequest {
  order_type: 'prescription' | 'in_store' | 'online'
  customer_id?: number
  branch_id: number
  created_by_id?: number
  delivery_address?: string
  delivery_instructions?: string
  notes?: string
  items: Array<{
    product_id: number
    quantity: number
  }>
  prescription_id?: number
}

export interface OrderResponse {
  id: number
  order_number: string
  order_type: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  customer: number
  customer_name?: string
  total_amount: string
  order_date: string
  delivery_address?: string
  delivery_instructions?: string
  notes?: string
  items: Array<{
    id: number
    product: number
    product_name: string
    quantity: number
    unit_price: string
    total_price: string
  }>
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'momo' | 'bank_transfer'
  transaction_id?: string
  amount: number
}

export const orderApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await api.post('/orders/', orderData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order. Please try again.')
    }
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<OrderResponse> {
    try {
      const response = await api.get(`/orders/${orderId}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order details.')
    }
  },

  /**
   * Get orders for a specific customer
   */
  async getCustomerOrders(customerId: number): Promise<OrderResponse[]> {
    try {
      const response = await api.get(`/orders/?customer=${customerId}`)
      return response.data.filter((order: any) => order.customer === customerId)
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      throw new Error('Failed to fetch order history.')
    }
  },

  /**
   * Process order (transition to processing state)
   */
  async processOrder(orderId: number): Promise<OrderResponse> {
    try {
      const response = await api.post(`/orders/${orderId}/process/`)
      return response.data
    } catch (error) {
      console.error('Error processing order:', error)
      throw new Error('Failed to process order.')
    }
  },

  /**
   * Calculate order total using backend strategy pattern
   */
  async calculateOrderTotal(orderId: number): Promise<{ total: number; breakdown: any }> {
    try {
      const response = await api.get(`/orders/${orderId}/calculate-total/`)
      return response.data
    } catch (error) {
      console.error('Error calculating order total:', error)
      throw new Error('Failed to calculate order total.')
    }
  },

  /**
   * Create order from cart items
   */
  async createOrderFromCart(
    cartItems: CartItem[],
    customerInfo: {
      customerId?: number
      deliveryAddress?: string
      deliveryInstructions?: string
      notes?: string
    },
    paymentInfo: PaymentInfo
  ): Promise<OrderResponse> {
    try {
      // Convert cart items to order items format
      const items = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))

      // Determine order type based on items and delivery
      let orderType: CreateOrderRequest['order_type'] = 'online'
      
      // Check if any items require prescription
      const hasRxItems = cartItems.some(item => item.product.requires_prescription)
      if (hasRxItems) {
        orderType = 'prescription'
      } else if (!customerInfo.deliveryAddress) {
        orderType = 'in_store'
      }

      const orderData: CreateOrderRequest = {
        order_type: orderType,
        customer_id: customerInfo.customerId,
        branch_id: 1, // Default branch - could be made configurable
        items,
        delivery_address: customerInfo.deliveryAddress,
        delivery_instructions: customerInfo.deliveryInstructions,
        notes: customerInfo.notes || `Payment: ${paymentInfo.method}${paymentInfo.transaction_id ? ` (${paymentInfo.transaction_id})` : ''}`
      }

      const order = await this.createOrder(orderData)

      // Store payment information for later use
      if (typeof window !== 'undefined') {
        localStorage.setItem(`order_${order.id}_payment`, JSON.stringify(paymentInfo))
      }

      return order
    } catch (error) {
      console.error('Error creating order from cart:', error)
      throw error
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: OrderResponse['status']): Promise<OrderResponse> {
    try {
      const response = await api.patch(`/orders/${orderId}/`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status.')
    }
  },

  /**
   * Get available status transitions for an order
   */
  async getAvailableTransitions(orderId: number): Promise<string[]> {
    try {
      const response = await api.get(`/orders/${orderId}/available-transitions/`)
      return response.data.available_transitions || []
    } catch (error) {
      console.error('Error fetching available transitions:', error)
      return []
    }
  },

  /**
   * Safely transition order status using state pattern
   */
  async transitionOrderStatus(orderId: number, newStatus: string): Promise<OrderResponse> {
    try {
      const response = await api.post(`/orders/${orderId}/transition/`, { 
        new_status: newStatus 
      })
      return response.data
    } catch (error) {
      console.error('Error transitioning order status:', error)
      throw new Error('Failed to update order status.')
    }
  }
}