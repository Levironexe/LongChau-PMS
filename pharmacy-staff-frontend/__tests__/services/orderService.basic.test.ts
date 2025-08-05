import { describe, it, expect, beforeEach } from '@jest/globals'
import { api } from '@/lib/api'
import { orderService } from '@/lib/services/orderService'

// Mock the entire api module
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  createQueryParams: jest.fn()
}))

const mockedApi = jest.mocked(api)
const mockedCreateQueryParams = jest.mocked(require('@/lib/api').createQueryParams)

describe('OrderService - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, customer_name: 'John Doe', total_amount: '99.99', status: 'pending' }
          ]
        }
      }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrders()

      expect(mockedApi.get).toHaveBeenCalledWith('/orders/')
      expect(result).toEqual(mockResponse.data.results)
    })

    it('should handle empty results', async () => {
      const mockResponse = { data: { results: null } }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrders()

      expect(result).toEqual([])
    })
  })

  describe('getOrder', () => {
    it('should fetch single order by ID', async () => {
      const mockResponse = {
        data: { id: 1, customer_name: 'John Doe', total_amount: '99.99' }
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrder(1)

      expect(mockedApi.get).toHaveBeenCalledWith('/orders/1/')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        customer: 1,
        order_type: 'in_store',
        total_amount: '99.99'
      }

      const mockResponse = {
        data: { id: 1, ...orderData, status: 'pending' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.createOrder(orderData as any)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/', orderData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateOrder', () => {
    it('should update order with PUT request', async () => {
      const updateData = { id: 1, status: 'processing' }
      const mockResponse = {
        data: { id: 1, status: 'processing', customer_name: 'John Doe' }
      }

      mockedApi.put.mockResolvedValue(mockResponse)

      const result = await orderService.updateOrder(updateData as any)

      expect(mockedApi.put).toHaveBeenCalledWith('/orders/1/', { status: 'processing' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('patchOrder', () => {
    it('should patch order successfully', async () => {
      const updateData = { id: 1, status: 'completed' }
      const mockResponse = {
        data: { id: 1, status: 'completed' }
      }

      mockedApi.patch.mockResolvedValue(mockResponse)

      const result = await orderService.patchOrder(updateData as any)

      expect(mockedApi.patch).toHaveBeenCalledWith('/orders/1/', { status: 'completed' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('transitionOrder', () => {
    it('should transition order status', async () => {
      const mockResponse = {
        data: { id: 1, status: 'processing' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.transitionOrder(1, 'processing')

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/transition/', { status: 'processing' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('processOrder', () => {
    it('should process order with action', async () => {
      const mockResponse = {
        data: { id: 1, status: 'processing' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.processOrder(1, 'fulfill')

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/process/', { action: 'fulfill' })
      expect(result).toEqual(mockResponse.data)
    })

    it('should process order without action', async () => {
      const mockResponse = {
        data: { id: 1, status: 'processing' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.processOrder(1)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/process/', {})
      expect(result).toEqual(mockResponse.data)
    })
  })
})