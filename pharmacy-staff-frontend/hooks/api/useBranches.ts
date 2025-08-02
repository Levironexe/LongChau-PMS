import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, BranchFilters } from '@/lib/queryKeys'
import { branchService, CreateBranchParams, UpdateBranchParams, CreateBranchConfigParams, UpdateBranchConfigParams } from '@/lib/services/branchService'
import { Branch, BranchStaffSummary, BranchConfig } from '@/lib/types'
import { ApiError } from '@/lib/api'

// Query Hooks (GET operations)

// Get all branches with filtering
export const useBranches = (filters?: BranchFilters) => {
  return useQuery({
    queryKey: queryKeys.branches.list(filters || {}),
    queryFn: () => branchService.getBranches(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - branches don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single branch
export const useBranch = (id: number) => {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => branchService.getBranch(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get branch staff summary
export const useBranchStaffSummary = (id: number) => {
  return useQuery({
    queryKey: queryKeys.branches.staffSummary(id),
    queryFn: () => branchService.getBranchStaffSummary(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - staff changes more frequently
    retry: 3,
  })
}

// Get all branch configurations
export const useBranchConfigs = () => {
  return useQuery({
    queryKey: queryKeys.branches.configs(),
    queryFn: () => branchService.getBranchConfigs(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get single branch configuration
export const useBranchConfig = (id: number) => {
  return useQuery({
    queryKey: queryKeys.branches.config(id),
    queryFn: () => branchService.getBranchConfig(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Mutation Hooks (POST/PUT/DELETE operations)

// Create branch mutation
export const useCreateBranch = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateBranchParams) => branchService.createBranch(data),
    
    // Optimistic update
    onMutate: async (newBranch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.branches.lists() })
      
      const previousBranches = queryClient.getQueryData(queryKeys.branches.lists())
      
      // Optimistically add new branch
      queryClient.setQueryData(queryKeys.branches.lists(), (old: Branch[] = []) => [
        ...old,
        { 
          ...newBranch,
          id: Date.now(), // Temporary ID
          established_date: new Date().toISOString().split('T')[0],
          is_active: true,
          status: newBranch.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_products: 0,
          staff_count: 0,
        } as Branch
      ])
      
      return { previousBranches }
    },
    
    onError: (err: ApiError, newBranch, context) => {
      if (context?.previousBranches) {
        queryClient.setQueryData(queryKeys.branches.lists(), context.previousBranches)
      }
    },
    
    onSettled: (data) => {
      getInvalidationKeys.branch(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update branch mutation
export const useUpdateBranch = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateBranchParams) => branchService.patchBranch(data),
    
    onSuccess: (updatedBranch) => {
      // Update specific branch in cache
      queryClient.setQueryData(queryKeys.branches.detail(updatedBranch.id), updatedBranch)
      
      // Update branch in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.branches.lists() },
        (oldData: Branch[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(branch => 
            branch.id === updatedBranch.id ? updatedBranch : branch
          )
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.branch(updatedBranch.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete branch mutation
export const useDeleteBranch = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (branchId: number) => branchService.deleteBranch(branchId),
    
    onMutate: async (branchId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.branches.lists() })
      
      const previousBranches = queryClient.getQueryData(queryKeys.branches.lists())
      
      // Optimistically remove from list
      queryClient.setQueryData(queryKeys.branches.lists(), (old: Branch[] = []) =>
        old.filter(branch => branch.id !== branchId)
      )
      
      return { previousBranches }
    },
    
    onError: (err, branchId, context) => {
      if (context?.previousBranches) {
        queryClient.setQueryData(queryKeys.branches.lists(), context.previousBranches)
      }
    },
    
    onSuccess: (_, branchId) => {
      // Remove branch from cache
      queryClient.removeQueries({ queryKey: queryKeys.branches.detail(branchId) })
      
      // Invalidate related queries
      getInvalidationKeys.branch().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Branch Configuration Mutations

// Create branch configuration mutation
export const useCreateBranchConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateBranchConfigParams) => branchService.createBranchConfig(data),
    onSuccess: (newConfig) => {
      getInvalidationKeys.branchConfig(newConfig.branch).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Update branch configuration mutation
export const useUpdateBranchConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateBranchConfigParams) => branchService.patchBranchConfig(data),
    onSuccess: (updatedConfig) => {
      // Update specific config in cache
      queryClient.setQueryData(queryKeys.branches.config(updatedConfig.id), updatedConfig)
      
      // Invalidate related queries
      getInvalidationKeys.branchConfig(updatedConfig.branch).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// Delete branch configuration mutation
export const useDeleteBranchConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (configId: number) => branchService.deleteBranchConfig(configId),
    onSuccess: () => {
      // Invalidate configs list
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.configs() })
    },
  })
}

// Custom hook for branch statistics
export const useBranchStats = () => {
  const branchesQuery = useBranches()
  
  if (!branchesQuery.data) {
    return {
      totalBranches: 0,
      activeBranches: 0,
      inactiveBranches: 0,
      maintenanceBranches: 0,
      totalProducts: 0,
      totalStaff: 0,
      isLoading: branchesQuery.isLoading,
      error: branchesQuery.error,
    }
  }
  
  const branches = branchesQuery.data
  const activeBranches = branches.filter(b => b.status === 'active')
  const inactiveBranches = branches.filter(b => b.status === 'inactive')
  const maintenanceBranches = branches.filter(b => b.status === 'maintenance')
  const totalProducts = branches.reduce((sum, b) => sum + (b.total_products || 0), 0)
  const totalStaff = branches.reduce((sum, b) => sum + (b.staff_count || b.user_count || 0), 0)
  
  return {
    totalBranches: branches.length,
    activeBranches: activeBranches.length,
    inactiveBranches: inactiveBranches.length,
    maintenanceBranches: maintenanceBranches.length,
    totalProducts,
    totalStaff,
    isLoading: branchesQuery.isLoading,
    error: branchesQuery.error,
  }
}