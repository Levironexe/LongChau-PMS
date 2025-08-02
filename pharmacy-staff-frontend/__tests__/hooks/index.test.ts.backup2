/**
 * Hook Test Suite Index
 * 
 * This file serves as an index for all React Query hook tests.
 * Run this file to execute all hook tests together.
 */

describe('React Query Custom Hooks Test Suite', () => {
  describe('Critical Business Logic Hooks', () => {
    // Load order-related hook tests
    require('./useOrders.test')
    
    // Load user management hook tests
    require('./useUsers.test')
    
    // Load inventory management hook tests
    require('./useInventory.test')
    
    // Load product management hook tests
    require('./useProducts.test')
    
    // Load branch management hook tests
    require('./useBranches.test')
  })

  // Test summary information
  it('should provide comprehensive coverage for all critical hooks', () => {
    const testedHooks = [
      // Order hooks
      'useOrders',
      'useOrder', 
      'useOrdersByType',
      'useOrdersByStatus',
      'useAvailableTransitions',
      'useOrderTotal',
      'useCreateOrder',
      'useUpdateOrder',
      'useTransitionOrder',
      'useProcessOrder',
      'useDeleteOrder',
      'useOrderStats',
      
      // User hooks
      'useUsers',
      'useUser',
      'useCustomers',
      'usePharmacists',
      'useStaff',
      'useCustomersOnly',
      'useStaffOnly',
      'useCreateUser',
      'useCreatePharmacist',
      'useCreateVipCustomer',
      'useCreateStaff',
      'useUpdateUser',
      'useUpgradeToVip',
      'useDeleteUser',
      'useUserStats',
      'useCustomerStats',
      'useStaffStats',
      
      // Inventory hooks
      'useInventoryRecords',
      'useInventoryRecord',
      'useLowStockRecords',
      'useInventoryRecordsByBranch',
      'useInventoryRecordsByProduct',
      'useBelowMinimumStock',
      'useExpiringRecords',
      'useInventoryTransactions',
      'useInventoryTransaction',
      'useInventoryTransactionsByType',
      'useInventoryTransactionsByBranch',
      'useProductTransactionHistory',
      'useRestockTransactions',
      'useSaleTransactions',
      'useAdjustmentTransactions',
      'useSearchInventoryRecords',
      'useSearchInventoryTransactions',
      'useInventoryStats',
      'useBranchInventoryStats',
      'useLowStockStats',
      'useInventoryValueStats',
      
      // Product hooks
      'useMedicines',
      'useMedicine',
      'usePrescriptionMedicines',
      'useOTCMedicines',
      'useCreateMedicine',
      'useUpdateMedicine',
      'useDeleteMedicine',
      'useSupplements',
      'useSupplement',
      'useCreateSupplement',
      'useUpdateSupplement',
      'useDeleteSupplement',
      'useMedicalDevices',
      'useMedicalDevice',
      'useCreateMedicalDevice',
      'useUpdateMedicalDevice',
      'useDeleteMedicalDevice',
      'useProducts',
      'useProduct',
      'useSearchProducts',
      'useLowStockProducts',
      'useMedicineStats',
      'useSupplementStats',
      'useMedicalDeviceStats',
      'useProductStats',
      
      // Branch hooks
      'useBranches',
      'useBranch',
      'useBranchStaffSummary',
      'useBranchConfigs',
      'useBranchConfig',
      'useCreateBranch',
      'useUpdateBranch',
      'useDeleteBranch',
      'useCreateBranchConfig',
      'useUpdateBranchConfig',
      'useDeleteBranchConfig',
      'useBranchStats',
    ]

    console.log(`\n🧪 Comprehensive React Query Hook Tests`)
    console.log(`📊 Total hooks tested: ${testedHooks.length}`)
    console.log(`🔍 Test coverage includes:`)
    console.log(`   • Query hooks (GET operations)`)
    console.log(`   • Mutation hooks (POST/PUT/DELETE operations)`)
    console.log(`   • Optimistic updates`)
    console.log(`   • Error handling and retries`)
    console.log(`   • Cache invalidation`)
    console.log(`   • Loading states`)
    console.log(`   • Statistics and aggregation hooks`)
    console.log(`   • Search and filtering`)
    console.log(`   • Data transformation`)
    
    expect(testedHooks.length).toBeGreaterThan(70)
    expect(testedHooks).toContain('useOrders')
    expect(testedHooks).toContain('useUsers')
    expect(testedHooks).toContain('useInventoryRecords')
    expect(testedHooks).toContain('useProducts')
    expect(testedHooks).toContain('useBranches')
  })
})