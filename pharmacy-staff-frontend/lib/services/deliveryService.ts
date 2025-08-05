import { api, createQueryParams } from '../api'
import { 
  Delivery, 
  CreateDeliveryRequest, 
  UpdateDeliveryRequest, 
  ScheduleDeliveryRequest, 
  DeliveryFilters 
} from '../types'

// Delivery Service - All delivery-related API calls
export const deliveryService = {
  // GET /deliveries/ - Get all deliveries with filtering
  getDeliveries: async (filters?: DeliveryFilters): Promise<Delivery[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/deliveries/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /deliveries/{id}/ - Get single delivery
  getDelivery: async (id: number): Promise<Delivery> => {
    const response = await api.get(`/deliveries/${id}/`)
    return response.data
  },

  // POST /deliveries/ - Create new delivery
  createDelivery: async (data: CreateDeliveryRequest): Promise<Delivery> => {
    const response = await api.post('/deliveries/', data)
    return response.data
  },

  // PUT /deliveries/{id}/ - Update delivery (full update)
  updateDelivery: async ({ id, ...data }: UpdateDeliveryRequest): Promise<Delivery> => {
    const response = await api.put(`/deliveries/${id}/`, data)
    return response.data
  },

  // PATCH /deliveries/{id}/ - Partial update delivery
  patchDelivery: async ({ id, ...data }: UpdateDeliveryRequest): Promise<Delivery> => {
    const response = await api.patch(`/deliveries/${id}/`, data)
    return response.data
  },

  // POST /deliveries/{id}/schedule/ - Assign staff to delivery
  scheduleDelivery: async (id: number, data: ScheduleDeliveryRequest): Promise<Delivery> => {
    const response = await api.post(`/deliveries/${id}/schedule/`, data)
    return response.data
  },

  // DELETE /deliveries/{id}/ - Delete delivery
  deleteDelivery: async (id: number): Promise<void> => {
    await api.delete(`/deliveries/${id}/`)
  },

  // Convenience methods for filtering
  
  // GET /deliveries/?delivery_type=pickup - Get pickup deliveries only
  getPickupDeliveries: async (filters?: Omit<DeliveryFilters, 'delivery_type'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, delivery_type: 'pickup' })
  },

  // GET /deliveries/?delivery_type=home - Get home deliveries only  
  getHomeDeliveries: async (filters?: Omit<DeliveryFilters, 'delivery_type'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, delivery_type: 'home' })
  },

  // GET /deliveries/?status=scheduled - Get scheduled deliveries
  getScheduledDeliveries: async (filters?: Omit<DeliveryFilters, 'status'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, status: 'scheduled' })
  },

  // GET /deliveries/?status=in_transit - Get in-transit deliveries
  getInTransitDeliveries: async (filters?: Omit<DeliveryFilters, 'status'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, status: 'in_transit' })
  },

  // GET /deliveries/?status=delivered - Get delivered deliveries
  getDeliveredDeliveries: async (filters?: Omit<DeliveryFilters, 'status'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, status: 'delivered' })
  },

  // GET /deliveries/?status=cancelled - Get cancelled deliveries
  getCancelledDeliveries: async (filters?: Omit<DeliveryFilters, 'status'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, status: 'cancelled' })
  },

  // GET /deliveries/?is_overdue=true - Get overdue deliveries
  getOverdueDeliveries: async (filters?: Omit<DeliveryFilters, 'is_overdue'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, is_overdue: true })
  },

  // GET /deliveries/?assigned_staff={id} - Get deliveries by staff member
  getDeliveriesByStaff: async (staffId: number, filters?: Omit<DeliveryFilters, 'assigned_staff'>): Promise<Delivery[]> => {
    return deliveryService.getDeliveries({ ...filters, assigned_staff: staffId })
  },
}