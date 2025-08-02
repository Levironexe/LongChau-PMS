import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockUser, createMockOrder } from '../utils/test-utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import HomePage from '@/app/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock the chart components to avoid recharts testing complexity
jest.mock('@/components/charts/RevenueChart', () => {
  return function MockRevenueChart({ data }: any) {
    return (
      <div data-testid="revenue-chart">
        Revenue Chart with {data?.length || 0} data points
      </div>
    )
  }
})

jest.mock('@/components/charts/OrdersChart', () => {
  return function MockOrdersChart({ data }: any) {
    return (
      <div data-testid="orders-chart">
        Orders Chart with {data?.length || 0} categories
      </div>
    )
  }
})

jest.mock('@/components/charts/InventoryStatusChart', () => {
  return function MockInventoryStatusChart({ data }: any) {
    return (
      <div data-testid="inventory-chart">
        Inventory Chart with {data?.length || 0} status categories
      </div>
    )
  }
})

const API_BASE = 'https://longchau-pms.onrender.com/api'

describe('Dashboard Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Reset to default handlers before each test
    server.resetHandlers()
  })

  describe('Dashboard Loading and Data Display', () => {
    it('loads dashboard with key metrics from API', async () => {
      // Mock API responses
      const mockUsers = [
        createMockUser({ id: 1, role: 'customer' }),
        createMockUser({ id: 2, role: 'vip_customer', first_name: 'Jane' }),
        createMockUser({ id: 3, role: 'pharmacist', first_name: 'Bob' }),
      ]

      const mockOrders = [
        createMockOrder({ 
          id: 1, 
          total_amount: '25.50', 
          order_date: new Date().toISOString(),
          customer_name: 'John Doe'
        }),
        createMockOrder({ 
          id: 2, 
          total_amount: '45.75', 
          order_date: new Date().toISOString(),
          customer_name: 'Jane Smith'
        }),
      ]

      server.use(
        http.get(`${API_BASE}/users/`, () => {
          return HttpResponse.json(mockUsers)
        }),
        http.get(`${API_BASE}/orders/`, () => {
          return HttpResponse.json(mockOrders)
        })
      )

      render(<HomePage />)

      // Check header is present
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()

      // Wait for data to load and check key metrics
      await waitFor(() => {
        expect(screen.getByText('₫71')).toBeInTheDocument() // Total revenue (25.50 + 45.75)
      })

      // Check orders today count
      expect(screen.getByText('2')).toBeInTheDocument() // Today's orders

      // Check active customers count (customers + vip_customers)
      expect(screen.getByText('2')).toBeInTheDocument() // Active customers

      // Check low stock alerts (should be 0 with mock data)
      expect(screen.getByText('0')).toBeInTheDocument() // Low stock items
    })

    it('displays recent activity with order information', async () => {
      const mockOrders = [
        createMockOrder({ 
          id: 101, 
          total_amount: '125.75', 
          customer_name: 'Alice Johnson',
          order_date: new Date().toISOString()
        }),
        createMockOrder({ 
          id: 102, 
          total_amount: '89.25', 
          customer_name: 'Bob Wilson',
          order_date: new Date().toISOString()
        }),
      ]

      server.use(
        http.get(`${API_BASE}/orders/`, () => {
          return HttpResponse.json(mockOrders)
        })
      )

      render(<HomePage />)

      // Wait for recent activity section to load
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      })

      // Check order information is displayed
      expect(screen.getByText('Order #101')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('₫126')).toBeInTheDocument() // Formatted price

      expect(screen.getByText('Order #102')).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      expect(screen.getByText('₫89')).toBeInTheDocument()
    })

    it('handles loading states gracefully', async () => {
      // Create a delayed response to test loading state
      server.use(
        http.get(`${API_BASE}/users/`, () => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(HttpResponse.json([]))
            }, 100)
          })
        }),
        http.get(`${API_BASE}/orders/`, () => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(HttpResponse.json([]))
            }, 100)
          })
        })
      )

      render(<HomePage />)

      // Dashboard should render immediately with default values
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()

      // Wait for data to resolve
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 for empty data
      })
    })
  })

  describe('Interactive Elements', () => {
    it('allows navigation through quick action buttons', async () => {
      render(<HomePage />)

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      })

      // Check quick action links are present and have correct hrefs
      const manageProductsLink = screen.getByRole('link', { name: /manage products/i })
      expect(manageProductsLink).toHaveAttribute('href', '/products')

      const checkInventoryLink = screen.getByRole('link', { name: /check inventory/i })
      expect(checkInventoryLink).toHaveAttribute('href', '/inventory')

      const manageCustomersLink = screen.getByRole('link', { name: /manage customers/i })
      expect(manageCustomersLink).toHaveAttribute('href', '/customers')

      const manageStaffLink = screen.getByRole('link', { name: /manage staff/i })
      expect(manageStaffLink).toHaveAttribute('href', '/staff')

      const createOrderLink = screen.getByRole('link', { name: /create new order/i })
      expect(createOrderLink).toHaveAttribute('href', '/orders')
    })

    it('navigates through chart tabs correctly', async () => {
      render(<HomePage />)

      // Wait for tabs to render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /revenue/i })).toBeInTheDocument()
      })

      // Check initial state - Revenue tab should be active
      const revenueTab = screen.getByRole('tab', { name: /revenue/i })
      const ordersTab = screen.getByRole('tab', { name: /orders/i })
      const inventoryTab = screen.getByRole('tab', { name: /inventory/i })

      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()

      // Click on Orders tab
      await user.click(ordersTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('orders-chart')).toBeInTheDocument()
      })

      // Click on Inventory tab
      await user.click(inventoryTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('inventory-chart')).toBeInTheDocument()
      })

      // Click back to Revenue tab
      await user.click(revenueTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
      })
    })

    it('shows "New Order" button in header', async () => {
      render(<HomePage />)

      const newOrderButton = screen.getByRole('link', { name: /new order/i })
      expect(newOrderButton).toBeInTheDocument()
      expect(newOrderButton).toHaveAttribute('href', '/orders')
    })
  })

  describe('Low Stock Alerts Section', () => {
    it('displays low stock items correctly', async () => {
      render(<HomePage />)

      // Wait for the low stock section to render
      await waitFor(() => {
        expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      })

      // With mock data, should show "All items are well stocked!"
      expect(screen.getByText('All items are well stocked!')).toBeInTheDocument()

      // Check the success icon is present
      const successElements = screen.getAllByTestId('CheckCircle')
      expect(successElements.length).toBeGreaterThan(0)
    })

    it('shows appropriate badge for low stock status', async () => {
      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      })

      // Should show "0 items" badge
      expect(screen.getByText('0 items')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      // Mock API to return error
      server.use(
        http.get(`${API_BASE}/users/`, () => {
          return new HttpResponse(null, { status: 500 })
        }),
        http.get(`${API_BASE}/orders/`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      render(<HomePage />)

      // Dashboard should still render with default values
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()

      // Should show 0 values when API fails
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design Elements', () => {
    it('renders all grid sections correctly', async () => {
      render(<HomePage />)

      // Check main grid sections are present
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Orders Today')).toBeInTheDocument()
      expect(screen.getByText('Active Customers')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()

      // Check chart overview section
      expect(screen.getByText('Overview')).toBeInTheDocument()

      // Check quick actions section
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()

      // Check recent activity section
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })

  describe('Data Processing and Calculations', () => {
    it('correctly calculates revenue from order data', async () => {
      const mockOrders = [
        createMockOrder({ 
          id: 1, 
          total_amount: '100.00', 
          order_date: new Date().toISOString()
        }),
        createMockOrder({ 
          id: 2, 
          total_amount: '75.50', 
          order_date: new Date().toISOString()
        }),
      ]

      server.use(
        http.get(`${API_BASE}/orders/`, () => {
          return HttpResponse.json(mockOrders)
        })
      )

      render(<HomePage />)

      // Should show calculated total revenue
      await waitFor(() => {
        expect(screen.getByText('₫176')).toBeInTheDocument()
      })
    })

    it('filters customers correctly by role', async () => {
      const mockUsers = [
        createMockUser({ id: 1, role: 'customer' }),
        createMockUser({ id: 2, role: 'vip_customer' }),
        createMockUser({ id: 3, role: 'pharmacist' }), // Should be filtered out
        createMockUser({ id: 4, role: 'admin' }),       // Should be filtered out
      ]

      server.use(
        http.get(`${API_BASE}/users/`, () => {
          return HttpResponse.json(mockUsers)
        })
      )

      render(<HomePage />)

      // Should only count customers and vip_customers (2 total)
      await waitFor(() => {
        const customerCountElements = screen.getAllByText('2')
        expect(customerCountElements.length).toBeGreaterThan(0)
      })
    })
  })
})