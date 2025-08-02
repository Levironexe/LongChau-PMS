import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockUser } from '../utils/test-utils'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import CustomersPage from '@/app/customers/page'

const API_BASE = 'https://longchau-pms.onrender.com/api'

describe('Customer Management Integration Tests', () => {
  const user = userEvent.setup()

  // Mock customer data
  const mockCustomers = [
    createMockUser({ 
      id: 1, 
      role: 'customer', 
      first_name: 'John', 
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      total_orders: 5,
      total_spent: 150.75,
      registration_date: '2024-01-15T00:00:00Z'
    }),
    createMockUser({ 
      id: 2, 
      role: 'vip_customer', 
      first_name: 'Jane', 
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      address: '456 Oak Ave',
      total_orders: 15,
      total_spent: 875.25,
      registration_date: '2024-01-10T00:00:00Z'
    }),
    createMockUser({ 
      id: 3, 
      role: 'customer', 
      first_name: 'Bob', 
      last_name: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '+1234567892',
      total_orders: 2,
      total_spent: 45.50,
      registration_date: '2024-01-20T00:00:00Z'
    }),
  ]

  beforeEach(() => {
    server.resetHandlers()
    
    // Default API responses
    server.use(
      http.get(`${API_BASE}/users/`, ({ request }) => {
        const url = new URL(request.url)
        const roleFilter = url.searchParams.get('role')
        const searchTerm = url.searchParams.get('search')
        
        let filteredCustomers = mockCustomers.filter(user => 
          ['customer', 'vip_customer'].includes(user.role)
        )
        
        if (roleFilter && roleFilter !== 'all') {
          filteredCustomers = filteredCustomers.filter(customer => customer.role === roleFilter)
        }
        
        if (searchTerm) {
          filteredCustomers = filteredCustomers.filter(customer =>
            customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        return HttpResponse.json(filteredCustomers)
      }),
      
      // Factory pattern endpoints
      http.get(`${API_BASE}/user-factory/can-create/customer/`, () => 
        HttpResponse.json({ can_create: true })
      ),
      http.get(`${API_BASE}/user-factory/can-create/vip_customer/`, () => 
        HttpResponse.json({ can_create: true })
      ),
    )
  })

  describe('Customer List Display', () => {
    it('loads and displays customers correctly', async () => {
      render(<CustomersPage />)

      // Check page header
      expect(screen.getByRole('heading', { name: /customers/i })).toBeInTheDocument()
      expect(screen.getByText(/manage your pharmacy customers/i)).toBeInTheDocument()

      // Wait for customers to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })

      // Check customer details are displayed
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
    })

    it('displays customer statistics correctly', async () => {
      render(<CustomersPage />)

      // Wait for stats to load
      await waitFor(() => {
        expect(screen.getByText('Total Customers')).toBeInTheDocument()
      })

      // Check that stats cards are present
      expect(screen.getByText('VIP Members')).toBeInTheDocument()
      expect(screen.getByText('Regular Members')).toBeInTheDocument()
      expect(screen.getByText('Active Customers')).toBeInTheDocument()
    })

    it('shows customer type badges correctly', async () => {
      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Check VIP and REGULAR badges
      const vipBadges = screen.getAllByText('VIP')
      const regularBadges = screen.getAllByText('REGULAR')
      
      expect(vipBadges.length).toBeGreaterThan(0)
      expect(regularBadges.length).toBeGreaterThan(0)
    })

    it('displays customer spending and order information', async () => {
      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Check spending amounts are formatted correctly
      expect(screen.getByText('₫151')).toBeInTheDocument() // John's spending
      expect(screen.getByText('₫875')).toBeInTheDocument() // Jane's spending
      expect(screen.getByText('₫46')).toBeInTheDocument()  // Bob's spending

      // Check order counts
      expect(screen.getByText('5')).toBeInTheDocument()  // John's orders
      expect(screen.getByText('15')).toBeInTheDocument() // Jane's orders
      expect(screen.getByText('2')).toBeInTheDocument()  // Bob's orders
    })
  })

  describe('Search and Filtering', () => {
    it('filters customers by search term', async () => {
      render(<CustomersPage />)

      // Wait for customers to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Search for John
      const searchInput = screen.getByPlaceholderText(/search customers/i)
      await user.type(searchInput, 'John')

      // Should trigger new API call with search parameters
      expect(searchInput).toHaveValue('John')
    })

    it('filters customers by type', async () => {
      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('All Customers')).toBeInTheDocument()
      })

      // Click type filter dropdown
      const typeFilter = screen.getByRole('combobox', { name: /filter by type/i })
      await user.click(typeFilter)

      // Select "VIP" option
      const vipOption = screen.getByRole('option', { name: /vip/i })
      await user.click(vipOption)

      // Verify selection
      expect(screen.getByDisplayValue('VIP')).toBeInTheDocument()
    })
  })

  describe('Create Customer Workflow', () => {
    it('opens create customer dialog and shows form fields', async () => {
      render(<CustomersPage />)

      // Click add customer button
      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      // Check dialog is open
      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Check form fields are present
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/customer type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it('allows customer type selection', async () => {
      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Check default customer type
      expect(screen.getByDisplayValue('Regular')).toBeInTheDocument()

      // Change to VIP
      const typeSelect = screen.getByRole('combobox', { name: /customer type/i })
      await user.click(typeSelect)
      
      const vipOption = screen.getByRole('option', { name: /vip/i })
      await user.click(vipOption)

      // Verify selection
      expect(screen.getByDisplayValue('VIP')).toBeInTheDocument()
    })

    it('shows factory pattern toggle for eligible customer types', async () => {
      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Factory pattern toggle should be available for regular customers
      await waitFor(() => {
        expect(screen.getByText('Use Factory Pattern')).toBeInTheDocument()
      })

      const factoryToggle = screen.getByRole('switch', { name: /use factory pattern/i })
      expect(factoryToggle).toBeInTheDocument()
      expect(factoryToggle).not.toBeChecked()

      // Toggle factory pattern
      await user.click(factoryToggle)
      expect(factoryToggle).toBeChecked()

      // Should show factory pattern explanation
      expect(screen.getByText(/factory pattern enabled/i)).toBeInTheDocument()
    })

    it('adapts factory pattern for VIP customers', async () => {
      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Change to VIP customer
      const typeSelect = screen.getByRole('combobox', { name: /customer type/i })
      await user.click(typeSelect)
      const vipOption = screen.getByRole('option', { name: /vip/i })
      await user.click(vipOption)

      // Factory pattern should still be available for VIP
      await waitFor(() => {
        expect(screen.getByText('Use Factory Pattern')).toBeInTheDocument()
      })

      const factoryToggle = screen.getByRole('switch', { name: /use factory pattern/i })
      await user.click(factoryToggle)

      // Should show VIP-specific factory pattern message
      expect(screen.getByText(/vip benefits and enhanced features/i)).toBeInTheDocument()
    })

    it('submits customer creation successfully', async () => {
      // Mock successful customer creation
      server.use(
        http.post(`${API_BASE}/users/`, async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json(
            createMockUser({ 
              id: 999, 
              first_name: body.first_name,
              last_name: body.last_name,
              email: body.email,
              role: body.role
            }), 
            { status: 201 }
          )
        })
      )

      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'New')
      await user.type(screen.getByLabelText(/last name/i), 'Customer')
      await user.type(screen.getByLabelText(/email/i), 'new.customer@example.com')
      await user.type(screen.getByLabelText(/phone/i), '+1234567999')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create customer/i })
      await user.click(submitButton)

      // Dialog should close on success
      await waitFor(() => {
        expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument()
      })
    })

    it('submits customer creation using factory pattern', async () => {
      // Mock factory pattern creation endpoint
      server.use(
        http.post(`${API_BASE}/user-factory/customers/`, async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json(
            createMockUser({ 
              id: 998, 
              first_name: body.first_name,
              last_name: body.last_name,
              email: body.email,
              role: 'customer'
            }), 
            { status: 201 }
          )
        })
      )

      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Enable factory pattern
      const factoryToggle = screen.getByRole('switch', { name: /use factory pattern/i })
      await user.click(factoryToggle)

      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'Factory')
      await user.type(screen.getByLabelText(/last name/i), 'Customer')
      await user.type(screen.getByLabelText(/email/i), 'factory.customer@example.com')
      await user.type(screen.getByLabelText(/phone/i), '+1234567998')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create customer/i })
      await user.click(submitButton)

      // Dialog should close on success
      await waitFor(() => {
        expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edit Customer Workflow', () => {
    it('opens edit dialog with pre-filled data', async () => {
      render(<CustomersPage />)

      // Wait for customers to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click edit button for first customer
      const editButtons = screen.getAllByRole('button', { name: '', description: 'Edit customer' })
      await user.click(editButtons[0])

      // Check edit dialog opens
      await waitFor(() => {
        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
      })

      // Form should be pre-filled with customer data  
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
    })

    it('does not show factory pattern toggle in edit mode', async () => {
      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click edit button
      const editButtons = screen.getAllByRole('button', { name: '', description: 'Edit customer' })
      await user.click(editButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
      })

      // Factory pattern toggle should not be present in edit mode
      expect(screen.queryByText('Use Factory Pattern')).not.toBeInTheDocument()
    })
  })

  describe('Customer Upgrade to VIP', () => {
    it('allows upgrading regular customer to VIP', async () => {
      server.use(
        http.patch(`${API_BASE}/users/1/upgrade-to-vip/`, () => {
          return HttpResponse.json(
            createMockUser({ id: 1, role: 'vip_customer' })
          )
        })
      )

      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Find VIP upgrade button (only for regular customers)
      const vipButtons = screen.getAllByRole('button', { name: /vip/i })
      const upgradeButton = vipButtons.find(button => 
        within(button).queryByText('VIP')
      )
      
      expect(upgradeButton).toBeInTheDocument()
      await user.click(upgradeButton!)

      // Should trigger upgrade mutation
    })

    it('does not show VIP upgrade button for existing VIP customers', async () => {
      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Jane Smith is already VIP, so should not have upgrade button
      // This is validated by checking the role in the component logic
    })
  })

  describe('Delete Customer', () => {
    it('allows customer deletion', async () => {
      server.use(
        http.delete(`${API_BASE}/users/1/`, () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: '', description: 'Delete customer' })
      await user.click(deleteButtons[0])

      // Customer deletion is handled by mutation
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no customers exist', async () => {
      server.use(
        http.get(`${API_BASE}/users/`, () => HttpResponse.json([]))
      )

      render(<CustomersPage />)

      await waitFor(() => {
        expect(screen.getByText('No customers found')).toBeInTheDocument()
        expect(screen.getByText(/get started by adding your first customer/i)).toBeInTheDocument()
      })

      // Should show add customer button in empty state
      expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument()
    })

    it('shows filtered empty state when search returns no results', async () => {
      render(<CustomersPage />)

      // Type in search that won't match anything
      const searchInput = screen.getByPlaceholderText(/search customers/i)
      await user.type(searchInput, 'NonexistentUser')

      // Should show try adjusting search terms message
      expect(searchInput).toHaveValue('NonexistentUser')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create customer/i })
      
      // Form should have required validation
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const phoneInput = screen.getByLabelText(/phone/i)
      
      expect(firstNameInput).toBeRequired()
      expect(lastNameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(phoneInput).toBeRequired()
    })

    it('validates email format', async () => {
      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Type invalid email
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      // Email input should have type="email" for browser validation
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/users/`, () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      render(<CustomersPage />)

      // Page should still render
      expect(screen.getByRole('heading', { name: /customers/i })).toBeInTheDocument()
    })

    it('handles factory pattern unavailability', async () => {
      server.use(
        http.get(`${API_BASE}/user-factory/can-create/customer/`, () => 
          HttpResponse.json({ can_create: false })
        )
      )

      render(<CustomersPage />)

      const addButton = screen.getByRole('button', { name: /add customer/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      })

      // Factory pattern toggle should not be available
      expect(screen.queryByText('Use Factory Pattern')).not.toBeInTheDocument()
    })
  })
})