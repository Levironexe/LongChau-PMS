import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { inventoryService } from '@/lib/services/inventoryService'
import { queryKeys } from '@/lib/queryKeys'
import type {
  InventoryRecord,
  InventoryTransaction,
  InventoryRecordFilters,
  InventoryTransactionFilters,
} from '@/lib/types'
import type {
  GetInventoryRecordsParams,
  GetInventoryTransactionsParams,
  GetRecordsByBranchParams,
  GetTransactionsByTypeParams,
  SearchInventoryRecordsParams,  
  SearchInventoryTransactionsParams,
} from '@/lib/services/inventoryService'

// INVENTORY RECORDS HOOKS

/**
 * Get all inventory records with optional filtering
 * @param filters - Optional filters for inventory records
 * @returns Query result for inventory records list
 */
export const useInventoryRecords = (filters?: InventoryRecordFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.records.list(filters),
    queryFn: () => inventoryService.getInventoryRecords(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - inventory changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Get single inventory record by ID
 * @param id - Inventory record ID
 * @returns Query result for single inventory record
 */
export const useInventoryRecord = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.records.detail(id),
    queryFn: () => inventoryService.getInventoryRecord(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

/**
 * Get low stock inventory records
 * @returns Query result for low stock items
 */
export const useLowStockRecords = () => {
  return useQuery({
    queryKey: queryKeys.inventory.records.lowStock(),
    queryFn: () => inventoryService.getLowStockRecords(),
    staleTime: 1 * 60 * 1000, // 1 minute - low stock is critical
    retry: 3,
  })
}

/**
 * Get inventory records by branch
 * @param branchId - Branch ID to filter by
 * @returns Query result for branch inventory records
 */
export const useInventoryRecordsByBranch = (branchId: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.records.byBranch(branchId),
    queryFn: () => inventoryService.getRecordsByBranch(branchId),
    enabled: !!branchId && branchId > 0,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get inventory records by product (medicine, supplement, or medical device)
 * @param productId - Product ID
 * @param productType - Type of product (medicine, supplement, medical_device)
 * @returns Query result for product inventory records
 */
export const useInventoryRecordsByProduct = (
  productId: number,
  productType: 'medicine' | 'supplement' | 'medical_device'
) => {
  return useQuery({
    queryKey: ['inventory', 'records', 'product', productId, productType],
    queryFn: () => {
      switch (productType) {
        case 'medicine':
          return inventoryService.getRecordsByMedicine(productId)
        case 'supplement':
          return inventoryService.getRecordsBySupplement(productId)
        case 'medical_device':
          return inventoryService.getRecordsByMedicalDevice(productId)
        default:
          throw new Error(`Unknown product type: ${productType}`)
      }
    },
    enabled: !!productId && productId > 0 && !!productType,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get records below minimum stock levels
 * @returns Query result for records below minimum stock
 */
export const useBelowMinimumStock = () => {
  return useQuery({
    queryKey: ['inventory', 'records', 'below-minimum'],
    queryFn: () => inventoryService.getBelowMinimumStock(),
    staleTime: 1 * 60 * 1000, // 1 minute - critical for restocking
    retry: 3,
  })
}

/**
 * Get expiring inventory records
 * @param beforeDate - Date to check expiration before
 * @returns Query result for expiring records
 */
export const useExpiringRecords = (beforeDate?: string) => {
  return useQuery({
    queryKey: ['inventory', 'records', 'expiring', beforeDate],
    queryFn: () => inventoryService.getExpiringRecords(beforeDate!),
    enabled: !!beforeDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

// INVENTORY TRANSACTIONS HOOKS

/**
 * Get all inventory transactions with optional filtering
 * @param filters - Optional filters for inventory transactions
 * @returns Query result for inventory transactions list
 */
export const useInventoryTransactions = (filters?: InventoryTransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.transactions.list(filters),
    queryFn: () => inventoryService.getInventoryTransactions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - transaction history is more stable
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Get single inventory transaction by ID
 * @param id - Inventory transaction ID
 * @returns Query result for single inventory transaction
 */
export const useInventoryTransaction = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.transactions.detail(id),
    queryFn: () => inventoryService.getInventoryTransaction(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get inventory transactions by type
 * @param transactionType - Type of transaction to filter by
 * @returns Query result for transactions of specific type
 */
export const useInventoryTransactionsByType = (
  transactionType: 'restock' | 'sale' | 'adjustment' | 'expired' | 'damaged' | 'transfer'
) => {
  return useQuery({
    queryKey: queryKeys.inventory.transactions.byType(transactionType),
    queryFn: () => inventoryService.getTransactionsByType(transactionType),
    enabled: !!transactionType,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get inventory transactions by branch
 * @param branchId - Branch ID to filter by
 * @returns Query result for branch inventory transactions
 */
export const useInventoryTransactionsByBranch = (branchId: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.transactions.byBranch(branchId),
    queryFn: () => inventoryService.getInventoryTransactions({ branch: branchId }),
    enabled: !!branchId && branchId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get product transaction history
 * @param productId - Product ID
 * @param productType - Type of product
 * @returns Query result for product transaction history
 */
export const useProductTransactionHistory = (
  productId: number,
  productType: 'medicine' | 'supplement' | 'medical_device'
) => {
  return useQuery({
    queryKey: ['inventory', 'transactions', 'product', productId, productType],
    queryFn: () => inventoryService.getProductTransactionHistory(productId, productType),
    enabled: !!productId && productId > 0 && !!productType,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// SPECIALIZED TRANSACTION HOOKS

/**
 * Get restock transactions only
 * @returns Query result for restock transactions
 */
export const useRestockTransactions = () => {
  return useQuery({
    queryKey: ['inventory', 'transactions', 'type', 'restock'],
    queryFn: () => inventoryService.getRestockTransactions(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get sale transactions only
 * @returns Query result for sale transactions
 */
export const useSaleTransactions = () => {
  return useQuery({
    queryKey: ['inventory', 'transactions', 'type', 'sale'],
    queryFn: () => inventoryService.getSaleTransactions(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Get adjustment transactions only
 * @returns Query result for adjustment transactions
 */
export const useAdjustmentTransactions = () => {
  return useQuery({
    queryKey: ['inventory', 'transactions', 'type', 'adjustment'],
    queryFn: () => inventoryService.getAdjustmentTransactions(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// SEARCH HOOKS

/**
 * Search inventory records
 * @param query - Search query string
 * @returns Query result for search results
 */
export const useSearchInventoryRecords = (query: string) => {
  return useQuery({
    queryKey: ['inventory', 'records', 'search', query],
    queryFn: () => inventoryService.searchInventoryRecords(query),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Search inventory transactions
 * @param query - Search query string
 * @returns Query result for search results
 */
export const useSearchInventoryTransactions = (query: string) => {
  return useQuery({
    queryKey: ['inventory', 'transactions', 'search', query],
    queryFn: () => inventoryService.searchInventoryTransactions(query),
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// STATISTICS AND ANALYTICS HOOKS

/**
 * Get overall inventory statistics
 * @returns Calculated inventory statistics
 */
export const useInventoryStats = () => {
  const inventoryRecordsQuery = useInventoryRecords()
  const lowStockQuery = useLowStockRecords()
  const belowMinimumQuery = useBelowMinimumStock()

  if (!inventoryRecordsQuery.data) {
    return {
      totalRecords: 0,
      totalProducts: 0,
      lowStockItems: 0,
      belowMinimumItems: 0,
      totalStockValue: 0,
      averageStockLevel: 0,
      stockStatusDistribution: {
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
      },
      isLoading: inventoryRecordsQuery.isLoading,
      error: inventoryRecordsQuery.error,
    }
  }

  const records = inventoryRecordsQuery.data
  const lowStockItems = lowStockQuery.data?.length || 0
  const belowMinimumItems = belowMinimumQuery.data?.length || 0

  // Calculate statistics
  const totalRecords = records.length
  const totalProducts = new Set(
    records.map(r => r.medicine || r.supplement || r.medical_device).filter(Boolean)
  ).size
  const totalStockValue = records.reduce((sum, record) => {
    const stock = record.current_stock || record.stock_level || 0
    return sum + (stock * 10) // Assuming avg price of 10
  }, 0)
  const averageStockLevel = totalRecords > 0 ? 
    records.reduce((sum, record) => sum + (record.current_stock || 0), 0) / totalRecords : 0

  // Stock status distribution
  const stockStatusDistribution = records.reduce(
    (acc, record) => {
      const status = record.is_low_stock ? 'low_stock' : 'in_stock'
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    { in_stock: 0, low_stock: 0, out_of_stock: 0 } as Record<string, number>
  )

  return {
    totalRecords,
    totalProducts,
    lowStockItems,
    belowMinimumItems,
    totalStockValue,
    averageStockLevel,
    stockStatusDistribution,
    isLoading: inventoryRecordsQuery.isLoading,
    error: inventoryRecordsQuery.error,
  }
}

/**
 * Get branch-specific inventory statistics
 * @param branchId - Branch ID
 * @returns Calculated branch inventory statistics
 */
export const useBranchInventoryStats = (branchId: number) => {
  const branchRecordsQuery = useInventoryRecordsByBranch(branchId)
  const branchTransactionsQuery = useInventoryTransactionsByBranch(branchId)

  console.log('Branch Inventory Stats Debug:', {
    branchId,
    recordsData: branchRecordsQuery.data?.length || 0,
    recordsLoading: branchRecordsQuery.isLoading,
    recordsError: branchRecordsQuery.error,
    firstRecord: branchRecordsQuery.data?.[0]
  })

  if (!branchRecordsQuery.data) {
    return {
      totalRecords: 0,
      totalProducts: 0,
      lowStockItems: 0,
      totalTransactions: 0,
      recentActivity: 0,
      totalStockValue: 0,
      averageStockLevel: 0,
      isLoading: branchRecordsQuery.isLoading,
      error: branchRecordsQuery.error,
    }
  }

  const records = branchRecordsQuery.data
  const transactions = branchTransactionsQuery.data || []

  const totalRecords = records.length
  const totalProducts = new Set(
    records.map(r => r.medicine || r.supplement || r.medical_device).filter(Boolean)
  ).size
  const lowStockItems = records.filter(r => r.is_low_stock).length
  const totalTransactions = transactions.length

  // Since API doesn't provide pricing in inventory records, we can't calculate stock value
  const totalStockValue = 0 // Pricing not available in inventory API
  
  const averageStockLevel = totalRecords > 0 ? 
    records.reduce((sum, record) => sum + (record.current_stock || 0), 0) / totalRecords : 0

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentActivity = transactions.filter(
    t => new Date(t.created_at) >= sevenDaysAgo
  ).length

  return {
    totalRecords,
    totalProducts,
    lowStockItems,
    totalTransactions,
    recentActivity,
    totalStockValue,
    averageStockLevel,
    isLoading: branchRecordsQuery.isLoading,
    error: branchRecordsQuery.error,
  }
}

/**
 * Get low stock analysis statistics
 * @returns Low stock analysis data
 */
export const useLowStockStats = () => {
  const lowStockQuery = useLowStockRecords()
  const belowMinimumQuery = useBelowMinimumStock()

  if (!lowStockQuery.data) {
    return {
      lowStockCount: 0,
      belowMinimumCount: 0,
      criticalItems: 0,
      branchDistribution: {} as Record<string, number>,
      isLoading: lowStockQuery.isLoading,
      error: lowStockQuery.error,
    }
  }

  const lowStockItems = lowStockQuery.data
  const belowMinimumItems = belowMinimumQuery.data || []

  const lowStockCount = lowStockItems.length
  const belowMinimumCount = belowMinimumItems.length
  const criticalItems = lowStockItems.filter(item => item.stock_level === 0).length

  // Branch distribution of low stock items (using branch ID since branch_name might not be available)
  const branchDistribution = lowStockItems.reduce((acc, item) => {
    const branchId = `Branch ${item.branch}`
    acc[branchId] = (acc[branchId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    lowStockCount,
    belowMinimumCount,
    criticalItems,
    branchDistribution,
    isLoading: lowStockQuery.isLoading,
    error: lowStockQuery.error,
  }
}

/**
 * Get inventory value statistics
 * @returns Inventory value analysis
 */
export const useInventoryValueStats = () => {
  const inventoryRecordsQuery = useInventoryRecords()

  if (!inventoryRecordsQuery.data) {
    return {
      totalValue: 0,
      valueByBranch: {} as Record<string, number>,
      valueByStatus: {} as Record<string, number>,
      isLoading: inventoryRecordsQuery.isLoading,
      error: inventoryRecordsQuery.error,
    }
  }

  const records = inventoryRecordsQuery.data

  // Assuming average product value of 10 for calculation
  const AVERAGE_PRODUCT_VALUE = 10

  const totalValue = records.reduce((sum, record) => {
    const stock = record.current_stock || record.stock_level || 0
    return sum + (stock * AVERAGE_PRODUCT_VALUE)
  }, 0)

  // Value by branch (using branch ID since branch_name might not be available)
  const valueByBranch = records.reduce((acc, record) => {
    const branchId = `Branch ${record.branch}`
    const stock = record.current_stock || record.stock_level || 0
    const value = stock * AVERAGE_PRODUCT_VALUE
    acc[branchId] = (acc[branchId] || 0) + value
    return acc
  }, {} as Record<string, number>)

  // Value by stock status
  const valueByStatus = records.reduce((acc, record) => {
    const status = record.is_low_stock ? 'low_stock' : 'in_stock'
    const stock = record.current_stock || record.stock_level || 0
    const value = stock * AVERAGE_PRODUCT_VALUE
    acc[status] = (acc[status] || 0) + value
    return acc
  }, {} as Record<string, number>)

  return {
    totalValue,
    valueByBranch,
    valueByStatus,
    isLoading: inventoryRecordsQuery.isLoading,
    error: inventoryRecordsQuery.error,
  }
}

// EXPORT TYPES FOR CONVENIENCE
export type {
  InventoryRecord,
  InventoryTransaction,
  InventoryRecordFilters,
  InventoryTransactionFilters,
  GetInventoryRecordsParams,
  GetInventoryTransactionsParams,
  GetRecordsByBranchParams,
  GetTransactionsByTypeParams,
  SearchInventoryRecordsParams,
  SearchInventoryTransactionsParams,
}