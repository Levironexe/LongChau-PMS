import { api, createQueryParams } from '../api'
import { User, CreateUserRequest, CreateFactoryUserRequest } from '../types'
import { UserFilters } from '../queryKeys'

// User Service - All user-related API calls
export const userService = {
  // GET /users/ - Get all users with filtering (handles pagination)
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    const params = { ...filters }
    const queryString = createQueryParams(params)
    
    // First request to get total count and first page
    let response = await api.get(`/users/?${queryString}`)
    let allUsers = response.data.results || []
    
    // If there are more pages, fetch them
    let nextUrl = response.data.next
    while (nextUrl) {
      // Extract just the query parameters from the next URL
      const nextUrlObj = new URL(nextUrl)
      const nextQueryString = nextUrlObj.search
      const nextResponse = await api.get(`/users/${nextQueryString}`)
      allUsers = [...allUsers, ...(nextResponse.data.results || [])]
      nextUrl = nextResponse.data.next
    }
    
    return allUsers
  },

  // GET /users/{id}/ - Get single user
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}/`)
    return response.data
  },

  // GET /users/customers/ - Shortcut endpoint for customers
  getCustomers: async (): Promise<User[]> => {
    const response = await api.get('/users/customers/')
    return response.data
  },

  // GET /users/pharmacists/ - Shortcut endpoint for pharmacists
  getPharmacists: async (): Promise<User[]> => {
    const response = await api.get('/users/pharmacists/')
    return response.data
  },

  // GET /users/staff/ - Shortcut endpoint for staff
  getStaff: async (): Promise<User[]> => {
    const response = await api.get('/users/staff/')
    return response.data
  },

  // POST /users/ - Create new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users/', data)
    return response.data
  },

  // POST /users/ - Create pharmacist using base endpoint
  createPharmacist: async (data: CreateFactoryUserRequest): Promise<User> => {
    const pharmacistData = {
      ...data,
      user_type: 'pharmacist',
      role: 'pharmacist'
    }
    const response = await api.post('/users/', pharmacistData)
    return response.data
  },

  // POST /users/ - Create customer using base endpoint
  createCustomer: async (data: CreateFactoryUserRequest): Promise<User> => {
    const customerData = {
      ...data,
      user_type: 'customer',
      role: 'customer'
    }
    const response = await api.post('/users/', customerData)
    return response.data
  },

  // POST /users/ - Create VIP customer using base endpoint
  createVipCustomer: async (data: CreateFactoryUserRequest): Promise<User> => {
    const vipCustomerData = {
      ...data,
      user_type: 'customer',
      role: 'customer',
      membership_level: 'VIP',
      discount_rate: 0.15 // Default 15% VIP discount
    }
    const response = await api.post('/users/', vipCustomerData)
    return response.data
  },

  // POST /users/ - Create staff using base endpoint
  createStaff: async (data: CreateFactoryUserRequest & { role: string }): Promise<User> => {
    const staffData = {
      ...data,
      user_type: 'employee',
      role: data.role
    }
    const response = await api.post('/users/', staffData)
    return response.data
  },

  // PUT /users/{id}/ - Update user (full update)
  updateUser: async ({ id, ...data }: { id: number } & Partial<CreateUserRequest>): Promise<User> => {
    const response = await api.put(`/users/${id}/`, data)
    return response.data
  },

  // PATCH /users/{id}/ - Partial update user
  patchUser: async ({ id, ...data }: { id: number } & Partial<CreateUserRequest>): Promise<User> => {
    const response = await api.patch(`/users/${id}/`, data)
    return response.data
  },

  // PATCH /users/{id}/ - Upgrade customer to VIP using base endpoint
  upgradeToVip: async (id: number): Promise<User> => {
    const vipUpgradeData = {
      membership_level: 'VIP',
      discount_rate: 0.15, // Set 15% VIP discount
      user_type: 'customer'
    }
    const response = await api.patch(`/users/${id}/`, vipUpgradeData)
    return response.data
  },

  // DELETE /users/{id}/ - Delete user
  deleteUser: async (id: number): Promise<void> => {
    const response = await api.delete(`/users/${id}/`)
    return response.data
  },
}

// Type for user service responses
export type UserServiceResponse<T> = {
  data: T
  message?: string
  status: number
}

// Export types for use in hooks
export type GetUsersParams = UserFilters
export type CreateUserParams = CreateUserRequest
export type CreateFactoryUserParams = CreateFactoryUserRequest
export type UpdateUserParams = { id: number } & Partial<CreateUserRequest>
export type UpgradeToVipParams = number