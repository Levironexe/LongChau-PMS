import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { jest } from '@jest/globals'

// Mock Next.js router
const mockRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  pop: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: true,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
}

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  })
}

const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient() 
}: { 
  children: ReactNode
  queryClient?: QueryClient 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Helper function to create wrapper with specific query client
export const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  )
}

const customRender = (
  ui: ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {}
): RenderResult => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  product_type: 'medicine',
  price: '10.00',
  requires_prescription: false,
  created_at: '2024-01-01T00:00:00Z',
  stock: 100,
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  role: 'customer',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  customer: 1,
  customer_name: 'John Doe',
  total_amount: '35.50',
  status: 'pending',
  order_type: 'in_store',
  order_date: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Utility functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const mockConsoleError = () => {
  const originalError = console.error
  console.error = jest.fn()
  return () => {
    console.error = originalError
  }
}

export const mockConsoleWarn = () => {
  const originalWarn = console.warn
  console.warn = jest.fn()
  return () => {
    console.warn = originalWarn
  }
}

// Mock implementations for common hooks
export const mockUseRouter = (overrides = {}) => ({
  ...mockRouter,
  ...overrides,
})

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render, createTestQueryClient, AllTheProviders, createWrapper }