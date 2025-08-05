import { api, createQueryParams } from '../api'
import { 
  LoyaltyPoints, 
  LoyaltyPointsListResponse, 
  CreateLoyaltyPointsRequest,
  UpdateLoyaltyPointsRequest 
} from '../types'
import { LoyaltyPointsFilters } from '../queryKeys'

export const loyaltyService = {
  // GET /loyalty-points/ - Get all loyalty point records
  getLoyaltyPoints: async (filters?: LoyaltyPointsFilters): Promise<LoyaltyPointsListResponse> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/loyalty-points/${queryString ? `?${queryString}` : ''}`)
    return response.data
  },

  // GET /loyalty-points/{id}/ - Get specific loyalty point record
  getLoyaltyPoint: async (id: number): Promise<LoyaltyPoints> => {
    const response = await api.get(`/loyalty-points/${id}/`)
    return response.data
  },

  // POST /loyalty-points/ - Award points to customer
  awardPoints: async (data: CreateLoyaltyPointsRequest): Promise<LoyaltyPoints> => {
    const response = await api.post('/loyalty-points/', data)
    return response.data
  },

  // PATCH /loyalty-points/{id}/ - Update loyalty points
  updatePoints: async ({ id, ...data }: { id: number } & UpdateLoyaltyPointsRequest): Promise<LoyaltyPoints> => {
    const response = await api.patch(`/loyalty-points/${id}/`, data)
    return response.data
  },

  // DELETE /loyalty-points/{id}/ - Delete loyalty points record
  deletePoints: async (id: number): Promise<void> => {
    const response = await api.delete(`/loyalty-points/${id}/`)
    return response.data
  },

  // Convenience methods for common queries
  
  // Get loyalty points for specific customer
  getCustomerLoyaltyPoints: async (customerId: number): Promise<LoyaltyPointsListResponse> => {
    const response = await api.get(`/loyalty-points/?customer=${customerId}`)
    return response.data
  },

  // Get expired loyalty points
  getExpiredLoyaltyPoints: async (): Promise<LoyaltyPointsListResponse> => {
    const response = await api.get('/loyalty-points/?is_expired=true')
    return response.data
  },

  // Get active (non-expired) loyalty points
  getActiveLoyaltyPoints: async (): Promise<LoyaltyPointsListResponse> => {
    const response = await api.get('/loyalty-points/?is_expired=false')
    return response.data
  },

  // Search loyalty points by customer name or transaction reference
  searchLoyaltyPoints: async (query: string): Promise<LoyaltyPointsListResponse> => {
    const response = await api.get(`/loyalty-points/?search=${encodeURIComponent(query)}`)
    return response.data
  },
}

// Export parameter types for TypeScript support
export type GetLoyaltyPointsParams = LoyaltyPointsFilters
export type AwardPointsParams = CreateLoyaltyPointsRequest
export type UpdatePointsParams = { id: number } & UpdateLoyaltyPointsRequest