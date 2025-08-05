import { api } from '../api'
import { 
  Medicine, 
  Supplement,
  CreateMedicineRequest,
  CreateSupplementRequest,
  Product
} from '../types'

// Product Factory interface - matches API response structure
export interface ProductFactory {
  id: number
  factory_name: string
  supported_product_types: string[]
  created_at: string
}

// Create Product Factory request interface
export interface CreateProductFactoryRequest {
  factory_name: string
  supported_product_types: string[]
}

// Generic product creation request for factory pattern
export interface CreateProductRequest {
  type: 'medicine' | 'supplement' | 'medical_device'
  data: CreateMedicineRequest | CreateSupplementRequest
}

// Product Factory Service - Factory Pattern Implementation
export const productFactoryService = {
  // GET /product-factories/ - Get all product factories
  getProductFactories: async (): Promise<ProductFactory[]> => {
    const response = await api.get('/product-factories/')
    return response.data.results || []
  },

  // GET /product-factories/{id}/ - Get single product factory
  getProductFactory: async (id: number): Promise<ProductFactory> => {
    const response = await api.get(`/product-factories/${id}/`)
    return response.data
  },

  // POST /product-factories/ - Create new product factory
  createProductFactory: async (data: CreateProductFactoryRequest): Promise<ProductFactory> => {
    const response = await api.post('/product-factories/', data)
    return response.data
  },

  // PATCH /product-factories/{id}/ - Update product factory
  updateProductFactory: async ({ id, ...data }: { id: number } & Partial<CreateProductFactoryRequest>): Promise<ProductFactory> => {
    const response = await api.patch(`/product-factories/${id}/`, data)
    return response.data
  },

  // DELETE /product-factories/{id}/ - Delete product factory
  deleteProductFactory: async (id: number): Promise<void> => {
    const response = await api.delete(`/product-factories/${id}/`)
    return response.data
  },

  // Factory Pattern Methods - Create products using factory endpoints
  
  // POST /factory/create-medicine/ - Factory method for medicine creation
  createMedicineFactory: async (data: CreateMedicineRequest): Promise<Medicine> => {
    const response = await api.post('/factory/create-medicine/', data)
    return response.data
  },

  // POST /factory/create-supplement/ - Factory method for supplement creation
  createSupplementFactory: async (data: CreateSupplementRequest): Promise<Supplement> => {
    const response = await api.post('/factory/create-supplement/', data)
    return response.data
  },

  // Generic factory method - creates products based on type using factory pattern
  createProduct: async (type: 'medicine' | 'supplement', data: any): Promise<Product> => {
    switch (type) {
      case 'medicine':
        return productFactoryService.createMedicineFactory(data as CreateMedicineRequest)
      case 'supplement':
        return productFactoryService.createSupplementFactory(data as CreateSupplementRequest)
      default:
        throw new Error(`Unsupported product type for factory creation: ${type}`)
    }
  },

  // Bulk factory creation - create multiple products using factory pattern
  createProductsBulk: async (products: Array<{ type: 'medicine' | 'supplement', data: any }>): Promise<Product[]> => {
    const createPromises = products.map(({ type, data }) => 
      productFactoryService.createProduct(type, data)
    )
    
    return Promise.allSettled(createPromises).then(results => {
      const successful: Product[] = []
      const failed: any[] = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push({ 
            index, 
            type: products[index].type, 
            data: products[index].data, 
            error: result.reason 
          })
        }
      })
      
      if (failed.length > 0) {
        console.warn('Some products failed to create via factory:', failed)
      }
      
      return successful
    })
  },

  // Factory configuration methods
  
  // Get factory configuration for a specific product type
  getFactoryConfig: async (productType: string): Promise<ProductFactory | null> => {
    const factories = await productFactoryService.getProductFactories()
    
    // Map frontend product types to backend factory types
    const typeMapping: Record<string, string[]> = {
      'medicine': ['medicine', 'prescription_medicine', 'otc_medicine'],
      'supplement': ['health_supplement', 'vitamin', 'mineral'],
      'medical_device': ['medical_device', 'monitoring_device', 'diagnostic_device']
    }
    
    const supportedTypes = typeMapping[productType] || [productType]
    
    return factories.find(factory => 
      supportedTypes.some(type => factory.supported_product_types.includes(type))
    ) || null
  },

  // Check if factory pattern is available for a product type
  isFactoryAvailable: async (productType: string): Promise<boolean> => {
    const factories = await productFactoryService.getProductFactories()
    
    // Map frontend product types to backend factory types
    const typeMapping: Record<string, string[]> = {
      'medicine': ['medicine', 'prescription_medicine', 'otc_medicine'],
      'supplement': ['health_supplement', 'vitamin', 'mineral'],
      'medical_device': ['medical_device', 'monitoring_device', 'diagnostic_device']
    }
    
    const supportedTypes = typeMapping[productType] || [productType]
    
    return factories.some(factory => 
      supportedTypes.some(type => factory.supported_product_types.includes(type))
    )
  },

  // Get supported product types across all factories
  getSupportedProductTypes: async (): Promise<string[]> => {
    const factories = await productFactoryService.getProductFactories()
    const allTypes = factories.flatMap(factory => factory.supported_product_types)
    return Array.from(new Set(allTypes)) // Remove duplicates
  }
}

// Type exports for use in hooks
export type GetProductFactoriesParams = void
export type CreateProductFactoryParams = CreateProductFactoryRequest
export type UpdateProductFactoryParams = { id: number } & Partial<CreateProductFactoryRequest>
export type CreateProductParams = { type: 'medicine' | 'supplement', data: any }
export type CreateProductsBulkParams = Array<{ type: 'medicine' | 'supplement', data: any }>