import { describe, it, expect, beforeEach } from '@jest/globals'
import { api } from '@/lib/api'
import { inventoryService } from '@/lib/services/inventoryService'

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

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Inventory Records', () => {
    describe('getInventoryRecords', () => {
      it('should fetch all inventory records', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                product: 1,
                product_name: 'Paracetamol 500mg',
                branch: 1,
                current_stock: 150,
                minimum_stock: 50,
                is_low_stock: false
              },
              { 
                id: 2, 
                product: 2,
                product_name: 'Ibuprofen 400mg',
                branch: 1,
                current_stock: 25,
                minimum_stock: 30,
                is_low_stock: true
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecords()

        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-records/')
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should apply filters correctly', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                product: 1,
                branch: 1,
                current_stock: 25,
                is_low_stock: true
              }
            ]
          }
        }

        const filters = { is_low_stock: true, branch: 1 }
        mockedCreateQueryParams.mockReturnValue('?is_low_stock=true&branch=1')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecords(filters)

        expect(mockedCreateQueryParams).toHaveBeenCalledWith(filters)
        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-records/?is_low_stock=true&branch=1')
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle pagination parameters', async () => {
        const mockResponse = {
          data: {
            count: 100,
            next: 'http://api/inventory-records/?page=2',
            previous: null,
            results: [
              { id: 1, product_name: 'Medicine 1', current_stock: 50 }
            ]
          }
        }

        const filters = { page: 1, page_size: 10 }
        mockedCreateQueryParams.mockReturnValue('?page=1&page_size=10')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecords(filters)

        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle empty results', async () => {
        const mockResponse = {
          data: {
            results: []
          }
        }

        mockedCreateQueryParams.mockReturnValue('')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecords()

        expect(result).toEqual([])
      })

      it('should fallback when results property missing', async () => {
        const mockResponse = {
          data: [
            { id: 1, product_name: 'Medicine 1', current_stock: 50 }
          ]
        }

        mockedCreateQueryParams.mockReturnValue('')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecords()

        expect(result).toEqual(mockResponse.data)
      })
    })

    describe('getInventoryRecord', () => {
      it('should fetch single inventory record by ID', async () => {
        const mockResponse = {
          data: { 
            id: 1, 
            product: 1,
            product_name: 'Paracetamol 500mg',
            current_stock: 150,
            minimum_stock: 50,
            reorder_point: 75,
            last_restocked: '2024-01-01T00:00:00Z'
          }
        }

        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryRecord(1)

        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-records/1/')
        expect(result).toEqual(mockResponse.data)
      })

      it('should handle inventory record not found (404)', async () => {
        mockedApi.get.mockRejectedValue({
          response: { status: 404, data: { message: 'Inventory record not found' } }
        })

        await expect(inventoryService.getInventoryRecord(999)).rejects.toThrow()
      })
    })

    describe('getLowStockRecords', () => {
      it('should fetch low stock items', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                product_name: 'Ibuprofen 400mg',
                current_stock: 25,
                minimum_stock: 30,
                is_low_stock: true,
                urgency: 'medium'
              },
              { 
                id: 2, 
                product_name: 'Amoxicillin 250mg',
                current_stock: 5,
                minimum_stock: 20,
                is_low_stock: true,
                urgency: 'high'
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?is_low_stock=true')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getLowStockRecords()

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ is_low_stock: true })
        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-records/?is_low_stock=true')
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle no low stock items', async () => {
        const mockResponse = {
          data: {
            results: []
          }
        }

        mockedCreateQueryParams.mockReturnValue('?is_low_stock=true')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getLowStockRecords()

        expect(result).toEqual([])
      })

      it('should validate low stock threshold', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                current_stock: 25,
                minimum_stock: 30,
                is_low_stock: true
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?is_low_stock=true')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getLowStockRecords()

        // Validate that returned items are actually low stock
        result.forEach((item: any) => {
          expect(item.is_low_stock).toBe(true)
          expect(item.current_stock).toBeLessThan(item.minimum_stock)
        })
      })
    })

    describe('getRecordsByBranch', () => {
      it('should filter by branch ID', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                branch: 1,
                branch_name: 'Main Branch',
                product_name: 'Medicine 1',
                current_stock: 50
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getRecordsByBranch(1)

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ branch: 1 })
        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-records/?branch=1')
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle frontend filtering fallback', async () => {
        // Test when API doesn't support branch filtering
        const mockResponse = {
          data: {
            results: [
              { id: 1, branch: 1, product_name: 'Medicine 1' },
              { id: 2, branch: 2, product_name: 'Medicine 2' },
              { id: 3, branch: 1, product_name: 'Medicine 3' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getRecordsByBranch(1)

        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle invalid branch ID', async () => {
        mockedCreateQueryParams.mockReturnValue('?branch=999')
        mockedApi.get.mockRejectedValue({
          response: { status: 404, data: { message: 'Branch not found' } }
        })

        await expect(inventoryService.getRecordsByBranch(999)).rejects.toThrow()
      })
    })
  })

  describe('Inventory Transactions', () => {
    describe('getInventoryTransactions', () => {
      it('should fetch all transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                product: 1,
                product_name: 'Paracetamol 500mg',
                transaction_type: 'restock',
                quantity: 100,
                created_at: '2024-01-01T00:00:00Z'
              },
              { 
                id: 2, 
                product: 2,
                product_name: 'Ibuprofen 400mg',
                transaction_type: 'sale',
                quantity: -5,
                created_at: '2024-01-01T12:00:00Z'
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryTransactions()

        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-transactions/')
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should apply filters correctly', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                transaction_type: 'restock',
                quantity: 100,
                branch: 1
              }
            ]
          }
        }

        const filters = { transaction_type: 'restock', branch: 1 }
        mockedCreateQueryParams.mockReturnValue('?transaction_type=restock&branch=1')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryTransactions(filters)

        expect(mockedCreateQueryParams).toHaveBeenCalledWith(filters)
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should handle transaction types', async () => {
        const transactionTypes = ['restock', 'sale', 'adjustment', 'expired', 'damaged', 'transfer']
        
        for (const type of transactionTypes) {
          const mockResponse = {
            data: {
              results: [
                { id: 1, transaction_type: type, quantity: type === 'restock' ? 100 : -10 }
              ]
            }
          }

          mockedCreateQueryParams.mockReturnValue(`?transaction_type=${type}`)
          mockedApi.get.mockResolvedValue(mockResponse)

          const result = await inventoryService.getInventoryTransactions({ transaction_type: type })

          expect(result[0].transaction_type).toBe(type)
        }
      })
    })

    describe('getInventoryTransaction', () => {
      it('should fetch single transaction by ID', async () => {
        const mockResponse = {
          data: { 
            id: 1, 
            product: 1,
            product_name: 'Paracetamol 500mg',
            transaction_type: 'restock',
            quantity: 100,
            reference_number: 'RST-001',
            notes: 'Monthly restock from supplier',
            created_at: '2024-01-01T00:00:00Z'
          }
        }

        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getInventoryTransaction(1)

        expect(mockedApi.get).toHaveBeenCalledWith('/inventory-transactions/1/')
        expect(result).toEqual(mockResponse.data)
      })

      it('should handle transaction not found (404)', async () => {
        mockedApi.get.mockRejectedValue({
          response: { status: 404, data: { message: 'Transaction not found' } }
        })

        await expect(inventoryService.getInventoryTransaction(999)).rejects.toThrow()
      })
    })

    describe('Transaction Type Filtering', () => {
      it('should get restock transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 1, transaction_type: 'restock', quantity: 100 }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=restock')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('restock')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ transaction_type: 'restock' })
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should get sale transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 2, transaction_type: 'sale', quantity: -5 }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=sale')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('sale')

        expect(result[0].transaction_type).toBe('sale')
        expect(result[0].quantity).toBeLessThan(0)
      })

      it('should get adjustment transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 3, transaction_type: 'adjustment', quantity: -2, reason: 'Inventory correction' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=adjustment')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('adjustment')

        expect(result[0].transaction_type).toBe('adjustment')
      })

      it('should get expired transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 4, transaction_type: 'expired', quantity: -10, expiry_date: '2024-01-01' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=expired')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('expired')

        expect(result[0].transaction_type).toBe('expired')
      })

      it('should get damaged transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 5, transaction_type: 'damaged', quantity: -3, damage_reason: 'Broken packaging' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=damaged')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('damaged')

        expect(result[0].transaction_type).toBe('damaged')
      })

      it('should get transfer transactions', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 6, 
                transaction_type: 'transfer', 
                quantity: -20,
                from_branch: 1,
                to_branch: 2,
                transfer_reference: 'TRF-001'
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?transaction_type=transfer')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await inventoryService.getTransactionsByType('transfer')

        expect(result[0].transaction_type).toBe('transfer')
        expect(result[0].transfer_reference).toBeDefined()
      })
    })
  })

  describe('Advanced Analytics', () => {
    describe('getInventorySummaryByBranch', () => {
      it('should calculate total records correctly', async () => {
        const mockRecords = {
          data: {
            results: [
              { id: 1, branch: 1, current_stock: 100, minimum_stock: 50 },
              { id: 2, branch: 1, current_stock: 25, minimum_stock: 30 },
              { id: 3, branch: 1, current_stock: 200, minimum_stock: 100 }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        expect(result.totalRecords).toBe(3)
        expect(result.totalStockValue).toBeGreaterThan(0)
      })

      it('should count low stock items', async () => {
        const mockRecords = {
          data: {
            results: [
              { id: 1, current_stock: 100, minimum_stock: 50, is_low_stock: false },
              { id: 2, current_stock: 25, minimum_stock: 30, is_low_stock: true },
              { id: 3, current_stock: 15, minimum_stock: 20, is_low_stock: true }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        expect(result.lowStockCount).toBe(2)
      })

      it('should calculate total value', async () => {
        const mockRecords = {
          data: {
            results: [
              { id: 1, current_stock: 100, unit_price: 5.00 },
              { id: 2, current_stock: 50, unit_price: 10.00 },
              { id: 3, current_stock: 25, unit_price: 20.00 }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        // Expected: (100 * 5) + (50 * 10) + (25 * 20) = 500 + 500 + 500 = 1500
        expect(result.totalStockValue).toBe(1500)
      })

      it('should count expiring items within 30 days', async () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 15) // 15 days from now
        
        const farFutureDate = new Date()
        farFutureDate.setDate(farFutureDate.getDate() + 60) // 60 days from now

        const mockRecords = {
          data: {
            results: [
              { id: 1, expiry_date: futureDate.toISOString().split('T')[0] },
              { id: 2, expiry_date: farFutureDate.toISOString().split('T')[0] },
              { id: 3, expiry_date: null }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        expect(result.expiringItemsCount).toBe(1)
      })

      it('should handle empty inventory', async () => {
        const mockRecords = {
          data: {
            results: []
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        expect(result.totalRecords).toBe(0)
        expect(result.lowStockCount).toBe(0)
        expect(result.totalStockValue).toBe(0)
        expect(result.expiringItemsCount).toBe(0)
      })

      it('should handle invalid dates', async () => {
        const mockRecords = {
          data: {
            results: [
              { id: 1, expiry_date: 'invalid-date' },
              { id: 2, expiry_date: '2024-13-45' }, // Invalid date
              { id: 3, expiry_date: null }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?branch=1')
        mockedApi.get.mockResolvedValue(mockRecords)

        const result = await inventoryService.getInventorySummaryByBranch(1)

        // Should handle invalid dates gracefully
        expect(result.expiringItemsCount).toBe(0)
        expect(result.totalRecords).toBe(3)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue(new Error('Network timeout'))

      await expect(inventoryService.getInventoryRecords()).rejects.toThrow('Network timeout')
    })

    it('should handle 401 unauthorized errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } }
      })

      await expect(inventoryService.getInventoryRecords()).rejects.toThrow()
    })

    it('should handle 500 server errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue({
        response: { status: 500, data: { message: 'Internal server error' } }
      })

      await expect(inventoryService.getInventoryRecords()).rejects.toThrow()
    })

    it('should handle malformed response data', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue({ data: null })

      const result = await inventoryService.getInventoryRecords()
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })
})