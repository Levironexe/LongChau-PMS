import { api, createQueryParams, ApiError } from '../api'
import { Report, CreateReportRequest, ReportsResponse } from '../types'
import { ReportFilters } from '../queryKeys'

// Report Service - All report-related API calls
export const reportService = {
  // GET /api/reports/ - Get all reports with filtering and pagination
  getReports: async (filters?: ReportFilters & { page?: number; page_size?: number }): Promise<ReportsResponse> => {
    try {
      const queryString = filters ? createQueryParams(filters) : ''
      const response = await api.get(`/reports/${queryString ? `?${queryString}` : ''}`)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch reports: ${apiError.message}`)
    }
  },

  // GET /api/reports/{id}/ - Get single report
  getReport: async (id: number): Promise<Report> => {
    try {
      const response = await api.get(`/reports/${id}/`)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch report ${id}: ${apiError.message}`)
    }
  },

  // POST /api/reports/ - Generate new report with validation
  generateReport: async (data: CreateReportRequest): Promise<Report> => {
    try {
      // Validate report_type
      const validTypes = ['sales', 'inventory', 'prescription', 'staff_performance'] as const
      if (!validTypes.includes(data.report_type as any)) {
        throw new Error(`Invalid report type: ${data.report_type}. Must be one of: ${validTypes.join(', ')}`)
      }

      // Validate required fields
      if (!data.report_name || !data.start_date || !data.end_date || !data.branch || !data.generated_by) {
        throw new Error('Missing required fields: report_name, start_date, end_date, branch, generated_by are all required')
      }

      const response = await api.post('/reports/', data)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to generate report: ${apiError.message}`)
    }
  },

  // POST /api/reports/ - Generate sales report (using unified endpoint)
  generateSalesReport: async (data: Omit<CreateReportRequest, 'report_type'>): Promise<Report> => {
    const salesReportData = {
      ...data,
      report_type: 'sales' as const
    }
    return reportService.generateReport(salesReportData)
  },

  // POST /api/reports/ - Generate staff performance report (using unified endpoint)
  generateStaffReport: async (data: Omit<CreateReportRequest, 'report_type'>): Promise<Report> => {
    const staffReportData = {
      ...data,
      report_type: 'staff_performance' as const
    }
    return reportService.generateReport(staffReportData)
  },

  // POST /api/reports/ - Generate inventory report (using unified endpoint)
  generateInventoryReport: async (data: Omit<CreateReportRequest, 'report_type'>): Promise<Report> => {
    const inventoryReportData = {
      ...data,
      report_type: 'inventory' as const
    }
    return reportService.generateReport(inventoryReportData)
  },

  // POST /api/reports/ - Generate prescription report (using unified endpoint)
  generatePrescriptionReport: async (data: Omit<CreateReportRequest, 'report_type'>): Promise<Report> => {
    const prescriptionReportData = {
      ...data,
      report_type: 'prescription' as const
    }
    return reportService.generateReport(prescriptionReportData)
  },

  // PUT /api/reports/{id}/ - Update entire report
  updateReport: async ({ id, ...data }: { id: number } & CreateReportRequest): Promise<Report> => {
    try {
      // Validate report_type if provided
      const validTypes = ['sales', 'inventory', 'prescription', 'staff_performance'] as const
      if (data.report_type && !validTypes.includes(data.report_type as any)) {
        throw new Error(`Invalid report type: ${data.report_type}. Must be one of: ${validTypes.join(', ')}`)
      }

      const response = await api.put(`/reports/${id}/`, data)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to update report ${id}: ${apiError.message}`)
    }
  },

  // PATCH /api/reports/{id}/ - Partial update report
  patchReport: async ({ id, ...data }: { id: number } & Partial<CreateReportRequest>): Promise<Report> => {
    try {
      // Validate report_type if provided
      if (data.report_type) {
        const validTypes = ['sales', 'inventory', 'prescription', 'staff_performance'] as const
        if (!validTypes.includes(data.report_type as any)) {
          throw new Error(`Invalid report type: ${data.report_type}. Must be one of: ${validTypes.join(', ')}`)
        }
      }

      const response = await api.patch(`/reports/${id}/`, data)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to update report ${id}: ${apiError.message}`)
    }
  },

  // DELETE /api/reports/{id}/ - Delete report
  deleteReport: async (id: number): Promise<void> => {
    try {
      await api.delete(`/reports/${id}/`)
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to delete report ${id}: ${apiError.message}`)
    }
  },

  // Convenience methods for filtering by report type with pagination support
  getSalesReports: async (pagination?: { page?: number; page_size?: number }): Promise<Report[]> => {
    try {
      const response = await reportService.getReports({ 
        report_type: 'sales',
        ...pagination
      })
      return response.results
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch sales reports: ${apiError.message}`)
    }
  },

  getStaffReports: async (pagination?: { page?: number; page_size?: number }): Promise<Report[]> => {
    try {
      const response = await reportService.getReports({ 
        report_type: 'staff_performance',
        ...pagination
      })
      return response.results
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch staff performance reports: ${apiError.message}`)
    }
  },

  getInventoryReports: async (pagination?: { page?: number; page_size?: number }): Promise<Report[]> => {
    try {
      const response = await reportService.getReports({ 
        report_type: 'inventory',
        ...pagination
      })
      return response.results
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch inventory reports: ${apiError.message}`)
    }
  },

  getPrescriptionReports: async (pagination?: { page?: number; page_size?: number }): Promise<Report[]> => {
    try {
      const response = await reportService.getReports({ 
        report_type: 'prescription',
        ...pagination
      })
      return response.results
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch prescription reports: ${apiError.message}`)
    }
  },

  // Helper method for report statistics with error handling
  getReportStats: async (): Promise<{
    total: number
    sales: number
    staff: number
    inventory: number
    prescription: number
  }> => {
    try {
      const allReports = await reportService.getReports()
      const total = allReports.count
      
      // Count by type from results
      const salesCount = allReports.results.filter(r => r.report_type === 'sales').length
      const staffCount = allReports.results.filter(r => r.report_type === 'staff_performance').length
      const inventoryCount = allReports.results.filter(r => r.report_type === 'inventory').length
      const prescriptionCount = allReports.results.filter(r => r.report_type === 'prescription').length

      return {
        total,
        sales: salesCount,
        staff: staffCount,
        inventory: inventoryCount,
        prescription: prescriptionCount
      }
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to get report statistics: ${apiError.message}`)
    }
  },

  // Helper method to get reports by date range
  getReportsByDateRange: async (startDate: string, endDate: string, reportType?: string): Promise<Report[]> => {
    try {
      const filters: ReportFilters = {
        date_from: startDate,
        date_to: endDate
      }
      
      if (reportType) {
        const validTypes = ['sales', 'inventory', 'prescription', 'staff_performance'] as const
        if (!validTypes.includes(reportType as any)) {
          throw new Error(`Invalid report type: ${reportType}. Must be one of: ${validTypes.join(', ')}`)
        }
        filters.report_type = reportType
      }

      const response = await reportService.getReports(filters)
      return response.results
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch reports by date range: ${apiError.message}`)
    }
  }
}

// Type exports for use in hooks
export type GetReportsParams = ReportFilters & { page?: number; page_size?: number }
export type CreateReportParams = CreateReportRequest
export type UpdateReportParams = { id: number } & CreateReportRequest
export type PatchReportParams = { id: number } & Partial<CreateReportRequest>
export type DeleteReportParams = number
export type GetReportsByDateRangeParams = {
  startDate: string
  endDate: string
  reportType?: string
}
export type GetReportsByTypeParams = {
  reportType: 'sales' | 'inventory' | 'prescription' | 'staff_performance'
  pagination?: { page?: number; page_size?: number }
}