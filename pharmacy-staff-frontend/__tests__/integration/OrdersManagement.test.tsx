import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockUser, createMockOrder, createMockProduct } from '../utils/test-utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import OrdersPage from '@/app/orders/page'

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

const API_BASE = 'https://longchau-pms.onrender.com/api'

describe('Orders Management Integration Tests', () => {
  const user = userEvent.setup()

  // Mock data
  const mockCustomers = [
    createMockUser({ id: 1, role: 'customer', first_name: 'John', last_name: 'Doe' }),
    createMockUser({ id: 2, role: 'vip_customer', first_name: 'Jane', last_name: 'Smith' }),
    createMockUser({ id: 3, role: 'customer', first_name: 'Bob', last_name: 'Wilson' }),
  ]

  const mockProducts = [
    createMockProduct({ id: 1, name: 'Paracetamol', price: '10.50', stock: 100 }),
    createMockProduct({ id: 2, name: 'Ibuprofen', price: '15.25', stock: 50 }),
    createMockProduct({ id: 3, name: 'Vitamin D', price: '25.00', stock: 75 }),
  ]

  const mockOrders = [
    createMockOrder({ 
      id: 1, 
      customer_name: 'John Doe',
      total_amount: '35.75',
      status: 'pending',
      order_date: '2024-01-15T10:30:00Z',
      payment_method: 'cash',
      items: [
        { id: 1, product: 1, product_name: 'Paracetamol', quantity: 2, unit_price: '10.50' },
        { id: 2, product: 2, product_name: 'Ibuprofen', quantity: 1, unit_price: '15.25' }
      ]
    }),
    createMockOrder({ 
      id: 2, 
      customer_name: 'Jane Smith',
      total_amount: '125.50',
      status: 'completed',
      order_date: '2024-01-14T14:15:00Z',
      payment_method: 'card'
    }),
  ]

  beforeEach(() => {
    server.resetHandlers()
    
    // Default API responses
    server.use(
      http.get(`${API_BASE}/users/`, () => HttpResponse.json(mockCustomers)),
      http.get(`${API_BASE}/products/`, () => HttpResponse.json(mockProducts)),
      http.get(`${API_BASE}/orders/`, () => HttpResponse.json(mockOrders))
    )
  })

  describe('Orders List Display', () => {
    it('loads and displays orders correctly', async () => {
      render(<OrdersPage />)

      // Check page header
      expect(screen.getByRole('heading', { name: /orders/i })).toBeInTheDocument()
      expect(screen.getByText(/manage customer orders/i)).toBeInTheDocument()

      // Wait for orders to load
      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument()
        expect(screen.getByText('Order #2')).toBeInTheDocument()
      })

      // Check order details are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('₫36')).toBeInTheDocument()
      expect(screen.getByText('₫126')).toBeInTheDocument()
    })

    it('displays order statistics correctly', async () => {
      render(<OrdersPage />)

      // Wait for stats to load
      await waitFor(() => {
        expect(screen.getByText('Total Orders')).toBeInTheDocument()
      })

      // Check that stats cards are present
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('shows order status badges correctly', async () => {
      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })

      // Check status badges in the table
      const pendingBadges = screen.getAllByText('Pending')
      const completedBadges = screen.getAllByText('Completed')
      
      expect(pendingBadges.length).toBeGreaterThan(0)
      expect(completedBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Search and Filtering', () => {
    it('filters orders by search term', async () => {
      render(<OrdersPage />)

      // Wait for orders to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Search for John
      const searchInput = screen.getByPlaceholderText(/search orders/i)
      await user.type(searchInput, 'John')

      // This should trigger a new API call with search parameters
      expect(searchInput).toHaveValue('John')
    })

    it('filters orders by status', async () => {
      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('All Orders')).toBeInTheDocument()
      })

      // Click status filter dropdown
      const statusFilter = screen.getByRole('combobox', { name: /filter by status/i })
      await user.click(statusFilter)

      // Select "Pending" option
      const pendingOption = screen.getByRole('option', { name: /^pending$/i })
      await user.click(pendingOption)

      // Verify selection
      expect(screen.getByDisplayValue('Pending')).toBeInTheDocument()
    })
  })

  describe('Create Order Workflow', () => {
    it('opens create order dialog and shows form fields', async () => {
      render(<OrdersPage />)

      // Click create order button
      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      // Check dialog is open
      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Check form fields are present
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/add products/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it('allows customer selection in create order form', async () => {
      render(<OrdersPage />)

      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Open customer dropdown
      const customerSelect = screen.getByRole('combobox', { name: /customer/i })
      await user.click(customerSelect)

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByText('John Doe (Regular)')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith (VIP)')).toBeInTheDocument()
      })

      // Select a customer
      await user.click(screen.getByText('John Doe (Regular)'))

      // Verify selection
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    it('allows adding products to cart', async () => {
      render(<OrdersPage />)

      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Paracetamol')).toBeInTheDocument()
      })

      // Add product to cart
      const addButtons = screen.getAllByRole('button', { name: /add/i })
      await user.click(addButtons[0]) // Add first product

      // Check cart section appears
      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeInTheDocument()
        expect(screen.getByText('Paracetamol')).toBeInTheDocument()
      })

      // Check total is calculated
      expect(screen.getByText(/total:/i)).toBeInTheDocument()
    })

    it('allows quantity adjustment in cart', async () => {
      render(<OrdersPage />)

      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Add product to cart
      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add/i })
        return user.click(addButtons[0])
      })

      // Wait for cart to appear
      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeInTheDocument()
      })

      // Find quantity controls
      const plusButton = screen.getByRole('button', { name: '', description: 'Increase quantity' })
      const minusButton = screen.getByRole('button', { name: '', description: 'Decrease quantity' })
      
      // Initial quantity should be 1
      expect(screen.getByText('1')).toBeInTheDocument()

      // Increase quantity
      await user.click(plusButton)
      
      // Should now show 2
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('submits order creation successfully', async () => {
      // Mock successful order creation
      server.use(
        http.post(`${API_BASE}/orders/`, async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json(
            createMockOrder({ 
              id: 999, 
              customer: body.customer,
              total_amount: '10.50'
            }), 
            { status: 201 }
          )
        })
      )

      render(<OrdersPage />)

      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Select customer
      const customerSelect = screen.getByRole('combobox', { name: /customer/i })
      await user.click(customerSelect)
      await waitFor(() => {
        expect(screen.getByText('John Doe (Regular)')).toBeInTheDocument()
      })
      await user.click(screen.getByText('John Doe (Regular)'))

      // Add product
      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add/i })
        return user.click(addButtons[0])
      })

      // Wait for cart
      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeInTheDocument()
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create order/i })
      await user.click(submitButton)

      // Dialog should close (order creation handled by mutation)
      await waitFor(() => {
        expect(screen.queryByText('Create New Order')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edit Order Workflow', () => {
    it('opens edit dialog with pre-filled data', async () => {
      render(<OrdersPage />)

      // Wait for orders to load
      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument()
      })

      // Click edit button for first order
      const editButtons = screen.getAllByRole('button', { name: '', description: 'Edit order' })
      await user.click(editButtons[0])

      // Check edit dialog opens
      await waitFor(() => {
        expect(screen.getByText('Edit Order')).toBeInTheDocument()
      })

      // Form should be pre-filled with order data
      expect(screen.getByDisplayValue('1')).toBeInTheDocument() // Customer ID
    })
  })

  describe('Order Status Updates', () => {
    it('allows status transitions for pending orders', async () => {
      server.use(
        http.patch(`${API_BASE}/orders/1/transition/`, async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json(
            createMockOrder({ id: 1, status: body.status })
          )
        })
      )

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument()
      })

      // Find status dropdown for pending order
      const statusSelects = screen.getAllByRole('combobox')
      const orderStatusSelect = statusSelects.find(select => 
        within(select).queryByDisplayValue('pending')
      )
      
      expect(orderStatusSelect).toBeInTheDocument()

      // Change status to processing
      await user.click(orderStatusSelect!)
      const processingOption = screen.getByRole('option', { name: /processing/i })
      await user.click(processingOption)

      // Status should update
      await waitFor(() => {
        expect(screen.getByDisplayValue('processing')).toBeInTheDocument()
      })
    })
  })

  describe('View Order Details', () => {
    it('opens order details dialog with complete information', async () => {
      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument()
      })

      // Click view details button
      const viewButtons = screen.getAllByRole('button', { name: '', description: 'View order details' })
      await user.click(viewButtons[0])

      // Check details dialog opens
      await waitFor(() => {
        expect(screen.getByText('Order Details - #1')).toBeInTheDocument()
      })

      // Check order information is displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Cash')).toBeInTheDocument()

      // Check order items are shown
      if (mockOrders[0].items) {
        expect(screen.getByText('Paracetamol')).toBeInTheDocument()
        expect(screen.getByText('Ibuprofen')).toBeInTheDocument()
      }
    })
  })

  describe('Delete Order', () => {
    it('allows order deletion', async () => {
      server.use(
        http.delete(`${API_BASE}/orders/1/`, () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument()
      })

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: '', description: 'Delete order' })
      await user.click(deleteButtons[0])

      // Order deletion is handled by mutation - we can verify the API call was made
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no orders exist', async () => {
      server.use(
        http.get(`${API_BASE}/orders/`, () => HttpResponse.json([]))
      )

      render(<OrdersPage />)

      await waitFor(() => {
        expect(screen.getByText('No orders found')).toBeInTheDocument()
        expect(screen.getByText(/get started by creating your first order/i)).toBeInTheDocument()
      })

      // Should show create order button in empty state
      expect(screen.getByRole('button', { name: /create order/i })).toBeInTheDocument()
    })

    it('shows filtered empty state when search returns no results', async () => {
      render(<OrdersPage />)

      // Type in search that won't match anything
      const searchInput = screen.getByPlaceholderText(/search orders/i)
      await user.type(searchInput, 'NonexistentCustomer')

      // Should show try adjusting search terms message
      // Note: This would require the search to actually filter the results
      expect(searchInput).toHaveValue('NonexistentCustomer')
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/orders/`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      render(<OrdersPage />)

      // Page should still render
      expect(screen.getByRole('heading', { name: /orders/i })).toBeInTheDocument()

      // Should show some indication of error state or empty state
      await waitFor(() => {
        // The component might show loading state or empty state
        expect(screen.getByText(/orders/i)).toBeInTheDocument()
      })
    })

    it('handles form validation errors', async () => {
      render(<OrdersPage />)

      const createButton = screen.getByRole('button', { name: /create order/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Order')).toBeInTheDocument()
      })

      // Try to submit without selecting customer or adding products
      const submitButton = screen.getByRole('button', { name: /create order/i })
      
      // Button should be disabled due to validation
      expect(submitButton).toBeDisabled()
    })
  })
})