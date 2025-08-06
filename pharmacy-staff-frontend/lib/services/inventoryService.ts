import { api, createQueryParams } from '../api'
import { 
  InventoryRecord, 
  InventoryTransaction,
  InventoryRecordFilters,
  InventoryTransactionFilters
} from '../types'

// Inventory Service - All inventory-related API calls
export const inventoryService = {
  // Inventory Records Management
  // GET /inventory-records/ - Get all inventory records with filtering
  getInventoryRecords: async (filters?: InventoryRecordFilters): Promise<InventoryRecord[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/inventory-records/${queryString ? `?${queryString}` : ''}`)
    const records = response.data.results || response.data || []
    
    // DEBUG: Log API response details
    console.log('InventoryService.getInventoryRecords:', {
      url: `/inventory-records/${queryString ? `?${queryString}` : ''}`,
      filters,
      responseStatus: response.status,
      totalRecords: records.length,
      rawResponse: response.data,
      sampleRecords: records.slice(0, 3)
    })
    
    return records
  },

  // GET /inventory-records/{id}/ - Get single inventory record
  getInventoryRecord: async (id: number): Promise<InventoryRecord> => {
    const response = await api.get(`/inventory-records/${id}/`)
    return response.data
  },

  // GET /inventory-records/?is_low_stock=true - Get low stock records
  getLowStockRecords: async (): Promise<InventoryRecord[]> => {
    const response = await api.get('/inventory-records/?is_low_stock=true')
    return response.data.results || response.data || []
  },

  // GET /inventory-records/?branch={id} - Get inventory records by branch
  // Note: API currently doesn't filter correctly, so we do frontend filtering
  getRecordsByBranch: async (branchId: number): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory-records/`)
    const allRecords = response.data.results || response.data || []
    const filteredRecords = allRecords.filter((record: InventoryRecord) => record.branch === branchId)
    
    // DEBUG: Log branch filtering details
    console.log('InventoryService.getRecordsByBranch:', {
      branchId,
      url: `/inventory-records/`,
      responseStatus: response.status,
      totalRecordsFromAPI: allRecords.length,
      recordsAfterFiltering: filteredRecords.length,
      sampleAllRecords: allRecords.slice(0, 5),
      sampleFilteredRecords: filteredRecords.slice(0, 5),
      branchIdsInResponse: Array.from(new Set(allRecords.map((r: any) => r.branch))).sort()
    })
    
    return filteredRecords
  },

  // GET /inventory-records/ with medicine filter - Get inventory records for specific medicine
  getRecordsByMedicine: async (medicineId: number): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory-records/?medicine=${medicineId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-records/ with supplement filter - Get inventory records for specific supplement
  getRecordsBySupplement: async (supplementId: number): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory-records/?supplement=${supplementId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-records/ with medical_device filter - Get inventory records for specific medical device
  getRecordsByMedicalDevice: async (deviceId: number): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory-records/?medical_device=${deviceId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-records/ with expiry filtering - Get records expiring soon
  getExpiringRecords: async (beforeDate: string): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory-records/?expiry_date_before=${beforeDate}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-records/ with stock level filtering - Get records below minimum stock
  getBelowMinimumStock: async (): Promise<InventoryRecord[]> => {
    const response = await api.get('/inventory-records/?stock_level_min=0&is_low_stock=true')
    return response.data.results || response.data || []
  },

  // Inventory Transactions Management
  // GET /inventory-transactions/ - Get all inventory transactions with filtering
  getInventoryTransactions: async (filters?: InventoryTransactionFilters): Promise<InventoryTransaction[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/inventory-transactions/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/{id}/ - Get single inventory transaction
  getInventoryTransaction: async (id: number): Promise<InventoryTransaction> => {
    const response = await api.get(`/inventory-transactions/${id}/`)
    return response.data
  },

  // GET /inventory-transactions/?transaction_type={type} - Get transactions by type
  getTransactionsByType: async (transactionType: InventoryTransaction['transaction_type']): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?transaction_type=${transactionType}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/?branch={id} - Get transactions by branch
  getTransactionsByBranch: async (branchId: number): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?branch=${branchId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with medicine filter - Get transactions for specific medicine
  getTransactionsByMedicine: async (medicineId: number): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?medicine=${medicineId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with supplement filter - Get transactions for specific supplement
  getTransactionsBySupplement: async (supplementId: number): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?supplement=${supplementId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with medical_device filter - Get transactions for specific medical device
  getTransactionsByMedicalDevice: async (deviceId: number): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?medical_device=${deviceId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with processed_by filter - Get transactions by staff member
  getTransactionsByStaff: async (staffId: number): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?processed_by=${staffId}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with date range filtering - Get transactions within date range
  getTransactionsByDateRange: async (dateFrom: string, dateTo: string): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?date_from=${dateFrom}&date_to=${dateTo}`)
    return response.data.results || response.data || []
  },

  // GET /inventory-transactions/ with reference filtering - Get transactions by reference number
  getTransactionsByReference: async (referenceNumber: string): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory-transactions/?reference_number=${referenceNumber}`)
    return response.data.results || response.data || []
  },

  // Specialized inventory queries
  // Get restock transactions (positive quantity movements)
  getRestockTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'restock'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Get sale transactions (negative quantity movements)
  getSaleTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'sale'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Get adjustment transactions (manual corrections)
  getAdjustmentTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'adjustment'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Get expired product transactions
  getExpiredTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'expired'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Get damaged product transactions
  getDamagedTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'damaged'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Get transfer transactions (between branches)
  getTransferTransactions: async (branchId?: number): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      transaction_type: 'transfer'
    }
    if (branchId) {
      filters.branch = branchId
    }
    return inventoryService.getInventoryTransactions(filters)
  },

  // Advanced inventory analytics
  // Get inventory summary by branch
  getInventorySummaryByBranch: async (branchId: number): Promise<{
    totalRecords: number
    lowStockCount: number
    totalValue: string
    expiringCount30Days: number
  }> => {
    const [allRecords, lowStockRecords] = await Promise.all([
      inventoryService.getRecordsByBranch(branchId),
      inventoryService.getLowStockRecords()
    ])

    // Calculate 30 days from now for expiring items
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const expiringRecords = allRecords.filter(record => 
      record.expiry_date && new Date(record.expiry_date) <= thirtyDaysFromNow
    )

    // Calculate total value
    const totalValue = allRecords.reduce((sum, record) => {
      return sum + parseFloat(record.total_value || '0')
    }, 0).toString()

    return {
      totalRecords: allRecords.length,
      lowStockCount: lowStockRecords.filter(record => record.branch === branchId).length,
      totalValue,
      expiringCount30Days: expiringRecords.length
    }
  },

  // Get product transaction history for a specific product
  getProductTransactionHistory: async (
    productId: number, 
    productType: 'medicine' | 'supplement' | 'medical_device'
  ): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {}
    
    switch (productType) {
      case 'medicine':
        filters.medicine = productId
        break
      case 'supplement':
        filters.supplement = productId
        break
      case 'medical_device':
        filters.medical_device = productId
        break
    }

    return inventoryService.getInventoryTransactions(filters)
  },

  // Search inventory records with comprehensive filtering
  searchInventoryRecords: async (searchTerm: string, additionalFilters?: Partial<InventoryRecordFilters>): Promise<InventoryRecord[]> => {
    const filters: InventoryRecordFilters = {
      search: searchTerm,
      ...additionalFilters
    }
    return inventoryService.getInventoryRecords(filters)
  },

  // Search inventory transactions with comprehensive filtering
  searchInventoryTransactions: async (searchTerm: string, additionalFilters?: Partial<InventoryTransactionFilters>): Promise<InventoryTransaction[]> => {
    const filters: InventoryTransactionFilters = {
      search: searchTerm,
      ...additionalFilters
    }
    return inventoryService.getInventoryTransactions(filters)
  },
}

// Type for inventory service responses
export type InventoryServiceResponse<T> = {
  data: T
  message?: string
  status: number
}

// Export parameter types for use in hooks
// Inventory Records service parameters
export type GetInventoryRecordsParams = InventoryRecordFilters
export type GetInventoryRecordParams = number
export type GetRecordsByBranchParams = number
export type GetRecordsByProductParams = { productId: number; productType: 'medicine' | 'supplement' | 'medical_device' }
export type GetExpiringRecordsParams = string
export type SearchInventoryRecordsParams = { searchTerm: string; additionalFilters?: Partial<InventoryRecordFilters> }

// Inventory Transactions service parameters
export type GetInventoryTransactionsParams = InventoryTransactionFilters
export type GetInventoryTransactionParams = number
export type GetTransactionsByTypeParams = InventoryTransaction['transaction_type']
export type GetTransactionsByBranchParams = number
export type GetTransactionsByProductParams = { productId: number; productType: 'medicine' | 'supplement' | 'medical_device' }
export type GetTransactionsByStaffParams = number
export type GetTransactionsByDateRangeParams = { dateFrom: string; dateTo: string }
export type GetTransactionsByReferenceParams = string
export type SearchInventoryTransactionsParams = { searchTerm: string; additionalFilters?: Partial<InventoryTransactionFilters> }

// Advanced analytics parameters
export type GetInventorySummaryByBranchParams = number
export type GetProductTransactionHistoryParams = { productId: number; productType: 'medicine' | 'supplement' | 'medical_device' }