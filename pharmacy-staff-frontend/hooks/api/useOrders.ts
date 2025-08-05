import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, OrderFilters } from '@/lib/queryKeys'
import { orderService, CreateOrderParams, UpdateOrderParams, TransitionOrderParams, ProcessOrderParams } from '@/lib/services/orderService'
import { Order } from '@/lib/types'
import { ApiError } from '@/lib/api'

// Query Hooks (GET operations)

// Get all orders with filtering
export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters || {}),
    queryFn: () => orderService.getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for orders)
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single order
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })
}

// Get orders by type (convenience hook)
export const useOrdersByType = (orderType: Order['order_type']) => {
  return useQuery({
    queryKey: queryKeys.orders.list({ order_type: orderType }),
    queryFn: () => orderService.getOrdersByType(orderType),
    staleTime: 2 * 60 * 1000,
  })
}

// Get orders by status (convenience hook)
export const useOrdersByStatus = (status: Order['status']) => {
  return useQuery({
    queryKey: queryKeys.orders.list({ status }),
    queryFn: () => orderService.getOrdersByStatus(status),
    staleTime: 1 * 60 * 1000, // 1 minute for status-specific queries
  })
}

// Get available transitions for an order
export const useAvailableTransitions = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.transitions(id),
    queryFn: () => orderService.getAvailableTransitions(id),
    enabled: !!id && id > 0,
    staleTime: 30 * 1000, // 30 seconds (state transitions change frequently)
  })
}

// Get order total calculation
export const useOrderTotal = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.total(id),
    queryFn: () => orderService.calculateTotal(id),
    enabled: !!id && id > 0,
    staleTime: 1 * 60 * 1000,
  })
}

// Mutation Hooks (POST/PUT/DELETE operations)

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateOrderParams) => orderService.createOrder(data),
    
    // Optimistic update
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.lists() })
      
      const previousOrders = queryClient.getQueryData(queryKeys.orders.lists())
      
      // Optimistically add new order
      queryClient.setQueryData(queryKeys.orders.lists(), (old: Order[] = []) => [
        {
          ...newOrder,
          id: Date.now(), // Temporary ID
          customer: newOrder.customer,
          customer_name: '', // Will be filled by server
          total_amount: '0.00',
          status: 'pending' as Order['status'],
          order_date: new Date().toISOString(),
          items: [],
          available_transitions: ['processing', 'cancelled'],
        } as Order,
        ...old,
      ])
      
      return { previousOrders }
    },
    
    onError: (err: ApiError, newOrder, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.lists(), context.previousOrders)
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.order(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update order mutation
export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateOrderParams) => orderService.patchOrder(data),
    
    onSuccess: (updatedOrder) => {
      // Update specific order in cache
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder.id), updatedOrder)
      
      // Update order in any lists that might contain this order
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.lists() },
        (oldData: Order[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.order(updatedOrder.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Transition order mutation (State Pattern)
export const useTransitionOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: TransitionOrderParams) => orderService.transitionOrder(id, status),
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(id) })
      
      const previousOrder = queryClient.getQueryData(queryKeys.orders.detail(id))
      
      // Optimistically update order status
      queryClient.setQueryData(queryKeys.orders.detail(id), (old: Order | undefined) => {
        if (!old) return old
        return { ...old, status }
      })
      
      return { previousOrder }
    },
    
    onError: (err, { id }, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(queryKeys.orders.detail(id), context.previousOrder)
      }
    },
    
    onSuccess: (updatedOrder) => {
      // Update order in all relevant queries
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder.id), updatedOrder)
      
      getInvalidationKeys.order(updatedOrder.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Process order mutation (Strategy Pattern)
export const useProcessOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, action }: ProcessOrderParams) => orderService.processOrder(id, action),
    
    onSuccess: (processedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(processedOrder.id), processedOrder)
      
      getInvalidationKeys.order(processedOrder.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete order mutation
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderId: number) => orderService.deleteOrder(orderId),
    
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.lists() })
      
      const previousOrders = queryClient.getQueryData(queryKeys.orders.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.orders.lists(), (old: Order[] = []) =>
        old.filter(order => order.id !== orderId)
      )
      
      return { previousOrders }
    },
    
    onError: (err, orderId, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.lists(), context.previousOrders)
      }
    },
    
    onSuccess: (_, orderId) => {
      // Remove order from cache
      queryClient.removeQueries({ queryKey: queryKeys.orders.detail(orderId) })
      
      // Invalidate all related queries
      getInvalidationKeys.order().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Custom hook for order statistics
export const useOrderStats = () => {
  const ordersQuery = useOrders()
  
  if (!ordersQuery.data) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      prescriptionOrders: 0,
      inStoreOrders: 0,
      onlineOrders: 0,
      isLoading: ordersQuery.isLoading,
      error: ordersQuery.error,
    }
  }
  
  const orders = ordersQuery.data
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const processingOrders = orders.filter(o => o.status === 'processing')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')
  
  const totalRevenue = completedOrders.reduce((sum, order) => 
    sum + parseFloat(order.total_amount), 0
  )
  
  const prescriptionOrders = orders.filter(o => o.order_type === 'prescription')
  const inStoreOrders = orders.filter(o => o.order_type === 'in_store')
  const onlineOrders = orders.filter(o => o.order_type === 'online')
  
  return {
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    processingOrders: processingOrders.length,
    completedOrders: completedOrders.length,
    cancelledOrders: cancelledOrders.length,
    totalRevenue,
    prescriptionOrders: prescriptionOrders.length,
    inStoreOrders: inStoreOrders.length,
    onlineOrders: onlineOrders.length,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
  }
}