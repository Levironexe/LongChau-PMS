import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { queryKeys, getInvalidationKeys, ReportFilters } from '@/lib/queryKeys'
import { reportService, CreateReportParams, UpdateReportParams, PatchReportParams, DeleteReportParams, GetReportsByDateRangeParams } from '@/lib/services/reportService'
import { Report, ReportsResponse } from '@/lib/types'
import { ApiError } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Query Hooks (GET operations)

// Get all reports with filtering and pagination
export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: queryKeys.reports.list(filters || {}),
    queryFn: () => reportService.getReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get single report
export const useReport = (id: number) => {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => reportService.getReport(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

// Get sales reports only with pagination support
export const useSalesReports = (pagination?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: queryKeys.reports.sales(),
    queryFn: () => reportService.getSalesReports(pagination),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get staff performance reports only with pagination support
export const useStaffReports = (pagination?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: queryKeys.reports.staff(),
    queryFn: () => reportService.getStaffReports(pagination),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get inventory reports only with pagination support
export const useInventoryReports = (pagination?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: queryKeys.reports.inventory(),
    queryFn: () => reportService.getInventoryReports(pagination),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get prescription reports only with pagination support
export const usePrescriptionReports = (pagination?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: queryKeys.reports.prescription(),
    queryFn: () => reportService.getPrescriptionReports(pagination),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get reports by date range
export const useReportsByDateRange = (params: GetReportsByDateRangeParams) => {
  return useQuery({
    queryKey: queryKeys.reports.dateRange(params.startDate, params.endDate, params.reportType),
    queryFn: () => reportService.getReportsByDateRange(params.startDate, params.endDate, params.reportType),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get reports by branch
export const useReportsByBranch = (branchId: number, filters?: Omit<ReportFilters, 'branch'>) => {
  return useQuery({
    queryKey: queryKeys.reports.list({ ...filters, branch: branchId }),
    queryFn: () => reportService.getReports({ ...filters, branch: branchId }),
    enabled: !!branchId && branchId > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Get report statistics
export const useReportStats = () => {
  return useQuery({
    queryKey: queryKeys.reports.stats(),
    queryFn: () => reportService.getReportStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes for fresh stats
    retry: 3,
  })
}

// Custom hook for comprehensive report statistics (computed from reports data)
export const useReportsOverviewStats = () => {
  const reportsQuery = useReports()
  
  if (!reportsQuery.data) {
    return {
      totalReports: 0,
      salesReports: 0,
      staffReports: 0,
      inventoryReports: 0,
      prescriptionReports: 0,
      recentReports: 0, // Last 7 days
      reportsByType: {
        sales: 0,
        staff_performance: 0,
        inventory: 0,
        prescription: 0,
      },
      isLoading: reportsQuery.isLoading,
      error: reportsQuery.error,
    }
  }
  
  const reports = reportsQuery.data.results
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const salesReports = reports.filter(r => r.report_type === 'sales')
  const staffReports = reports.filter(r => r.report_type === 'staff_performance')
  const inventoryReports = reports.filter(r => r.report_type === 'inventory')
  const prescriptionReports = reports.filter(r => r.report_type === 'prescription')
  const recentReports = reports.filter(r => new Date(r.generated_at) >= weekAgo)
  
  return {
    totalReports: reportsQuery.data.count,
    salesReports: salesReports.length,
    staffReports: staffReports.length,
    inventoryReports: inventoryReports.length,
    prescriptionReports: prescriptionReports.length,
    recentReports: recentReports.length,
    reportsByType: {
      sales: salesReports.length,
      staff_performance: staffReports.length,
      inventory: inventoryReports.length,
      prescription: prescriptionReports.length,
    },
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
  }
}

// Custom hook for report activity statistics
export const useReportActivityStats = () => {
  const reportsQuery = useReports()
  
  if (!reportsQuery.data) {
    return {
      todayReports: 0,
      weekReports: 0,
      monthReports: 0,
      isLoading: reportsQuery.isLoading,
      error: reportsQuery.error,
    }
  }
  
  const reports = reportsQuery.data.results
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  
  const todayReports = reports.filter(r => new Date(r.generated_at) >= today)
  const weekReports = reports.filter(r => new Date(r.generated_at) >= weekAgo)
  const monthReports = reports.filter(r => new Date(r.generated_at) >= monthAgo)
  
  return {
    todayReports: todayReports.length,
    weekReports: weekReports.length,
    monthReports: monthReports.length,
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
  }
}

// Mutation Hooks (POST/PUT/DELETE operations)

// Generate report mutation (generic)
export const useGenerateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateReportParams) => reportService.generateReport(data),
    
    // Optimistic update
    onMutate: async (newReport) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.lists() })
      
      // Snapshot the previous value
      const previousReports = queryClient.getQueryData<ReportsResponse>(queryKeys.reports.lists())
      
      // Optimistically update the cache
      if (previousReports) {
        const optimisticReport: Report = {
          id: Date.now(), // Temporary ID
          generated_by_name: 'Generating...',
          branch_name: 'Loading...',
          report_summary: {},
          report_name: newReport.report_name,
          report_type: newReport.report_type,
          start_date: newReport.start_date,
          end_date: newReport.end_date,
          report_data: {},
          generated_at: new Date().toISOString(),
          branch: newReport.branch,
          generated_by: newReport.generated_by,
        }
        
        queryClient.setQueryData<ReportsResponse>(queryKeys.reports.lists(), {
          ...previousReports,
          count: previousReports.count + 1,
          results: [optimisticReport, ...previousReports.results],
        })
      }
      
      return { previousReports }
    },
    
    // On success, update with actual server data
    onSuccess: (data) => {
      // Update the specific report detail cache
      queryClient.setQueryData(queryKeys.reports.detail(data.id), data)
      
      // Invalidate related queries using the established pattern
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      // Show success toast
      toast({
        title: 'Report Generated',
        description: `${data.report_name} has been generated successfully.`,
        variant: 'default',
      })
    },
    
    // On error, rollback the optimistic update
    onError: (error: ApiError, variables, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(queryKeys.reports.lists(), context.previousReports)
      }
      
      // Show error toast
      toast({
        title: 'Report Generation Failed',
        description: error.message || 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.lists() })
    }
  })
}

// Generate sales report mutation
export const useGenerateSalesReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<CreateReportParams, 'report_type'>) => reportService.generateSalesReport(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.reports.detail(data.id), data)
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Sales Report Generated',
        description: `${data.report_name} has been generated successfully.`,
        variant: 'default',
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Sales Report Generation Failed',
        description: error.message || 'Failed to generate sales report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Generate staff performance report mutation
export const useGenerateStaffReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<CreateReportParams, 'report_type'>) => reportService.generateStaffReport(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.reports.detail(data.id), data)
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Staff Report Generated',
        description: `${data.report_name} has been generated successfully.`,
        variant: 'default',
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Staff Report Generation Failed',
        description: error.message || 'Failed to generate staff report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Generate inventory report mutation
export const useGenerateInventoryReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<CreateReportParams, 'report_type'>) => reportService.generateInventoryReport(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.reports.detail(data.id), data)
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Inventory Report Generated',
        description: `${data.report_name} has been generated successfully.`,
        variant: 'default',
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Inventory Report Generation Failed',
        description: error.message || 'Failed to generate inventory report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Generate prescription report mutation
export const useGeneratePrescriptionReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<CreateReportParams, 'report_type'>) => reportService.generatePrescriptionReport(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.reports.detail(data.id), data)
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Prescription Report Generated',
        description: `${data.report_name} has been generated successfully.`,
        variant: 'default',
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Prescription Report Generation Failed',
        description: error.message || 'Failed to generate prescription report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Update report mutation
export const useUpdateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateReportParams) => reportService.updateReport(data),
    
    onMutate: async (updatedData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.detail(updatedData.id) })
      
      // Snapshot the previous value
      const previousReport = queryClient.getQueryData(queryKeys.reports.detail(updatedData.id))
      
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.reports.detail(updatedData.id), (old: Report | undefined) => {
        if (!old) return old
        return { ...old, ...updatedData }
      })
      
      return { previousReport }
    },
    
    onSuccess: (updatedReport) => {
      // Update specific report in cache
      queryClient.setQueryData(queryKeys.reports.detail(updatedReport.id), updatedReport)
      
      // Update report in any lists that might contain this report
      queryClient.setQueriesData(
        { queryKey: queryKeys.reports.lists() },
        (oldData: ReportsResponse | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.map(report => 
              report.id === updatedReport.id ? updatedReport : report
            )
          }
        }
      )
      
      // Invalidate related queries
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Report Updated',
        description: `${updatedReport.report_name} has been updated successfully.`,
        variant: 'default',
      })
    },
    
    onError: (error: ApiError, variables, context) => {
      if (context?.previousReport) {
        queryClient.setQueryData(queryKeys.reports.detail(variables.id), context.previousReport)
      }
      
      toast({
        title: 'Report Update Failed',
        description: error.message || 'Failed to update report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Patch report mutation (partial update)
export const usePatchReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: PatchReportParams) => reportService.patchReport(data),
    
    onMutate: async (patchData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.detail(patchData.id) })
      
      // Snapshot the previous value
      const previousReport = queryClient.getQueryData(queryKeys.reports.detail(patchData.id))
      
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.reports.detail(patchData.id), (old: Report | undefined) => {
        if (!old) return old
        return { ...old, ...patchData }
      })
      
      return { previousReport }
    },
    
    onSuccess: (updatedReport) => {
      queryClient.setQueryData(queryKeys.reports.detail(updatedReport.id), updatedReport)
      
      // Update report in any lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.reports.lists() },
        (oldData: ReportsResponse | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.map(report => 
              report.id === updatedReport.id ? updatedReport : report
            )
          }
        }
      )
      
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Report Updated',
        description: `Report has been updated successfully.`,
        variant: 'default',
      })
    },
    
    onError: (error: ApiError, variables, context) => {
      if (context?.previousReport) {
        queryClient.setQueryData(queryKeys.reports.detail(variables.id), context.previousReport)
      }
      
      toast({
        title: 'Report Update Failed',
        description: error.message || 'Failed to update report. Please try again.',
        variant: 'destructive',
      })
    }
  })
}

// Delete report mutation
export const useDeleteReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: DeleteReportParams) => reportService.deleteReport(id),
    
    // Optimistic removal
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.lists() })
      
      // Snapshot the previous value
      const previousReports = queryClient.getQueryData<ReportsResponse>(queryKeys.reports.lists())
      const previousReport = queryClient.getQueryData<Report>(queryKeys.reports.detail(deletedId))
      
      // Optimistically remove from cache
      if (previousReports) {
        queryClient.setQueryData<ReportsResponse>(queryKeys.reports.lists(), {
          ...previousReports,
          count: previousReports.count - 1,
          results: previousReports.results.filter(report => report.id !== deletedId),
        })
      }
      
      return { previousReports, previousReport, deletedId }
    },
    
    // On success, remove from detail cache
    onSuccess: (data, deletedId, context) => {
      queryClient.removeQueries({ queryKey: queryKeys.reports.detail(deletedId) })
      
      // Invalidate all related queries using the established pattern
      getInvalidationKeys.reports().forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      
      toast({
        title: 'Report Deleted',
        description: context?.previousReport?.report_name 
          ? `${context.previousReport.report_name} has been deleted successfully.`
          : 'Report has been deleted successfully.',
        variant: 'default',
      })
    },
    
    // On error, rollback
    onError: (error: ApiError, deletedId, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(queryKeys.reports.lists(), context.previousReports)
      }
      
      toast({
        title: 'Report Deletion Failed',
        description: error.message || 'Failed to delete report. Please try again.',
        variant: 'destructive',
      })
    },
    
    // Always refetch
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.lists() })
    }
  })
}