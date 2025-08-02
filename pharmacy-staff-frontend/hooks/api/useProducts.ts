import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys } from '@/lib/queryKeys'
import { 
  productService, 
  CreateMedicineParams, 
  UpdateMedicineParams,
  CreateSupplementParams,
  UpdateSupplementParams,
  CreateMedicalDeviceParams,
  UpdateMedicalDeviceParams,
  GetProductsParams,
  SearchProductsParams
} from '@/lib/services/productService'
import { 
  Product, 
  Medicine, 
  Supplement, 
  MedicalDevice, 
  ProductFilters, 
  MedicineFilters, 
  SupplementFilters, 
  MedicalDeviceFilters 
} from '@/lib/types'
import { ApiError } from '@/lib/api'

// MEDICINE MANAGEMENT HOOKS

// Query Hooks (GET operations)

// Get all medicines with filtering
export const useMedicines = (filters?: MedicineFilters) => {
  return useQuery({
    queryKey: queryKeys.medicines.list(filters || {}),
    queryFn: () => productService.getMedicines(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single medicine
export const useMedicine = (id: number) => {
  return useQuery({
    queryKey: queryKeys.medicines.detail(id),
    queryFn: () => productService.getMedicine(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get prescription medicines shortcut
export const usePrescriptionMedicines = () => {
  return useQuery({
    queryKey: queryKeys.medicines.prescription(),
    queryFn: () => productService.getPrescriptionMedicines(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get OTC medicines shortcut
export const useOTCMedicines = () => {
  return useQuery({
    queryKey: queryKeys.medicines.otc(),
    queryFn: () => productService.getOTCMedicines(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Mutation Hooks (POST/PUT/DELETE operations)

// Create medicine mutation
export const useCreateMedicine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateMedicineParams) => productService.createMedicine(data),
    
    // Optimistic update
    onMutate: async (newMedicine) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicines.lists() })
      
      const previousMedicines = queryClient.getQueryData(queryKeys.medicines.lists())
      
      // Optimistically add new medicine
      queryClient.setQueryData(queryKeys.medicines.lists(), (old: Medicine[] = []) => [
        ...old,
        {
          ...newMedicine,
          id: Date.now(), // Temporary ID
          product_type: 'medicine' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stock: 0,
        } as Medicine
      ])
      
      return { previousMedicines }
    },
    
    onError: (err: ApiError, newMedicine, context) => {
      if (context?.previousMedicines) {
        queryClient.setQueryData(queryKeys.medicines.lists(), context.previousMedicines)
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.medicine(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update medicine mutation
export const useUpdateMedicine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateMedicineParams) => productService.updateMedicine(data),
    
    onSuccess: (updatedMedicine) => {
      // Update specific medicine in cache
      queryClient.setQueryData(queryKeys.medicines.detail(updatedMedicine.id), updatedMedicine)
      
      // Update medicine in any lists that might contain this medicine
      queryClient.setQueriesData(
        { queryKey: queryKeys.medicines.lists() },
        (oldData: Medicine[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(medicine => 
            medicine.id === updatedMedicine.id ? updatedMedicine : medicine
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.medicine(updatedMedicine.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete medicine mutation
export const useDeleteMedicine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (medicineId: number) => productService.deleteMedicine(medicineId),
    
    onMutate: async (medicineId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicines.lists() })
      
      const previousMedicines = queryClient.getQueryData(queryKeys.medicines.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.medicines.lists(), (old: Medicine[] = []) =>
        old.filter(medicine => medicine.id !== medicineId)
      )
      
      return { previousMedicines }
    },
    
    onError: (err, medicineId, context) => {
      if (context?.previousMedicines) {
        queryClient.setQueryData(queryKeys.medicines.lists(), context.previousMedicines)
      }
    },
    
    onSuccess: (_, medicineId) => {
      // Remove medicine from cache
      queryClient.removeQueries({ queryKey: queryKeys.medicines.detail(medicineId) })
      
      // Invalidate all related queries
      getInvalidationKeys.medicine().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// SUPPLEMENT MANAGEMENT HOOKS

// Get all supplements with filtering
export const useSupplements = (filters?: SupplementFilters) => {
  return useQuery({
    queryKey: queryKeys.supplements.list(filters || {}),
    queryFn: () => productService.getSupplements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single supplement
export const useSupplement = (id: number) => {
  return useQuery({
    queryKey: queryKeys.supplements.detail(id),
    queryFn: () => productService.getSupplement(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Create supplement mutation
export const useCreateSupplement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSupplementParams) => productService.createSupplement(data),
    
    // Optimistic update
    onMutate: async (newSupplement) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.supplements.lists() })
      
      const previousSupplements = queryClient.getQueryData(queryKeys.supplements.lists())
      
      // Optimistically add new supplement
      queryClient.setQueryData(queryKeys.supplements.lists(), (old: Supplement[] = []) => [
        ...old,
        {
          ...newSupplement,
          id: Date.now(), // Temporary ID
          product_type: 'supplement' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stock: 0,
        } as Supplement
      ])
      
      return { previousSupplements }
    },
    
    onError: (err: ApiError, newSupplement, context) => {
      if (context?.previousSupplements) {
        queryClient.setQueryData(queryKeys.supplements.lists(), context.previousSupplements)
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.supplement(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update supplement mutation
export const useUpdateSupplement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateSupplementParams) => productService.updateSupplement(data),
    
    onSuccess: (updatedSupplement) => {
      // Update specific supplement in cache
      queryClient.setQueryData(queryKeys.supplements.detail(updatedSupplement.id), updatedSupplement)
      
      // Update supplement in any lists that might contain this supplement
      queryClient.setQueriesData(
        { queryKey: queryKeys.supplements.lists() },
        (oldData: Supplement[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(supplement => 
            supplement.id === updatedSupplement.id ? updatedSupplement : supplement
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.supplement(updatedSupplement.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete supplement mutation
export const useDeleteSupplement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (supplementId: number) => productService.deleteSupplement(supplementId),
    
    onMutate: async (supplementId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.supplements.lists() })
      
      const previousSupplements = queryClient.getQueryData(queryKeys.supplements.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.supplements.lists(), (old: Supplement[] = []) =>
        old.filter(supplement => supplement.id !== supplementId)
      )
      
      return { previousSupplements }
    },
    
    onError: (err, supplementId, context) => {
      if (context?.previousSupplements) {
        queryClient.setQueryData(queryKeys.supplements.lists(), context.previousSupplements)
      }
    },
    
    onSuccess: (_, supplementId) => {
      // Remove supplement from cache
      queryClient.removeQueries({ queryKey: queryKeys.supplements.detail(supplementId) })
      
      // Invalidate all related queries
      getInvalidationKeys.supplement().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// MEDICAL DEVICE MANAGEMENT HOOKS

// Get all medical devices with filtering
export const useMedicalDevices = (filters?: MedicalDeviceFilters) => {
  return useQuery({
    queryKey: queryKeys.medicalDevices.list(filters || {}),
    queryFn: () => productService.getMedicalDevices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single medical device
export const useMedicalDevice = (id: number) => {
  return useQuery({
    queryKey: queryKeys.medicalDevices.detail(id),
    queryFn: () => productService.getMedicalDevice(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Create medical device mutation
export const useCreateMedicalDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateMedicalDeviceParams) => productService.createMedicalDevice(data),
    
    // Optimistic update
    onMutate: async (newDevice) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalDevices.lists() })
      
      const previousDevices = queryClient.getQueryData(queryKeys.medicalDevices.lists())
      
      // Optimistically add new medical device
      queryClient.setQueryData(queryKeys.medicalDevices.lists(), (old: MedicalDevice[] = []) => [
        ...old,
        {
          ...newDevice,
          id: Date.now(), // Temporary ID
          product_type: 'medical_device' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stock: 0,
        } as MedicalDevice
      ])
      
      return { previousDevices }
    },
    
    onError: (err: ApiError, newDevice, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.medicalDevices.lists(), context.previousDevices)
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.medicalDevice(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update medical device mutation
export const useUpdateMedicalDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateMedicalDeviceParams) => productService.updateMedicalDevice(data),
    
    onSuccess: (updatedDevice) => {
      // Update specific medical device in cache
      queryClient.setQueryData(queryKeys.medicalDevices.detail(updatedDevice.id), updatedDevice)
      
      // Update medical device in any lists that might contain this device
      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalDevices.lists() },
        (oldData: MedicalDevice[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(device => 
            device.id === updatedDevice.id ? updatedDevice : device
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.medicalDevice(updatedDevice.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete medical device mutation
export const useDeleteMedicalDevice = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (deviceId: number) => productService.deleteMedicalDevice(deviceId),
    
    onMutate: async (deviceId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalDevices.lists() })
      
      const previousDevices = queryClient.getQueryData(queryKeys.medicalDevices.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.medicalDevices.lists(), (old: MedicalDevice[] = []) =>
        old.filter(device => device.id !== deviceId)
      )
      
      return { previousDevices }
    },
    
    onError: (err, deviceId, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.medicalDevices.lists(), context.previousDevices)
      }
    },
    
    onSuccess: (_, deviceId) => {
      // Remove medical device from cache
      queryClient.removeQueries({ queryKey: queryKeys.medicalDevices.detail(deviceId) })
      
      // Invalidate all related queries
      getInvalidationKeys.medicalDevice().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// UNIFIED PRODUCT MANAGEMENT HOOKS

// Get all products with filtering (unified)
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single product (unified) - requires product type
export const useProduct = (id: number, productType: 'medicine' | 'supplement' | 'medical_device') => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProduct(id, productType),
    enabled: !!id && id > 0 && !!productType,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Search products hook
export const useSearchProducts = (query: string, productType?: 'medicine' | 'supplement' | 'medical_device') => {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: () => productService.searchProducts(query, productType),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 3,
  })
}

// Low stock products hook
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.lowStock(),
    queryFn: () => productService.getLowStockProducts(),
    staleTime: 1 * 60 * 1000, // 1 minute for low stock (more dynamic)
    retry: 3,
  })
}

// CUSTOM STATISTICS HOOKS

// Custom hook for medicine statistics
export const useMedicineStats = () => {
  const medicinesQuery = useMedicines()
  
  if (!medicinesQuery.data) {
    return {
      totalMedicines: 0,
      prescriptionMedicines: 0,
      otcMedicines: 0,
      scheduledMedicines: 0,
      lowStockMedicines: 0,
      isLoading: medicinesQuery.isLoading,
      error: medicinesQuery.error,
    }
  }
  
  const medicines = medicinesQuery.data
  const prescriptionMedicines = medicines.filter(m => m.is_prescription)
  const otcMedicines = medicines.filter(m => !m.is_prescription)
  const scheduledMedicines = medicines.filter(m => m.drug_schedule && m.drug_schedule !== 'OTC')
  const lowStockMedicines = medicines.filter(m => (m.stock || 0) < 10) // Assuming low stock threshold of 10
  
  return {
    totalMedicines: medicines.length,
    prescriptionMedicines: prescriptionMedicines.length,
    otcMedicines: otcMedicines.length,
    scheduledMedicines: scheduledMedicines.length,
    lowStockMedicines: lowStockMedicines.length,
    isLoading: medicinesQuery.isLoading,
    error: medicinesQuery.error,
  }
}

// Custom hook for supplement statistics
export const useSupplementStats = () => {
  const supplementsQuery = useSupplements()
  
  if (!supplementsQuery.data) {
    return {
      totalSupplements: 0,
      vitaminSupplements: 0,
      mineralSupplements: 0,
      herbalSupplements: 0,
      proteinSupplements: 0,
      lowStockSupplements: 0,
      isLoading: supplementsQuery.isLoading,
      error: supplementsQuery.error,
    }
  }
  
  const supplements = supplementsQuery.data
  const vitaminSupplements = supplements.filter(s => s.supplement_type === 'vitamin')
  const mineralSupplements = supplements.filter(s => s.supplement_type === 'mineral')
  const herbalSupplements = supplements.filter(s => s.supplement_type === 'herbal')
  const proteinSupplements = supplements.filter(s => s.supplement_type === 'protein')
  const lowStockSupplements = supplements.filter(s => (s.stock || 0) < 10)
  
  return {
    totalSupplements: supplements.length,
    vitaminSupplements: vitaminSupplements.length,
    mineralSupplements: mineralSupplements.length,
    herbalSupplements: herbalSupplements.length,
    proteinSupplements: proteinSupplements.length,
    lowStockSupplements: lowStockSupplements.length,
    isLoading: supplementsQuery.isLoading,
    error: supplementsQuery.error,
  }
}

// Custom hook for medical device statistics
export const useMedicalDeviceStats = () => {
  const devicesQuery = useMedicalDevices()
  
  if (!devicesQuery.data) {
    return {
      totalDevices: 0,
      diagnosticDevices: 0,
      therapeuticDevices: 0,
      surgicalDevices: 0,
      monitoringDevices: 0,
      lowStockDevices: 0,
      isLoading: devicesQuery.isLoading,
      error: devicesQuery.error,
    }
  }
  
  const devices = devicesQuery.data
  const diagnosticDevices = devices.filter(d => d.device_type === 'diagnostic')
  const therapeuticDevices = devices.filter(d => d.device_type === 'therapeutic')
  const surgicalDevices = devices.filter(d => d.device_type === 'surgical')
  const monitoringDevices = devices.filter(d => d.device_type === 'monitoring')
  const lowStockDevices = devices.filter(d => (d.stock || 0) < 5) // Lower threshold for medical devices
  
  return {
    totalDevices: devices.length,
    diagnosticDevices: diagnosticDevices.length,
    therapeuticDevices: therapeuticDevices.length,
    surgicalDevices: surgicalDevices.length,
    monitoringDevices: monitoringDevices.length,
    lowStockDevices: lowStockDevices.length,
    isLoading: devicesQuery.isLoading,
    error: devicesQuery.error,
  }
}

// Custom hook for unified product statistics
export const useProductStats = () => {
  const productsQuery = useProducts()
  
  if (!productsQuery.data) {
    return {
      totalProducts: 0,
      medicines: 0,
      supplements: 0,
      medicalDevices: 0,
      prescriptionProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
      totalCatalogValue: 0,
      isLoading: productsQuery.isLoading,
      error: productsQuery.error,
    }
  }
  
  const products = productsQuery.data
  
  const medicines = products.filter(p => p.product_type === 'medicine')
  const supplements = products.filter(p => p.product_type === 'supplement')
  const medicalDevices = products.filter(p => p.product_type === 'medical_device')
  const prescriptionProducts = products.filter(p => p.requires_prescription)
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10)
  
  // Calculate total catalog value (sum of all product prices - represents the value of our product catalog)
  const totalCatalogValue = products.reduce((sum, product) => {
    const price = parseFloat(product.price) || 0
    return sum + price
  }, 0)
  
  // Calculate total inventory value (price * stock) if stock data is available
  const totalValue = products.reduce((sum, product) => {
    const price = parseFloat(product.price) || 0
    const stock = product.stock || 0
    return sum + (price * stock)
  }, 0)
  
  // Use catalog value if inventory value is 0 (no stock data available)
  const displayValue = totalValue > 0 ? totalValue : totalCatalogValue
  
  return {
    totalProducts: products.length,
    medicines: medicines.length,
    supplements: supplements.length,
    medicalDevices: medicalDevices.length,
    prescriptionProducts: prescriptionProducts.length,
    lowStockProducts: lowStockProducts.length,
    totalValue: displayValue,
    totalCatalogValue,
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
  }
}