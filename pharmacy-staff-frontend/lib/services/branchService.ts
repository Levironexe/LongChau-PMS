import { api, createQueryParams } from '../api'
import { Branch, BranchStaffSummary, BranchConfig, CreateBranchRequest } from '../types'
import { BranchFilters } from '../queryKeys'

// Branch Service - All branch-related API calls
export const branchService = {
  // GET /branches/ - Get all branches with filtering
  getBranches: async (filters?: BranchFilters): Promise<Branch[]> => {
    const queryString = filters ? createQueryParams(filters) : ''
    const response = await api.get(`/branches/${queryString ? `?${queryString}` : ''}`)
    return response.data.results || []
  },

  // GET /branches/{id}/ - Get single branch
  getBranch: async (id: number): Promise<Branch> => {
    const response = await api.get(`/branches/${id}/`)
    return response.data
  },

  // POST /branches/ - Create new branch
  createBranch: async (data: CreateBranchRequest): Promise<Branch> => {
    const response = await api.post('/branches/', data)
    return response.data
  },

  // PUT /branches/{id}/ - Update branch (full update)
  updateBranch: async ({ id, ...data }: { id: number } & Partial<CreateBranchRequest>): Promise<Branch> => {
    const response = await api.put(`/branches/${id}/`, data)
    return response.data
  },

  // PATCH /branches/{id}/ - Partial update branch
  patchBranch: async ({ id, ...data }: { id: number } & Partial<CreateBranchRequest>): Promise<Branch> => {
    const response = await api.patch(`/branches/${id}/`, data)
    return response.data
  },

  // DELETE /branches/{id}/ - Delete branch
  deleteBranch: async (id: number): Promise<void> => {
    const response = await api.delete(`/branches/${id}/`)
    return response.data
  },

  // GET /branches/{id}/staff-summary/ - Get staff count by role for branch
  getBranchStaffSummary: async (id: number): Promise<BranchStaffSummary> => {
    const response = await api.get(`/branches/${id}/staff-summary/`)
    return response.data
  },

  // Branch Configuration Management
  
  // GET /branch-configs/ - Get all branch configurations
  getBranchConfigs: async (): Promise<BranchConfig[]> => {
    const response = await api.get('/branch-configs/')
    return response.data.results || []
  },

  // GET /branch-configs/{id}/ - Get single branch configuration
  getBranchConfig: async (id: number): Promise<BranchConfig> => {
    const response = await api.get(`/branch-configs/${id}/`)
    return response.data
  },

  // POST /branch-configs/ - Create branch configuration
  createBranchConfig: async (data: {
    branch: number
    setting_name: string
    setting_value: string | number | boolean
    setting_type: "string" | "number" | "boolean"
  }): Promise<BranchConfig> => {
    const response = await api.post('/branch-configs/', data)
    return response.data
  },

  // PUT /branch-configs/{id}/ - Update branch configuration (full update)
  updateBranchConfig: async ({ id, ...data }: { id: number } & {
    branch?: number
    setting_name?: string
    setting_value?: string | number | boolean
    setting_type?: "string" | "number" | "boolean"
    is_active?: boolean
  }): Promise<BranchConfig> => {
    const response = await api.put(`/branch-configs/${id}/`, data)
    return response.data
  },

  // PATCH /branch-configs/{id}/ - Partial update branch configuration
  patchBranchConfig: async ({ id, ...data }: { id: number } & {
    branch?: number
    setting_name?: string
    setting_value?: string | number | boolean
    setting_type?: "string" | "number" | "boolean"
    is_active?: boolean
  }): Promise<BranchConfig> => {
    const response = await api.patch(`/branch-configs/${id}/`, data)
    return response.data
  },

  // DELETE /branch-configs/{id}/ - Delete branch configuration
  deleteBranchConfig: async (id: number): Promise<void> => {
    const response = await api.delete(`/branch-configs/${id}/`)
    return response.data
  },
}

// Type for branch service responses
export type BranchServiceResponse<T> = {
  data: T
  message?: string
  status: number
}

// Export parameter types for use in hooks
export type GetBranchesParams = BranchFilters
export type CreateBranchParams = CreateBranchRequest
export type UpdateBranchParams = { id: number } & Partial<CreateBranchRequest>
export type CreateBranchConfigParams = {
  branch: number
  setting_name: string
  setting_value: string | number | boolean
  setting_type: "string" | "number" | "boolean"
}
export type UpdateBranchConfigParams = { id: number } & {
  branch?: number
  setting_name?: string
  setting_value?: string | number | boolean
  setting_type?: "string" | "number" | "boolean"
  is_active?: boolean
}