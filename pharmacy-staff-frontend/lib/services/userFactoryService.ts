import { api } from '../api'
import { User, CreateFactoryUserRequest } from '../types'

// User Factory Service - Factory Pattern for User Creation
export const userFactoryService = {
  // Factory Method Endpoints - Create users with proper defaults and validation
  
  // POST /users/create-pharmacist/ - Create pharmacist with proper defaults
  createPharmacist: async (data: CreateFactoryUserRequest): Promise<User> => {
    try {
      // Try the dedicated factory endpoint first
      const response = await api.post('/users/create-pharmacist/', data)
      return response.data
    } catch (error) {
      // Fallback to regular user creation with pharmacist role
      console.warn('Factory endpoint not available, using fallback method')
      const userWithRole = { ...data, role: 'pharmacist' as const }
      const response = await api.post('/users/', userWithRole)
      return response.data
    }
  },

  // POST /users/create-customer/ - Create customer with proper defaults
  createCustomer: async (data: CreateFactoryUserRequest): Promise<User> => {
    try {
      const response = await api.post('/users/create-customer/', data)
      return response.data
    } catch (error) {
      console.warn('Factory endpoint not available, using fallback method')
      const userWithRole = { ...data, role: 'customer' as const }
      const response = await api.post('/users/', userWithRole)
      return response.data
    }
  },

  // POST /users/create-vip-customer/ - Create VIP customer with benefits
  createVipCustomer: async (data: CreateFactoryUserRequest): Promise<User> => {
    try {
      const response = await api.post('/users/create-vip-customer/', data)
      return response.data
    } catch (error) {
      console.warn('Factory endpoint not available, using fallback method')
      const userWithRole = { ...data, role: 'vip_customer' as const }
      const response = await api.post('/users/', userWithRole)
      return response.data
    }
  },

  // POST /users/create-staff/ - Create any staff member by role
  createStaff: async (data: CreateFactoryUserRequest & { role: string }): Promise<User> => {
    try {
      const response = await api.post('/users/create-staff/', data)
      return response.data
    } catch (error) {
      console.warn('Factory endpoint not available, using fallback method')
      const response = await api.post('/users/', data)
      return response.data
    }
  },

  // Generic factory method - creates users based on role using factory pattern
  createUser: async (role: string, data: CreateFactoryUserRequest): Promise<User> => {
    switch (role) {
      case 'pharmacist':
        return userFactoryService.createPharmacist(data)
      case 'customer':
        return userFactoryService.createCustomer(data)
      case 'vip_customer':
        return userFactoryService.createVipCustomer(data)
      case 'technician':
      case 'manager':
      case 'cashier':
      case 'inventory_manager':
        return userFactoryService.createStaff({ ...data, role })
      default:
        throw new Error(`Unsupported user role for factory creation: ${role}`)
    }
  },

  // Bulk user creation using factory pattern  
  createUsersBulk: async (users: Array<{ role: string, data: CreateFactoryUserRequest }>): Promise<User[]> => {
    const createPromises = users.map(({ role, data }) => 
      userFactoryService.createUser(role, data)
    )
    
    return Promise.allSettled(createPromises).then(results => {
      const successful: User[] = []
      const failed: any[] = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push({ 
            index, 
            role: users[index].role, 
            data: users[index].data, 
            error: result.reason 
          })
        }
      })
      
      if (failed.length > 0) {
        console.warn('Some users failed to create via factory:', failed)
      }
      
      return successful
    })
  },

  // Factory configuration methods
  
  // Check if factory pattern is available for a user role
  isFactoryAvailable: async (role: string): Promise<boolean> => {
    // User factory patterns are available for all standard roles
    const supportedRoles = [
      'pharmacist', 
      'customer', 
      'vip_customer', 
      'technician', 
      'manager', 
      'cashier', 
      'inventory_manager'
    ]
    return supportedRoles.includes(role)
  },

  // Get supported user roles for factory creation
  getSupportedRoles: async (): Promise<string[]> => {
    return [
      'pharmacist', 
      'customer', 
      'vip_customer', 
      'technician', 
      'manager', 
      'cashier', 
      'inventory_manager'
    ]
  },

  // Get factory configuration for a specific role
  getFactoryConfig: async (role: string): Promise<{ role: string, hasFactory: boolean, defaults: any } | null> => {
    const isAvailable = await userFactoryService.isFactoryAvailable(role)
    if (!isAvailable) return null

    // Define role-specific defaults and configurations
    const configs: Record<string, any> = {
      pharmacist: {
        role: 'pharmacist',
        hasFactory: true,
        defaults: {
          permissions: ['validate_prescriptions', 'manage_inventory'],
          department: 'pharmacy'
        }
      },
      customer: {
        role: 'customer',
        hasFactory: true,
        defaults: {
          loyalty_points: 0,
          customer_type: 'regular'
        }
      },
      vip_customer: {
        role: 'vip_customer', 
        hasFactory: true,
        defaults: {
          loyalty_points: 100,
          customer_type: 'vip',
          discount_percentage: 10
        }
      },
      technician: {
        role: 'technician',
        hasFactory: true,
        defaults: {
          department: 'pharmacy',
          permissions: ['assist_pharmacist']
        }
      },
      manager: {
        role: 'manager',
        hasFactory: true,
        defaults: {
          department: 'management',
          permissions: ['manage_staff', 'view_reports']
        }
      },
      cashier: {
        role: 'cashier',
        hasFactory: true,
        defaults: {
          department: 'sales',
          permissions: ['process_payments']
        }
      },
      inventory_manager: {
        role: 'inventory_manager',
        hasFactory: true,
        defaults: {
          department: 'inventory',
          permissions: ['manage_inventory', 'view_stock_reports']
        }
      }
    }

    return configs[role] || null
  }
}

// Type exports for use in hooks
export type CreateUserFactoryParams = { role: string, data: CreateFactoryUserRequest }
export type CreateUsersBulkFactoryParams = Array<{ role: string, data: CreateFactoryUserRequest }>