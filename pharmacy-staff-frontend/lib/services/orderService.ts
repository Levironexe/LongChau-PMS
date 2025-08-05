import { api, createQueryParams } from '../api'
import { Order, CreateOrderRequest, OrderItem } from '../types'
import { OrderFilters } from '../queryKeys'

// Order Service - All order-related API calls
export const orderService = {
  // GET /orders/ - Get all orders with filtering
  getOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/orders/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /orders/{id}/ - Get single order
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}/`)
    return response.data
  },

  // POST /orders/ - Create new order
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/orders/', data)
    return response.data
  },

  // PUT /orders/{id}/ - Update order (full update)
  updateOrder: async ({ id, ...data }: { id: number } & Partial<CreateOrderRequest>): Promise<Order> => {
    const response = await api.put(`/orders/${id}/`, data)
    return response.data
  },

  // PATCH /orders/{id}/ - Partial update order
  patchOrder: async ({ id, ...data }: { id: number } & Partial<CreateOrderRequest>): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/`, data)
    return response.data
  },

  // POST /orders/{id}/transition/ - State pattern transition
  transitionOrder: async (id: number, status: Order['status']): Promise<Order> => {
    const response = await api.post(`/orders/${id}/transition/`, { status })
    return response.data
  },

  // POST /orders/{id}/process/ - Strategy pattern processing
  processOrder: async (id: number, action?: string): Promise<Order> => {
    const response = await api.post(`/orders/${id}/process/`, action ? { action } : {})
    return response.data
  },

  // GET /orders/{id}/calculate-total/ - Calculate order total
  calculateTotal: async (id: number): Promise<{ total: string }> => {
    const response = await api.get(`/orders/${id}/calculate-total/`)
    return response.data
  },

  // DELETE /orders/{id}/ - Delete order
  deleteOrder: async (id: number): Promise<void> => {
    const response = await api.delete(`/orders/${id}/`)
    return response.data
  },

  // GET /orders/by-type/{order_type}/ - Get orders by type (convenience endpoint)
  getOrdersByType: async (orderType: Order['order_type']): Promise<Order[]> => {
    const response = await api.get(`/orders/by-type/${orderType}/`)
    return response.data
  },

  // GET /orders/by-status/{status}/ - Get orders by status (convenience endpoint)
  getOrdersByStatus: async (status: Order['status']): Promise<Order[]> => {
    const response = await api.get(`/orders/by-status/${status}/`)
    return response.data
  },

  // GET /orders/{id}/available-transitions/ - Get available state transitions
  getAvailableTransitions: async (id: number): Promise<string[]> => {
    const response = await api.get(`/orders/${id}/available-transitions/`)
    return response.data
  },
}

// Type for order service responses
export type OrderServiceResponse<T> = {
  data: T
  message?: string
  status: number
}

// Export types for use in hooks
export type GetOrdersParams = OrderFilters
export type CreateOrderParams = CreateOrderRequest
export type UpdateOrderParams = { id: number } & Partial<CreateOrderRequest>
export type TransitionOrderParams = { id: number; status: Order['status'] }
export type ProcessOrderParams = { id: number; action?: string }
export type CalculateTotalParams = number