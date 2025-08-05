import { api, createQueryParams } from '../api'
import { 
  Product, 
  Medicine, 
  Supplement, 
  MedicalDevice,
  CreateMedicineRequest,
  CreateSupplementRequest,
  CreateMedicalDeviceRequest,
  ProductFilters,
  MedicineFilters,
  SupplementFilters,
  MedicalDeviceFilters
} from '../types'

// Product Service - All product-related API calls
export const productService = {
  // Medicine Management
  // GET /medicines/ - Get all medicines with filtering
  getMedicines: async (filters?: MedicineFilters): Promise<Medicine[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/medicines/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /medicines/{id}/ - Get single medicine
  getMedicine: async (id: number): Promise<Medicine> => {
    const response = await api.get(`/medicines/${id}/`)
    return response.data
  },

  // POST /medicines/ - Create new medicine
  createMedicine: async (data: CreateMedicineRequest): Promise<Medicine> => {
    const response = await api.post('/medicines/', data)
    return response.data
  },

  // PATCH /medicines/{id}/ - Update medicine
  updateMedicine: async ({ id, ...data }: { id: number } & Partial<CreateMedicineRequest>): Promise<Medicine> => {
    const response = await api.patch(`/medicines/${id}/`, data)
    return response.data
  },

  // DELETE /medicines/{id}/ - Delete medicine
  deleteMedicine: async (id: number): Promise<void> => {
    const response = await api.delete(`/medicines/${id}/`)
    return response.data
  },

  // GET /prescription-medicines/ - Get prescription medicines
  getPrescriptionMedicines: async (): Promise<Medicine[]> => {
    const response = await api.get('/prescription-medicines/')
    return response.data.results || []
  },

  // GET /otc-medicines/ - Get over-the-counter medicines
  getOTCMedicines: async (): Promise<Medicine[]> => {
    const response = await api.get('/otc-medicines/')
    return response.data.results || []
  },

  // Supplement Management
  // GET /supplements/ - Get all supplements with filtering
  getSupplements: async (filters?: SupplementFilters): Promise<Supplement[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/supplements/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /supplements/{id}/ - Get single supplement
  getSupplement: async (id: number): Promise<Supplement> => {
    const response = await api.get(`/supplements/${id}/`)
    return response.data
  },

  // POST /supplements/ - Create new supplement
  createSupplement: async (data: CreateSupplementRequest): Promise<Supplement> => {
    const response = await api.post('/supplements/', data)
    return response.data
  },

  // PATCH /supplements/{id}/ - Update supplement
  updateSupplement: async ({ id, ...data }: { id: number } & Partial<CreateSupplementRequest>): Promise<Supplement> => {
    const response = await api.patch(`/supplements/${id}/`, data)
    return response.data
  },

  // DELETE /supplements/{id}/ - Delete supplement
  deleteSupplement: async (id: number): Promise<void> => {
    const response = await api.delete(`/supplements/${id}/`)
    return response.data
  },

  // Medical Device Management
  // GET /medical-devices/ - Get all medical devices with filtering
  getMedicalDevices: async (filters?: MedicalDeviceFilters): Promise<MedicalDevice[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/medical-devices/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /medical-devices/{id}/ - Get single medical device
  getMedicalDevice: async (id: number): Promise<MedicalDevice> => {
    const response = await api.get(`/medical-devices/${id}/`)
    return response.data
  },

  // POST /medical-devices/ - Create new medical device
  createMedicalDevice: async (data: CreateMedicalDeviceRequest): Promise<MedicalDevice> => {
    const response = await api.post('/medical-devices/', data)
    return response.data
  },

  // PATCH /medical-devices/{id}/ - Update medical device
  updateMedicalDevice: async ({ id, ...data }: { id: number } & Partial<CreateMedicalDeviceRequest>): Promise<MedicalDevice> => {
    const response = await api.patch(`/medical-devices/${id}/`, data)
    return response.data
  },

  // DELETE /medical-devices/{id}/ - Delete medical device
  deleteMedicalDevice: async (id: number): Promise<void> => {
    const response = await api.delete(`/medical-devices/${id}/`)
    return response.data
  },

  // Unified Product Search - aggregates medicines, supplements, and medical devices
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const [medicines, supplements, medicalDevices] = await Promise.all([
      productService.getMedicines(filters as MedicineFilters),
      productService.getSupplements(filters as SupplementFilters), 
      productService.getMedicalDevices(filters as MedicalDeviceFilters)
    ])
    
    // Combine all product types and apply additional filtering if needed
    const allProducts: Product[] = [
      ...medicines.map(m => ({ ...m, product_type: 'medicine' as const })),
      ...supplements.map(s => ({ ...s, product_type: 'supplement' as const })),
      ...medicalDevices.map(d => ({ ...d, product_type: 'medical_device' as const }))
    ]
    
    // Apply product type filter if specified
    if (filters?.product_type) {
      return allProducts.filter(p => p.product_type === filters.product_type)
    }
    
    return allProducts
  },

  // Get single product by ID and type - requires knowing the product type
  getProduct: async (id: number, productType: 'medicine' | 'supplement' | 'medical_device'): Promise<Product> => {
    switch (productType) {
      case 'medicine':
        return productService.getMedicine(id)
      case 'supplement':
        return productService.getSupplement(id)
      case 'medical_device':
        return productService.getMedicalDevice(id)
      default:
        throw new Error(`Unknown product type: ${productType}`)
    }
  },

  // Note: Factory methods moved to productFactoryService.ts for better separation of concerns

  // Search functionality (if backend supports it)
  searchProducts: async (query: string, productType?: 'medicine' | 'supplement' | 'medical_device'): Promise<Product[]> => {
    const filters: ProductFilters = { search: query }
    if (productType) {
      filters.product_type = productType
    }
    return productService.getProducts(filters)
  },

  // Low stock products - use inventory records to determine low stock
  getLowStockProducts: async (): Promise<Product[]> => {
    // Get inventory records and filter for low stock items
    const response = await api.get('/inventory-records/')
    const inventoryRecords = response.data.results || []
    
    // Filter for low stock (assuming stock_level < 10 is considered low)
    const lowStockRecords = inventoryRecords.filter((record: any) => record.stock_level < 10)
    
    // Get product details for low stock items
    const productPromises = lowStockRecords.map(async (record: any) => {
      try {
        if (record.medicine) {
          const medicine = await productService.getMedicine(record.medicine)
          return { ...medicine, product_type: 'medicine' as const, stock_level: record.stock_level }
        } else if (record.supplement) {
          const supplement = await productService.getSupplement(record.supplement)
          return { ...supplement, product_type: 'supplement' as const, stock_level: record.stock_level }
        } else if (record.medical_device) {
          const device = await productService.getMedicalDevice(record.medical_device)
          return { ...device, product_type: 'medical_device' as const, stock_level: record.stock_level }
        }
      } catch (error) {
        console.warn('Failed to fetch product details for inventory record:', record.id)
        return null
      }
    })
    
    const products = await Promise.all(productPromises)
    return products.filter((product): product is Product => product !== null)
  },
}

// Type for product service responses
export type ProductServiceResponse<T> = {
  data: T
  message?: string
  status: number
}

// Export parameter types for use in hooks
// Medicine service parameters
export type GetMedicinesParams = MedicineFilters
export type CreateMedicineParams = CreateMedicineRequest
export type UpdateMedicineParams = { id: number } & Partial<CreateMedicineRequest>

// Supplement service parameters
export type GetSupplementsParams = SupplementFilters
export type CreateSupplementParams = CreateSupplementRequest
export type UpdateSupplementParams = { id: number } & Partial<CreateSupplementRequest>

// Medical Device service parameters
export type GetMedicalDevicesParams = MedicalDeviceFilters
export type CreateMedicalDeviceParams = CreateMedicalDeviceRequest
export type UpdateMedicalDeviceParams = { id: number } & Partial<CreateMedicalDeviceRequest>

// Unified Product service parameters
export type GetProductsParams = ProductFilters
export type SearchProductsParams = { query: string; productType?: 'medicine' | 'supplement' | 'medical_device' }