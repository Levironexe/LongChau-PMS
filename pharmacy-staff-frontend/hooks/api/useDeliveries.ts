import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, DeliveryFilters } from '@/lib/queryKeys'
import { deliveryService } from '@/lib/services/deliveryService'
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest, ScheduleDeliveryRequest } from '@/lib/types'
import { ApiError } from '@/lib/api'

// Query Hooks (GET operations)

// Get all deliveries with filtering
export const useDeliveries = (filters?: DeliveryFilters) => {
  return useQuery({
    queryKey: queryKeys.deliveries.list(filters || {}),
    queryFn: () => deliveryService.getDeliveries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (deliveries change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single delivery
export const useDelivery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.deliveries.detail(id),
    queryFn: () => deliveryService.getDelivery(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })
}

// Specialized delivery queries

// Get pickup deliveries only
export const usePickupDeliveries = (filters?: Omit<DeliveryFilters, 'delivery_type'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.pickup(),
    queryFn: () => deliveryService.getPickupDeliveries(filters),
    staleTime: 2 * 60 * 1000,
  })
}

// Get home deliveries only  
export const useHomeDeliveries = (filters?: Omit<DeliveryFilters, 'delivery_type'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.home(),
    queryFn: () => deliveryService.getHomeDeliveries(filters),
    staleTime: 2 * 60 * 1000,
  })
}

// Get scheduled deliveries
export const useScheduledDeliveries = (filters?: Omit<DeliveryFilters, 'status'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.scheduled(),
    queryFn: () => deliveryService.getScheduledDeliveries(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for status-specific queries
  })
}

// Get in-transit deliveries
export const useInTransitDeliveries = (filters?: Omit<DeliveryFilters, 'status'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.inTransit(),
    queryFn: () => deliveryService.getInTransitDeliveries(filters),
    staleTime: 30 * 1000, // 30 seconds for urgent status queries
  })
}

// Get delivered deliveries
export const useDeliveredDeliveries = (filters?: Omit<DeliveryFilters, 'status'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.delivered(),
    queryFn: () => deliveryService.getDeliveredDeliveries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes for completed deliveries
  })
}

// Get cancelled deliveries
export const useCancelledDeliveries = (filters?: Omit<DeliveryFilters, 'status'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.cancelled(),
    queryFn: () => deliveryService.getCancelledDeliveries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes for cancelled deliveries
  })
}

// Get overdue deliveries
export const useOverdueDeliveries = (filters?: Omit<DeliveryFilters, 'is_overdue'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.overdue(),
    queryFn: () => deliveryService.getOverdueDeliveries(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for urgent overdue status
  })
}

// Get deliveries by staff member
export const useDeliveriesByStaff = (staffId: number, filters?: Omit<DeliveryFilters, 'assigned_staff'>) => {
  return useQuery({
    queryKey: queryKeys.deliveries.byStaff(staffId),
    queryFn: () => deliveryService.getDeliveriesByStaff(staffId, filters),
    enabled: !!staffId && staffId > 0,
    staleTime: 2 * 60 * 1000,
  })
}

// Mutation Hooks (POST, PUT, PATCH, DELETE operations)

// Create delivery mutation
export const useCreateDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDeliveryRequest) => deliveryService.createDelivery(data),
    onMutate: async (newDelivery) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.deliveries.lists() })

      // Snapshot previous value
      const previousDeliveries = queryClient.getQueryData(queryKeys.deliveries.lists())

      // Optimistically update to new value (simplified)
      queryClient.setQueryData(queryKeys.deliveries.lists(), (old: any) => {
        const optimisticDelivery = {
          id: Math.random() * 1000000, // Temporary ID
          ...newDelivery,
          customer_name: 'Loading...',
          assigned_staff_name: 'Loading...',
          is_overdue: false,
          delivery_type_display: {
            type: newDelivery.delivery_type,
            is_pickup: newDelivery.delivery_type === 'pickup',
            is_home_delivery: newDelivery.delivery_type === 'home',
            fee: newDelivery.delivery_type === 'home' ? 15000 : 0,
          },
          status: 'scheduled' as const,
          delivered_date: null,
          created_at: new Date().toISOString(),
          pickup_location: newDelivery.pickup_location || '',
          customer_notified: false,
          delivery_fee: newDelivery.delivery_type === 'home' ? '15000.00' : '0.00',
          estimated_delivery_time: newDelivery.estimated_delivery_time || '01:00:00',
          gps_coordinates: newDelivery.gps_coordinates || '',
          delivery_address: newDelivery.delivery_address || '',
          delivery_instructions: newDelivery.delivery_instructions || '',
          order_number: 'Loading...',
          assigned_staff: newDelivery.assigned_staff || 0,
        }
        return old ? [optimisticDelivery, ...old] : [optimisticDelivery]
      })

      return { previousDeliveries }
    },
    onError: (err, newDelivery, context) => {
      // Rollback on error
      if (context?.previousDeliveries) {
        queryClient.setQueryData(queryKeys.deliveries.lists(), context.previousDeliveries)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: getInvalidationKeys.delivery() })
      queryClient.invalidateQueries({ queryKey: getInvalidationKeys.order() })
    },
  })
}

// Update delivery mutation
export const useUpdateDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDeliveryRequest) => deliveryService.updateDelivery(data),
    onMutate: async (updatedDelivery) => {
      const deliveryId = updatedDelivery.id
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.deliveries.detail(deliveryId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.deliveries.lists() })

      // Snapshot previous values
      const previousDelivery = queryClient.getQueryData(queryKeys.deliveries.detail(deliveryId))
      const previousDeliveries = queryClient.getQueryData(queryKeys.deliveries.lists())

      // Optimistically update single delivery
      queryClient.setQueryData(queryKeys.deliveries.detail(deliveryId), (old: any) => ({
        ...old,
        ...updatedDelivery,
      }))

      // Optimistically update delivery in lists
      queryClient.setQueryData(queryKeys.deliveries.lists(), (old: any) => {
        if (!old) return old
        return old.map((delivery: Delivery) =>
          delivery.id === deliveryId ? { ...delivery, ...updatedDelivery } : delivery
        )
      })

      return { previousDelivery, previousDeliveries, deliveryId }
    },
    onError: (err, updatedDelivery, context) => {
      // Rollback on error
      if (context?.previousDelivery) {
        queryClient.setQueryData(queryKeys.deliveries.detail(context.deliveryId), context.previousDelivery)
      }
      if (context?.previousDeliveries) {
        queryClient.setQueryData(queryKeys.deliveries.lists(), context.previousDeliveries)
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      const deliveryId = variables.id
      queryClient.invalidateQueries({ queryKey: getInvalidationKeys.delivery(deliveryId) })
    },
  })
}

// Schedule delivery mutation (assign staff)
export const useScheduleDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & ScheduleDeliveryRequest) => 
      deliveryService.scheduleDelivery(id, data),
    onSuccess: (data, variables) => {
      // Update queries on success
      const deliveryId = variables.id
      queryClient.setQueryData(queryKeys.deliveries.detail(deliveryId), data)
      queryClient.invalidateQueries({ queryKey: getInvalidationKeys.delivery(deliveryId) })
    },
    onError: (error: ApiError) => {
      console.error('Failed to schedule delivery:', error.message)
    },
  })
}

// Delete delivery mutation
export const useDeleteDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deliveryService.deleteDelivery(id),
    onMutate: async (deliveryId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.deliveries.lists() })

      // Snapshot previous value
      const previousDeliveries = queryClient.getQueryData(queryKeys.deliveries.lists())

      // Optimistically remove delivery from lists
      queryClient.setQueryData(queryKeys.deliveries.lists(), (old: any) => {
        if (!old) return old
        return old.filter((delivery: Delivery) => delivery.id !== deliveryId)
      })

      return { previousDeliveries, deliveryId }
    },
    onError: (err, deliveryId, context) => {
      // Rollback on error
      if (context?.previousDeliveries) {
        queryClient.setQueryData(queryKeys.deliveries.lists(), context.previousDeliveries)
      }
    },
    onSettled: (data, error, deliveryId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: getInvalidationKeys.delivery(deliveryId) })
      // Remove the specific delivery detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.deliveries.detail(deliveryId) })
    },
  })
}

// Custom statistics hook for delivery analytics
export const useDeliveryStats = () => {
  const { data: allDeliveries = [] } = useDeliveries()
  
  return useQuery({
    queryKey: ['delivery-stats', allDeliveries?.length],
    queryFn: () => {
      const stats = {
        total: allDeliveries.length,
        pickup: allDeliveries.filter(d => d.delivery_type === 'pickup').length,
        home: allDeliveries.filter(d => d.delivery_type === 'home').length,
        scheduled: allDeliveries.filter(d => d.status === 'scheduled').length,
        inTransit: allDeliveries.filter(d => d.status === 'in_transit').length,
        delivered: allDeliveries.filter(d => d.status === 'delivered').length,
        cancelled: allDeliveries.filter(d => d.status === 'cancelled').length,
        overdue: allDeliveries.filter(d => d.is_overdue).length,
        totalFees: allDeliveries.reduce((sum, d) => sum + parseFloat(d.delivery_fee || '0'), 0),
        averageDeliveryTime: '01:30:00', // Could be calculated from data
      }
      return stats
    },
    enabled: allDeliveries.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  })
}