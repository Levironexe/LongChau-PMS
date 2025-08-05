import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, UserFilters } from '@/lib/queryKeys'
import { userService, CreateUserParams, CreateFactoryUserParams, UpdateUserParams } from '@/lib/services/userService'
import { User } from '@/lib/types'
import { ApiError } from '@/lib/api'

// Query Hooks (GET operations)

// Get all users with filtering
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    placeholderData: keepPreviousData, // Keep previous data while loading new data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

// Get single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id && id > 0, // Only run if id exists and is valid
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get customers shortcut
export const useCustomers = () => {
  return useQuery({
    queryKey: queryKeys.users.customers(),
    queryFn: () => userService.getCustomers(),
    staleTime: 5 * 60 * 1000,
  })
}

// Get pharmacists shortcut
export const usePharmacists = () => {
  return useQuery({
    queryKey: queryKeys.users.pharmacists(),
    queryFn: () => userService.getPharmacists(),
    staleTime: 5 * 60 * 1000,
  })
}

// Get staff shortcut
export const useStaff = () => {
  return useQuery({
    queryKey: queryKeys.users.staff(),
    queryFn: () => userService.getStaff(),
    staleTime: 5 * 60 * 1000,
  })
}

// Get customers only - uses dedicated /api/users/customers/ endpoint
export const useCustomersOnly = (filters?: { search?: string; role?: string }) => {
  return useQuery({
    queryKey: ['users', 'customers', filters],
    queryFn: async () => {
      // Use dedicated customers endpoint - already filtered to customers only
      const customers = await userService.getCustomers()
      
      // Apply client-side filtering if needed
      let filteredCustomers = customers
      
      // Search filtering
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredCustomers = filteredCustomers.filter(customer => 
          `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          (customer.phone && customer.phone.includes(filters.search!))
        )
      }
      
      // Role filtering within customers (regular vs VIP)
      if (filters?.role && filters.role !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => customer.role === filters.role)
      }
      
      return filteredCustomers
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get staff only (all roles except customer and vip_customer) with filtering  
export const useStaffOnly = (filters?: Omit<UserFilters, 'role'>) => {
  return useQuery({
    queryKey: queryKeys.users.list({ ...filters, role: 'staff' }),
    queryFn: async () => {
      // If no filters are applied, use the dedicated staff endpoint for better performance
      const hasFilters = filters && Object.keys(filters).length > 0
      
      if (!hasFilters) {
        return await userService.getStaff()
      }
      
      // Use general users endpoint with client-side filtering when filters are applied
      const allUsers = await userService.getUsers(filters)
      return allUsers.filter(user => !['customer', 'vip_customer'].includes(user.role))
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Mutation Hooks (POST/PUT/DELETE operations)

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateUserParams) => userService.createUser(data),
    
    // Optimistic update
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() })
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKeys.users.lists())
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.users.lists(), (old: User[] = []) => [
        ...old,
        { 
          ...newUser, 
          id: Date.now(), // Temporary ID
          registration_date: new Date().toISOString(),
          status: 'active',
          total_orders: 0,
          total_spent: 0,
          loyalty_points: 0,
        } as User
      ])
      
      return { previousUsers }
    },
    
    onError: (err: ApiError, newUser, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousUsers)
      }
    },
    
    onSettled: (data) => {
      // Always refetch after error or success
      getInvalidationKeys.user(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Create pharmacist mutation (Factory Method)
export const useCreatePharmacist = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateFactoryUserParams) => userService.createPharmacist(data),
    onSuccess: (newUser) => {
      getInvalidationKeys.user(newUser.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Create VIP customer mutation (Factory Method)
export const useCreateVipCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateFactoryUserParams) => userService.createVipCustomer(data),
    onSuccess: (newUser) => {
      getInvalidationKeys.user(newUser.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Create staff mutation (Factory Method)
export const useCreateStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateFactoryUserParams & { role: string }) => userService.createStaff(data),
    onSuccess: (newUser) => {
      getInvalidationKeys.user(newUser.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateUserParams) => userService.patchUser(data),
    
    onSuccess: (updatedUser) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser)
      
      // Update user in any lists that might contain this user
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (oldData: User[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.user(updatedUser.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Upgrade to VIP mutation
export const useUpgradeToVip = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: number) => userService.upgradeToVip(userId),
    
    onSuccess: (_, userId) => {
      // Optimistically update user role in cache
      queryClient.setQueryData(queryKeys.users.detail(userId), (oldUser: User | undefined) => {
        if (!oldUser) return oldUser
        return { ...oldUser, role: 'vip_customer' as User['role'] }
      })
      
      // Invalidate queries to refetch fresh data
      getInvalidationKeys.user(userId).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() })
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKeys.users.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.users.lists(), (old: User[] = []) =>
        old.filter(user => user.id !== userId)
      )
      
      return { previousUsers }
    },
    
    onError: (err, userId, context) => {
      // If the mutation fails, restore previous data
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousUsers)
      }
    },
    
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) })
      
      // Invalidate all related queries
      getInvalidationKeys.user().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Custom hook for user statistics (legacy - still available)
export const useUserStats = () => {
  const usersQuery = useUsers()
  
  if (!usersQuery.data) {
    return {
      totalUsers: 0,
      customers: 0,
      vipCustomers: 0,
      staff: 0,
      activeUsers: 0,
      isLoading: usersQuery.isLoading,
      error: usersQuery.error,
    }
  }
  
  const users = usersQuery.data
  const customers = users.filter(u => ['customer', 'vip_customer'].includes(u.role))
  const vipCustomers = users.filter(u => u.role === 'vip_customer')
  const staff = users.filter(u => !['customer', 'vip_customer'].includes(u.role))
  const activeUsers = users.filter(u => u.status === 'active')
  
  return {
    totalUsers: users.length,
    customers: customers.length,
    vipCustomers: vipCustomers.length,
    staff: staff.length,
    activeUsers: activeUsers.length,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
  }
}

// Custom hook for customer statistics
export const useCustomerStats = () => {
  const customersQuery = useCustomersOnly()
  
  if (!customersQuery.data) {
    return {
      totalCustomers: 0,
      regularCustomers: 0,
      vipCustomers: 0,
      activeCustomers: 0,
      isLoading: customersQuery.isLoading,
      error: customersQuery.error,
    }
  }
  
  const customers = customersQuery.data
  const regularCustomers = customers.filter(c => c.role === 'customer')
  const vipCustomers = customers.filter(c => c.role === 'vip_customer')
  const activeCustomers = customers.filter(c => c.status === 'active')
  
  return {
    totalCustomers: customers.length,
    regularCustomers: regularCustomers.length,
    vipCustomers: vipCustomers.length,
    activeCustomers: activeCustomers.length,
    isLoading: customersQuery.isLoading,
    error: customersQuery.error,
  }
}

// Custom hook for staff statistics
export const useStaffStats = () => {
  const staffQuery = useStaffOnly()
  
  if (!staffQuery.data) {
    return {
      totalStaff: 0,
      pharmacists: 0,
      technicians: 0,
      managers: 0,
      cashiers: 0,
      inventoryManagers: 0,
      activeStaff: 0,
      isLoading: staffQuery.isLoading,
      error: staffQuery.error,
    }
  }
  
  const staff = staffQuery.data
  const pharmacists = staff.filter(s => s.role === 'pharmacist')
  const technicians = staff.filter(s => s.role === 'technician')
  const managers = staff.filter(s => s.role === 'manager')
  const cashiers = staff.filter(s => s.role === 'cashier')
  const inventoryManagers = staff.filter(s => s.role === 'inventory_manager')
  const activeStaff = staff.filter(s => s.status === 'active')
  
  return {
    totalStaff: staff.length,
    pharmacists: pharmacists.length,
    technicians: technicians.length,
    managers: managers.length,
    cashiers: cashiers.length,
    inventoryManagers: inventoryManagers.length,
    activeStaff: activeStaff.length,
    isLoading: staffQuery.isLoading,
    error: staffQuery.error,
  }
}