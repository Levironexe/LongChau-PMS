import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, LoyaltyPointsFilters } from '@/lib/queryKeys'
import { 
  loyaltyService, 
  GetLoyaltyPointsParams, 
  AwardPointsParams, 
  UpdatePointsParams 
} from '@/lib/services/loyaltyService'
import { LoyaltyPoints, LoyaltyPointsListResponse } from '@/lib/types'
import { ApiError } from '@/lib/api'

// Query Hooks (GET operations)

// Get all loyalty points with filtering
export const useLoyaltyPoints = (filters?: LoyaltyPointsFilters) => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.list(filters || {}),
    queryFn: () => loyaltyService.getLoyaltyPoints(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get specific loyalty point record
export const useLoyaltyPoint = (id: number) => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.detail(id),
    queryFn: () => loyaltyService.getLoyaltyPoint(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get loyalty points for specific customer
export const useCustomerLoyaltyPoints = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.userPoints(customerId),
    queryFn: () => loyaltyService.getCustomerLoyaltyPoints(customerId),
    enabled: !!customerId && customerId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get expired loyalty points
export const useExpiredLoyaltyPoints = () => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.list({ is_expired: true }),
    queryFn: () => loyaltyService.getExpiredLoyaltyPoints(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get active (non-expired) loyalty points
export const useActiveLoyaltyPoints = () => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.list({ is_expired: false }),
    queryFn: () => loyaltyService.getActiveLoyaltyPoints(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Search loyalty points
export const useSearchLoyaltyPoints = (query: string) => {
  return useQuery({
    queryKey: queryKeys.loyaltyPoints.list({ search: query }),
    queryFn: () => loyaltyService.searchLoyaltyPoints(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 3,
  })
}

// Mutation Hooks (POST/PATCH/DELETE operations)

// Award points to customer
export const useAwardPoints = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AwardPointsParams) => loyaltyService.awardPoints(data),
    
    // Optimistic updates for better UX
    onMutate: async (newPoints) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.loyaltyPoints.lists() })
      
      const previousData = queryClient.getQueryData<LoyaltyPointsListResponse>(
        queryKeys.loyaltyPoints.lists()
      )
      
      // Add optimistic entry
      if (previousData) {
        queryClient.setQueryData<LoyaltyPointsListResponse>(
          queryKeys.loyaltyPoints.lists(), 
          {
            ...previousData,
            results: [
              {
                id: Date.now(), // Temporary ID
                customer: newPoints.customer,
                customer_name: 'Loading...', // Will be populated by API
                points: newPoints.points,
                earned_date: new Date().toISOString(),
                expiry_date: newPoints.expiry_date,
                transaction_reference: newPoints.transaction_reference,
                is_expired: false,
              } as LoyaltyPoints,
              ...previousData.results,
            ],
            count: previousData.count + 1,
          }
        )
      }
      
      return { previousData }
    },
    
    onError: (err: ApiError, newPoints, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.loyaltyPoints.lists(), 
          context.previousData
        )
      }
    },
    
    onSettled: (data) => {
      // Invalidate and refetch all related queries
      getInvalidationKeys.loyaltyPoints(data?.customer).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update loyalty points
export const useUpdatePoints = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdatePointsParams) => loyaltyService.updatePoints(data),
    
    onMutate: async (updatedPoints) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.loyaltyPoints.detail(updatedPoints.id) 
      })
      
      const previousData = queryClient.getQueryData<LoyaltyPoints>(
        queryKeys.loyaltyPoints.detail(updatedPoints.id)
      )
      
      // Optimistically update the detail
      if (previousData) {
        queryClient.setQueryData<LoyaltyPoints>(
          queryKeys.loyaltyPoints.detail(updatedPoints.id),
          { ...previousData, ...updatedPoints }
        )
      }
      
      return { previousData }
    },
    
    onError: (err: ApiError, updatedPoints, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.loyaltyPoints.detail(updatedPoints.id), 
          context.previousData
        )
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.loyaltyPoints(data?.customer).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete loyalty points
export const useDeletePoints = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => loyaltyService.deletePoints(id),
    
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.loyaltyPoints.lists() })
      
      const previousData = queryClient.getQueryData<LoyaltyPointsListResponse>(
        queryKeys.loyaltyPoints.lists()
      )
      
      // Remove the item optimistically
      if (previousData) {
        queryClient.setQueryData<LoyaltyPointsListResponse>(
          queryKeys.loyaltyPoints.lists(),
          {
            ...previousData,
            results: previousData.results.filter(item => item.id !== deletedId),
            count: Math.max(0, previousData.count - 1),
          }
        )
      }
      
      return { previousData, deletedId }
    },
    
    onError: (err: ApiError, deletedId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.loyaltyPoints.lists(), 
          context.previousData
        )
      }
    },
    
    onSettled: (data, error, deletedId) => {
      // Invalidate all loyalty points queries
      queryClient.invalidateQueries({ queryKey: queryKeys.loyaltyPoints.all })
      queryClient.removeQueries({ queryKey: queryKeys.loyaltyPoints.detail(deletedId) })
    },
  })
}

// Statistics Hook - Calculate loyalty points statistics
export const useLoyaltyPointsStats = () => {
  const { data: allPoints } = useLoyaltyPoints()
  const { data: expiredPoints } = useExpiredLoyaltyPoints()
  const { data: activePoints } = useActiveLoyaltyPoints()

  return useQuery({
    queryKey: [...queryKeys.loyaltyPoints.all, 'stats'],
    queryFn: () => {
      if (!allPoints?.results) return null

      const totalPoints = allPoints.results.reduce((sum, item) => sum + item.points, 0)
      const totalRecords = allPoints.count
      const expiredCount = expiredPoints?.count || 0
      const activeCount = activePoints?.count || 0
      const averagePoints = totalRecords > 0 ? Math.round(totalPoints / totalRecords) : 0

      // Group by customer for customer summary
      const customerSummary = allPoints.results.reduce((acc, item) => {
        if (!acc[item.customer]) {
          acc[item.customer] = {
            customer_id: item.customer,
            customer_name: item.customer_name,
            total_points: 0,
            records_count: 0,
            has_expired: false,
          }
        }
        acc[item.customer].total_points += item.points
        acc[item.customer].records_count += 1
        if (item.is_expired) {
          acc[item.customer].has_expired = true
        }
        return acc
      }, {} as Record<number, any>)

      return {
        totalPoints,
        totalRecords,
        expiredCount,
        activeCount,
        averagePoints,
        customerSummary: Object.values(customerSummary),
      }
    },
    enabled: !!allPoints?.results,
    staleTime: 5 * 60 * 1000,
  })
}