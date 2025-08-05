import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryKeys'
import { userFactoryService } from '../../lib/services/userFactoryService'
import { User, CreateFactoryUserRequest } from '../../lib/types'

// User Factory Query Hooks

// Check if factory pattern is available for a user role
export const useIsUserFactoryAvailable = (role: string) => {
  return useQuery({
    queryKey: ['userFactory', 'available', role],
    queryFn: () => userFactoryService.isFactoryAvailable(role),
    enabled: !!role,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  })
}

// Get supported user roles for factory creation
export const useSupportedUserRoles = () => {
  return useQuery({
    queryKey: ['userFactory', 'supportedRoles'],
    queryFn: userFactoryService.getSupportedRoles,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Get factory configuration for a specific role
export const useUserFactoryConfig = (role: string) => {
  return useQuery({
    queryKey: ['userFactory', 'config', role],
    queryFn: () => userFactoryService.getFactoryConfig(role),
    enabled: !!role,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// User Factory Mutation Hooks

// Create pharmacist using factory pattern
export const useCreatePharmacistFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFactoryUserRequest) => 
      userFactoryService.createPharmacist(data),

    onSuccess: (data) => {
      // Invalidate relevant user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.pharmacists() })
      
      // Pharmacist created via factory pattern
    },

    onError: (err) => {
      console.error('Create pharmacist factory error:', err)
    },
  })
}

// Create customer using factory pattern
export const useCreateCustomerFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFactoryUserRequest) => 
      userFactoryService.createCustomer(data),

    onSuccess: (data) => {
      // Invalidate relevant user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.customers() })
      
      // Customer created via factory pattern
    },

    onError: (err) => {
      console.error('Create customer factory error:', err)
    },
  })
}

// Create VIP customer using factory pattern
export const useCreateVipCustomerFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFactoryUserRequest) => 
      userFactoryService.createVipCustomer(data),

    onSuccess: (data) => {
      // Invalidate relevant user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.customers() })
      
      // VIP customer created via factory pattern
    },

    onError: (err) => {
      console.error('Create VIP customer factory error:', err)
    },
  })
}

// Create staff using factory pattern
export const useCreateStaffFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFactoryUserRequest & { role: string }) => 
      userFactoryService.createStaff(data),

    onSuccess: (data) => {
      // Invalidate relevant user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staff() })
      
      // Staff member created via factory pattern
    },

    onError: (err) => {
      console.error('Create staff factory error:', err)
    },
  })
}

// Generic user factory creation hook
export const useCreateUserFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ role, data }: { role: string, data: CreateFactoryUserRequest }) =>
      userFactoryService.createUser(role, data),

    onSuccess: (data, variables) => {
      // Invalidate queries based on user role
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      
      if (variables.role === 'pharmacist') {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.pharmacists() })
      } else if (variables.role === 'customer' || variables.role === 'vip_customer') {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.customers() })
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.staff() })
      }
      
      // User created via factory pattern
    },

    onError: (err, variables) => {
      console.error('Create user factory error:', err)
    },
  })
}

// Bulk user factory creation hook
export const useCreateUsersBulkFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (users: Array<{ role: string, data: CreateFactoryUserRequest }>) =>
      userFactoryService.createUsersBulk(users),

    onSuccess: (createdUsers, variables) => {
      // Invalidate all relevant queries since we created multiple user types
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.pharmacists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.customers() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.staff() })
      
      const successCount = createdUsers.length
      const totalCount = variables.length
      
      // Bulk user creation completed
    },

    onError: (err) => {
      console.error('Bulk create users factory error:', err)
    },
  })
}

// Helper hook to check if a user role supports factory creation
export const useCanCreateUserViaFactory = (role: string) => {
  const { data: isAvailable, isLoading } = useIsUserFactoryAvailable(role)
  
  return {
    canCreate: isAvailable ?? false,
    isLoading,
  }
}