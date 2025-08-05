import { describe, it, expect, beforeEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useOrders } from '@/hooks/api/useOrders'

// Mock the service
jest.mock('@/lib/services/orderService', () => ({
  orderService: {
    getOrders: jest.fn(),
  }
}))

const mockOrderService = require('@/lib/services/orderService').orderService

describe('useOrders Hook - Basic Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    })
    jest.clearAllMocks()
  })

  const createWrapper = (client: QueryClient) => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }

  describe('useOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [
        { id: 1, customer_name: 'John Doe', total_amount: '99.99', status: 'pending' },
        { id: 2, customer_name: 'Jane Smith', total_amount: '149.99', status: 'processing' }
      ]

      mockOrderService.getOrders.mockResolvedValue(mockOrders)

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOrders)
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(undefined)
    })

    it('should handle loading state', () => {
      mockOrderService.getOrders.mockReturnValue(new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to fetch orders'
      mockOrderService.getOrders.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error(errorMessage))
      expect(result.current.data).toBeUndefined()
    })

    it('should pass filters to service', async () => {
      const mockOrders = []
      const filters = { status: 'pending', order_type: 'prescription' }

      mockOrderService.getOrders.mockResolvedValue(mockOrders)

      const { result } = renderHook(() => useOrders(filters), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockOrderService.getOrders).toHaveBeenCalledWith(filters)
    })
  })
})