import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryKeys'
import { productFactoryService } from '../../lib/services/productFactoryService'
import { 
  ProductFactory,
  CreateProductFactoryRequest,
  CreateMedicineRequest,
  CreateSupplementRequest,
  Medicine,
  Supplement,
  Product
} from '../../lib/types'

// Product Factory Query Hooks

// Get all product factories
export const useProductFactories = () => {
  return useQuery({
    queryKey: queryKeys.productFactories.list(),
    queryFn: productFactoryService.getProductFactories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Get single product factory
export const useProductFactory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.productFactories.detail(id),
    queryFn: () => productFactoryService.getProductFactory(id),
    enabled: id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Get factory configuration for a specific product type
export const useFactoryConfig = (productType: string) => {
  return useQuery({
    queryKey: queryKeys.productFactories.config(productType),
    queryFn: () => productFactoryService.getFactoryConfig(productType),
    enabled: !!productType,
    staleTime: 10 * 60 * 1000, // 10 minutes (configs change rarely)
    gcTime: 30 * 60 * 1000,
  })
}

// Check if factory pattern is available for a product type
export const useIsFactoryAvailable = (productType: string) => {
  return useQuery({
    queryKey: queryKeys.productFactories.byType(productType),
    queryFn: () => productFactoryService.isFactoryAvailable(productType),
    enabled: !!productType,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Get supported product types across all factories
export const useSupportedProductTypes = () => {
  return useQuery({
    queryKey: queryKeys.productFactories.supportedTypes(),
    queryFn: productFactoryService.getSupportedProductTypes,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Product Factory Mutation Hooks

// Create new product factory
export const useCreateProductFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductFactoryRequest) => 
      productFactoryService.createProductFactory(data),
    
    onMutate: async (newFactory) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.productFactories.lists() })

      // Snapshot the previous value
      const previousFactories = queryClient.getQueryData(queryKeys.productFactories.list())

      // Optimistically update the factory list
      queryClient.setQueryData(queryKeys.productFactories.list(), (old: ProductFactory[] = []) => {
        const optimisticFactory: ProductFactory = {
          id: Date.now(), // Temporary ID
          factory_name: newFactory.factory_name,
          supported_product_types: newFactory.supported_product_types,
          created_at: new Date().toISOString(),
        }
        return [optimisticFactory, ...old]
      })

      return { previousFactories }
    },

    onError: (err, newFactory, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFactories) {
        queryClient.setQueryData(queryKeys.productFactories.list(), context.previousFactories)
      }
      console.error('Create product factory error:', err)
    },

    onSuccess: (data) => {
      // Product factory created successfully
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.supportedTypes() })
    },
  })
}

// Update existing product factory
export const useUpdateProductFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateProductFactoryRequest>) =>
      productFactoryService.updateProductFactory({ id, ...data }),

    onSuccess: (data) => {
      // Update the specific factory detail
      queryClient.setQueryData(queryKeys.productFactories.detail(data.id), data)
      
      // Update the factory in the list
      queryClient.setQueryData(queryKeys.productFactories.list(), (old: ProductFactory[] = []) =>
        old.map((factory) => factory.id === data.id ? data : factory)
      )

      // Product factory updated successfully
    },

    onError: (err) => {
      console.error('Update product factory error:', err)
    },

    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.lists() })
        queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.supportedTypes() })
      }
    },
  })
}

// Delete product factory
export const useDeleteProductFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productFactoryService.deleteProductFactory(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.productFactories.lists() })

      const previousFactories = queryClient.getQueryData(queryKeys.productFactories.list())

      // Optimistically remove the factory
      queryClient.setQueryData(queryKeys.productFactories.list(), (old: ProductFactory[] = []) =>
        old.filter((factory) => factory.id !== deletedId)
      )

      return { previousFactories }
    },

    onError: (err, deletedId, context) => {
      if (context?.previousFactories) {
        queryClient.setQueryData(queryKeys.productFactories.list(), context.previousFactories)
      }
      console.error('Delete product factory error:', err)
    },

    onSuccess: () => {
      // Product factory deleted successfully
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.productFactories.supportedTypes() })
    },
  })
}

// Factory Pattern Product Creation Hooks

// Create medicine using factory pattern
export const useCreateMedicineFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMedicineRequest) => 
      productFactoryService.createMedicineFactory(data),

    onSuccess: (data) => {
      // Invalidate relevant medicine and product queries
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      
      // Medicine created via factory pattern
    },

    onError: (err) => {
      console.error('Create medicine factory error:', err)
    },
  })
}

// Create supplement using factory pattern
export const useCreateSupplementFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplementRequest) => 
      productFactoryService.createSupplementFactory(data),

    onSuccess: (data) => {
      // Invalidate relevant supplement and product queries
      queryClient.invalidateQueries({ queryKey: queryKeys.supplements.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      
      // Supplement created via factory pattern
    },

    onError: (err) => {
      console.error('Create supplement factory error:', err)
    },
  })
}

// Generic factory product creation hook
export const useCreateProductViaFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type, data }: { type: 'medicine' | 'supplement', data: any }) =>
      productFactoryService.createProduct(type, data),

    onSuccess: (data, variables) => {
      // Invalidate queries based on product type
      if (variables.type === 'medicine') {
        queryClient.invalidateQueries({ queryKey: queryKeys.medicines.lists() })
      } else if (variables.type === 'supplement') {
        queryClient.invalidateQueries({ queryKey: queryKeys.supplements.lists() })
      }
      
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      
      // Product created via factory pattern
    },

    onError: (err, variables) => {
      console.error('Create product factory error:', err)
    },
  })
}

// Bulk factory product creation hook
export const useCreateProductsBulkFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (products: Array<{ type: 'medicine' | 'supplement', data: any }>) =>
      productFactoryService.createProductsBulk(products),

    onSuccess: (createdProducts, variables) => {
      // Invalidate all relevant queries since we created multiple product types
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.supplements.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      
      const successCount = createdProducts.length
      const totalCount = variables.length
      
      // Bulk product creation completed
    },

    onError: (err) => {
      console.error('Bulk create products factory error:', err)
    },
  })
}

// Helper hook to check if a product type supports factory creation
export const useCanCreateViaFactory = (productType: string) => {
  const { data: isAvailable, isLoading } = useIsFactoryAvailable(productType)
  
  return {
    canCreate: isAvailable ?? false,
    isLoading,
  }
}