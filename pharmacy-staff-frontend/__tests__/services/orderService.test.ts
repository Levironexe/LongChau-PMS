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

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrders', () => {
    it('should fetch orders without filters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, customer_name: 'John Doe', total_amount: '99.99', status: 'pending' },
            { id: 2, customer_name: 'Jane Smith', total_amount: '149.99', status: 'processing' }
          ]
        }
      }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrders()

      expect(mockedApi.get).toHaveBeenCalledWith('/orders/')
      expect(result).toEqual(mockResponse.data.results)
    })

    it('should fetch orders with filters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, customer_name: 'John Doe', order_type: 'prescription', status: 'pending' }
          ]
        }
      }

      const filters = { order_type: 'prescription', status: 'pending' }
      mockedCreateQueryParams.mockReturnValue('?order_type=prescription&status=pending')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrders(filters)

      expect(mockedCreateQueryParams).toHaveBeenCalledWith(filters)
      expect(mockedApi.get).toHaveBeenCalledWith('/orders/?order_type=prescription&status=pending')
      expect(result).toEqual(mockResponse.data.results)
    })

    it('should handle API response without results array', async () => {
      const mockResponse = {
        data: [
          { id: 1, customer_name: 'John Doe', total_amount: '99.99' }
        ]
      }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrders()

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle network errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue(new Error('Network timeout'))

      await expect(orderService.getOrders()).rejects.toThrow('Network timeout')
    })

    it('should handle 401 unauthorized errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } }
      })

      await expect(orderService.getOrders()).rejects.toThrow()
    })
  })

  describe('getOrder', () => {
    it('should fetch single order by ID', async () => {
      const mockResponse = {
        data: { id: 1, customer_name: 'John Doe', total_amount: '99.99', status: 'pending' }
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.getOrder(1)

      expect(mockedApi.get).toHaveBeenCalledWith('/orders/1/')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle order not found (404)', async () => {
      mockedApi.get.mockRejectedValue({
        response: { status: 404, data: { message: 'Order not found' } }
      })

      await expect(orderService.getOrder(999)).rejects.toThrow()
    })

    it('should handle invalid ID parameter', async () => {
      await expect(orderService.getOrder(null as any)).rejects.toThrow()
    })
  })

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        customer: 1,
        order_type: 'in_store',
        total_amount: '99.99',
        order_items: []
      }

      const mockResponse = {
        data: { id: 1, ...orderData, status: 'pending', order_date: '2024-01-01T00:00:00Z' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.createOrder(orderData)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/', orderData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation errors (400)', async () => {
      const orderData = {
        customer: null,
        order_type: 'invalid_type',
        total_amount: 'invalid_amount'
      }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            customer: ['This field is required'],
            order_type: ['Invalid choice'],
            total_amount: ['Invalid decimal format']
          }
        }
      })

      await expect(orderService.createOrder(orderData as any)).rejects.toThrow()
    })

    it('should handle missing required fields', async () => {
      const orderData = {}

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            customer: ['This field is required'],
            order_type: ['This field is required']
          }
        }
      })

      await expect(orderService.createOrder(orderData as any)).rejects.toThrow()
    })
  })

  describe('updateOrder', () => {
    it('should update order with PATCH request', async () => {
      const updateData = { status: 'processing', notes: 'Updated order' }
      const mockResponse = {
        data: { id: 1, ...updateData, customer_name: 'John Doe' }
      }

      mockedApi.patch.mockResolvedValue(mockResponse)

      const result = await orderService.updateOrder(1, updateData)

      expect(mockedApi.patch).toHaveBeenCalledWith('/orders/1/', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle partial updates', async () => {
      const updateData = { status: 'completed' }
      const mockResponse = {
        data: { id: 1, status: 'completed', customer_name: 'John Doe' }
      }

      mockedApi.patch.mockResolvedValue(mockResponse)

      const result = await orderService.updateOrder(1, updateData)

      expect(mockedApi.patch).toHaveBeenCalledWith('/orders/1/', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should validate ID parameter', async () => {
      await expect(orderService.updateOrder(null as any, {})).rejects.toThrow()
    })
  })

  describe('transitionOrder', () => {
    it('should transition order status using state pattern', async () => {
      const transitionData = { action: 'process', notes: 'Processing order' }
      const mockResponse = {
        data: { 
          id: 1, 
          status: 'processing',
          previous_status: 'pending',
          transition_message: 'Order successfully transitioned to processing'
        }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.transitionOrder(1, transitionData)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/transition/', transitionData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should reject invalid state transitions', async () => {
      const transitionData = { action: 'invalid_action' }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Invalid transition from pending to invalid_action',
            valid_transitions: ['process', 'cancel']
          }
        }
      })

      await expect(orderService.transitionOrder(1, transitionData)).rejects.toThrow()
    })

    it('should handle state validation errors', async () => {
      const transitionData = { action: 'complete' }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Cannot complete order without processing first'
          }
        }
      })

      await expect(orderService.transitionOrder(1, transitionData)).rejects.toThrow()
    })
  })

  describe('processOrder', () => {
    it('should process order with action using strategy pattern', async () => {
      const processData = { action: 'fulfill', priority: 'high' }
      const mockResponse = {
        data: { 
          id: 1, 
          status: 'processing',
          processing_strategy: 'high_priority_fulfillment',
          estimated_completion: '2024-01-01T12:00:00Z'
        }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.processOrder(1, processData)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/process/', processData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should process order without action', async () => {
      const mockResponse = {
        data: { 
          id: 1, 
          status: 'processing',
          processing_strategy: 'standard_fulfillment'
        }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await orderService.processOrder(1)

      expect(mockedApi.post).toHaveBeenCalledWith('/orders/1/process/', undefined)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle processing errors', async () => {
      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Order cannot be processed in current state'
          }
        }
      })

      await expect(orderService.processOrder(1, {})).rejects.toThrow()
    })
  })

  describe('calculateTotal', () => {
    it('should calculate order total correctly', async () => {
      const mockResponse = {
        data: { 
          subtotal: '89.99',
          tax: '9.00',
          discount: '5.00',
          total: '93.99',
          breakdown: {
            items_total: '89.99',
            tax_rate: '10%',
            discount_applied: '5.56%'
          }
        }
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.calculateTotal(1)

      expect(mockedApi.get).toHaveBeenCalledWith('/orders/1/calculate-total/')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle empty orders', async () => {
      const mockResponse = {
        data: { 
          subtotal: '0.00',
          tax: '0.00',
          discount: '0.00',
          total: '0.00'
        }
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await orderService.calculateTotal(1)

      expect(result.total).toBe('0.00')
    })

    it('should handle invalid order ID', async () => {
      mockedApi.get.mockRejectedValue({
        response: { status: 404, data: { message: 'Order not found' } }
      })

      await expect(orderService.calculateTotal(999)).rejects.toThrow()
    })
  })

  describe('deleteOrder', () => {
    it('should delete order by ID', async () => {
      mockedApi.delete.mockResolvedValue({ data: {} })

      await orderService.deleteOrder(1)

      expect(mockedApi.delete).toHaveBeenCalledWith('/orders/1/')
    })

    it('should handle order not found for deletion', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { status: 404, data: { message: 'Order not found' } }
      })

      await expect(orderService.deleteOrder(999)).rejects.toThrow()
    })

    it('should handle deletion conflicts', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Cannot delete order with active deliveries'
          }
        }
      })

      await expect(orderService.deleteOrder(1)).rejects.toThrow()
    })
  })

  describe('Convenience Methods', () => {
    describe('getOrdersByType', () => {
      it('should get prescription orders', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 1, order_type: 'prescription', customer_name: 'John Doe' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?order_type=prescription')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await orderService.getOrdersByType('prescription')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ order_type: 'prescription' })
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should get in-store orders', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 2, order_type: 'in_store', customer_name: 'Jane Smith' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?order_type=in_store')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await orderService.getOrdersByType('in_store')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ order_type: 'in_store' })
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should get online orders', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 3, order_type: 'online', customer_name: 'Bob Johnson' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?order_type=online')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await orderService.getOrdersByType('online')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ order_type: 'online' })
        expect(result).toEqual(mockResponse.data.results)
      })
    })

    describe('getOrdersByStatus', () => {
      it('should get pending orders', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 1, status: 'pending', customer_name: 'John Doe' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?status=pending')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await orderService.getOrdersByStatus('pending')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ status: 'pending' })
        expect(result).toEqual(mockResponse.data.results)
      })
    })
  })
})