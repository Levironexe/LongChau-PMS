import axios, { AxiosError, AxiosResponse } from "axios"

// API Configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://longchau-pms.onrender.com/api",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth tokens (if needed)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: any) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login or refresh token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        // Could redirect to login page here
      }
    }
    
    // Transform error for better handling
    const apiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    }
    
    return Promise.reject(apiError)
  }
)

// API Error class for TypeScript
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Utility function for handling API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data
}

// Utility function for creating query parameters
export const createQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}
