import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

// Types for warehouse operations
interface WarehouseFilters {
  search?: string
}

interface CreateWarehouseParams {
  name: string
  address: string
  capacity: number
  manager?: number
}

interface UpdateWarehouseParams {
  id: number
  name: string
  address: string
  capacity: number
  manager?: number
}

interface CreateWarehouseInventoryParams {
  warehouse: number
  product: number
  current_stock: number
  minimum_stock: number
  reorder_point: number
  cost_price: string
  supplier?: string
}

interface UpdateWarehouseInventoryParams {
  id: number
  warehouse: number
  product: number
  current_stock: number
  minimum_stock: number
  reorder_point: number
  cost_price: string
  supplier?: string
}

interface CreateTransferRequestParams {
  source_warehouse: number
  destination_branch: number
  product: number
  quantity: number
  requested_by: number
  notes?: string
  transfer_number?: string
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://longchau-pms.onrender.com/api'

// API Service functions
const warehouseService = {
  // Warehouse CRUD
  async getWarehouses(filters?: WarehouseFilters) {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    
    const response = await fetch(`${API_BASE_URL}/warehouses/?${params}`)
    if (!response.ok) throw new ApiError('Failed to fetch warehouses', response.status)
    return response.json()
  },

  async getWarehouse(id: number) {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}/`)
    if (!response.ok) throw new ApiError('Failed to fetch warehouse', response.status)
    return response.json()
  },

  async createWarehouse(data: CreateWarehouseParams) {
    const response = await fetch(`${API_BASE_URL}/warehouses/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new ApiError('Failed to create warehouse', response.status)
    return response.json()
  },

  async updateWarehouse(data: UpdateWarehouseParams) {
    const { id, ...updateData } = data
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    if (!response.ok) throw new ApiError('Failed to update warehouse', response.status)
    return response.json()
  },

  async deleteWarehouse(id: number) {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}/`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new ApiError('Failed to delete warehouse', response.status)
    return true
  },

  // Warehouse Inventory CRUD
  async getWarehouseInventory(warehouseId?: number) {
    const params = new URLSearchParams()
    if (warehouseId) params.append('warehouse_id', warehouseId.toString())
    
    const response = await fetch(`${API_BASE_URL}/warehouse-inventory/?${params}`)
    if (!response.ok) throw new ApiError('Failed to fetch warehouse inventory', response.status)
    return response.json()
  },

  async createWarehouseInventory(data: CreateWarehouseInventoryParams) {
    const response = await fetch(`${API_BASE_URL}/warehouse-inventory/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new ApiError('Failed to create warehouse inventory', response.status)
    return response.json()
  },

  async updateWarehouseInventory(data: UpdateWarehouseInventoryParams) {
    const { id, ...updateData } = data
    const response = await fetch(`${API_BASE_URL}/warehouse-inventory/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    if (!response.ok) throw new ApiError('Failed to update warehouse inventory', response.status)
    return response.json()
  },

  async deleteWarehouseInventory(id: number) {
    const response = await fetch(`${API_BASE_URL}/warehouse-inventory/${id}/`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new ApiError('Failed to delete warehouse inventory', response.status)
    return true
  },

  // Transfer requests
  async getInventoryTransfers() {
    const response = await fetch(`${API_BASE_URL}/inventory-transfers/`)
    if (!response.ok) throw new ApiError('Failed to fetch inventory transfers', response.status)
    return response.json()
  },

  async createTransferRequest(data: CreateTransferRequestParams) {
    const response = await fetch(`${API_BASE_URL}/inventory-transfers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new ApiError('Failed to create transfer request', response.status)
    return response.json()
  },

  async approveTransfer(transferId: number, approvedById: number) {
    const response = await fetch(`${API_BASE_URL}/inventory-transfers/${transferId}/approve_transfer/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approver_id: approvedById })
    })
    if (!response.ok) throw new ApiError('Failed to approve transfer', response.status)
    return response.json()
  },

  async completeTransfer(transferId: number, receivingUserId: number) {
    const response = await fetch(`${API_BASE_URL}/inventory-transfers/${transferId}/complete_transfer/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiving_user_id: receivingUserId })
    })
    if (!response.ok) throw new ApiError('Failed to complete transfer', response.status)
    return response.json()
  }
}

// Query key factory
const warehouseQueryKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseQueryKeys.all, 'list'] as const,
  list: (filters: WarehouseFilters) => [...warehouseQueryKeys.lists(), filters] as const,
  details: () => [...warehouseQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...warehouseQueryKeys.details(), id] as const,
  inventory: () => [...warehouseQueryKeys.all, 'inventory'] as const,
  inventoryByWarehouse: (warehouseId: number) => [...warehouseQueryKeys.inventory(), warehouseId] as const,
  transfers: () => [...warehouseQueryKeys.all, 'transfers'] as const,
}

// Query Hooks (GET operations)

// Get all warehouses with filtering
export const useWarehouses = (filters?: WarehouseFilters) => {
  return useQuery({
    queryKey: warehouseQueryKeys.list(filters || {}),
    queryFn: () => warehouseService.getWarehouses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single warehouse
export const useWarehouse = (id: number) => {
  return useQuery({
    queryKey: warehouseQueryKeys.detail(id),
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get warehouse inventory
export const useWarehouseInventory = (warehouseId?: number) => {
  return useQuery({
    queryKey: warehouseId ? warehouseQueryKeys.inventoryByWarehouse(warehouseId) : warehouseQueryKeys.inventory(),
    queryFn: () => warehouseService.getWarehouseInventory(warehouseId),
    staleTime: 2 * 60 * 1000, // 2 minutes - inventory changes frequently
    retry: 3,
  })
}

// Get inventory transfers
export const useInventoryTransfers = () => {
  return useQuery({
    queryKey: warehouseQueryKeys.transfers(),
    queryFn: () => warehouseService.getInventoryTransfers(),
    staleTime: 1 * 60 * 1000, // 1 minute - transfers change frequently
    retry: 3,
  })
}

// Mutation Hooks (CUD operations)

// Create warehouse
export const useCreateWarehouse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Update warehouse
export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.updateWarehouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.detail(data.id) })
    },
  })
}

// Delete warehouse
export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Create warehouse inventory
export const useCreateWarehouseInventory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.createWarehouseInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.inventory() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Update warehouse inventory
export const useUpdateWarehouseInventory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.updateWarehouseInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.inventory() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Delete warehouse inventory
export const useDeleteWarehouseInventory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.deleteWarehouseInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.inventory() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Create transfer request
export const useCreateTransferRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: warehouseService.createTransferRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.transfers() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.inventory() })
    },
  })
}

// Approve transfer
export const useApproveTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ transferId, approvedById }: { transferId: number, approvedById: number }) => 
      warehouseService.approveTransfer(transferId, approvedById),
    onSuccess: () => {
      // Invalidate transfers (status changes from pending to approved)
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.transfers() })
      
      // Invalidate warehouse lists (pending transfer counts change)
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
    },
  })
}

// Complete transfer
export const useCompleteTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ transferId, receivingUserId }: { transferId: number, receivingUserId: number }) => 
      warehouseService.completeTransfer(transferId, receivingUserId),
    onSuccess: () => {
      // Core transfer-related data
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.transfers() })
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.inventory() })
      
      // Warehouse lists (total stock changes after transfer)
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.lists() })
      
      // Individual warehouse details (stock levels change)
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.details() })
      
      // Branch inventory (destination branch receives stock)
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      queryClient.invalidateQueries({ queryKey: ['branch-inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      
      // Product-related queries that might show stock info
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}