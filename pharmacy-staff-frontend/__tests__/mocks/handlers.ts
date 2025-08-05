import { http, HttpResponse } from 'msw'
import type { 
  Product, 
  Medicine, 
  Supplement, 
  MedicalDevice,
  User,
  Order,
  Inventory,
  Delivery,
  Report,
  Branch,
  LoyaltyPoints
} from '@/lib/types'

// Mock data generators
const createMockMedicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 1,
  name: 'Paracetamol',
  product_type: 'medicine',
  price: '10.50',
  requires_prescription: false,
  created_at: '2024-01-01T00:00:00Z',
  active_ingredient: 'Paracetamol',
  dosage_form: 'tablet',
  strength: '500mg',
  is_prescription: false,
  stock: 100,
  ...overrides,
})

const createMockSupplement = (overrides: Partial<Supplement> = {}): Supplement => ({
  id: 2,
  name: 'Vitamin D3',
  product_type: 'supplement',
  price: '25.00',
  requires_prescription: false,
  created_at: '2024-01-01T00:00:00Z',
  supplement_type: 'vitamin',
  ingredients: ['Vitamin D3'],
  stock: 50,
  ...overrides,
})

const createMockMedicalDevice = (overrides: Partial<MedicalDevice> = {}): MedicalDevice => ({
  id: 3,
  name: 'Blood Pressure Monitor',
  product_type: 'medical_device',
  price: '150.00',
  requires_prescription: false,
  created_at: '2024-01-01T00:00:00Z',
  device_type: 'diagnostic',
  device_class: 'II',
  stock: 10,
  ...overrides,
})

const createMockUser = (overrides: Partial<User> = {}): User => ({
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

const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  customer: 1,
  customer_name: 'John Doe',
  total_amount: '35.50',
  status: 'pending',
  order_type: 'in_store',
  order_date: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockInventory = (overrides: Partial<Inventory> = {}): Inventory => ({
  id: 1,
  product: 1,
  product_name: 'Paracetamol',
  current_stock: 100,
  minimum_stock: 20,
  is_low_stock: false,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockBranch = (overrides: Partial<Branch> = {}): Branch => ({
  id: 1,
  name: 'Main Branch',
  address: '123 Main St',
  phone: '+1234567890',
  email: 'main@pharmacy.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// API Base URL
const API_BASE = 'https://longchau-pms.onrender.com/api'

// Enhanced mock data with more realistic scenarios
const createMockOrderWithItems = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  customer: 1,
  customer_name: 'John Doe',
  total_amount: '35.50',
  status: 'pending',
  order_type: 'in_store',
  order_date: '2024-01-01T00:00:00Z',
  payment_method: 'cash',
  items: [
    {
      id: 1,
      product: 1,
      product_name: 'Paracetamol',
      quantity: 2,
      unit_price: '10.50'
    },
    {
      id: 2,
      product: 2,
      product_name: 'Ibuprofen',
      quantity: 1,
      unit_price: '15.25'
    }
  ],
  ...overrides,
})

// Mock data for complex scenarios
const mockUsersWithRoles = [
  createMockUser({ id: 1, role: 'customer', first_name: 'John', last_name: 'Doe' }),
  createMockUser({ id: 2, role: 'vip_customer', first_name: 'Jane', last_name: 'Smith' }),
  createMockUser({ id: 3, role: 'pharmacist', first_name: 'Dr. Bob', last_name: 'Wilson' }),
  createMockUser({ id: 4, role: 'admin', first_name: 'Admin', last_name: 'User' }),
]

const mockOrdersWithVariousStatuses = [
  createMockOrderWithItems({ id: 1, status: 'pending', total_amount: '25.50' }),
  createMockOrderWithItems({ id: 2, status: 'processing', total_amount: '45.75' }),
  createMockOrderWithItems({ id: 3, status: 'completed', total_amount: '89.25' }),
  createMockOrderWithItems({ id: 4, status: 'cancelled', total_amount: '15.00' }),
]

export const handlers = [
  // Product endpoints
  http.get(`${API_BASE}/products/`, () => {
    return HttpResponse.json([
      createMockMedicine(),
      createMockSupplement(),
      createMockMedicalDevice(),
    ])
  }),

  http.get(`${API_BASE}/products/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    if (id === 1) return HttpResponse.json(createMockMedicine({ id }))
    if (id === 2) return HttpResponse.json(createMockSupplement({ id }))
    if (id === 3) return HttpResponse.json(createMockMedicalDevice({ id }))
    return new HttpResponse(null, { status: 404 })
  }),

  http.post(`${API_BASE}/products/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(createMockMedicine({ 
      id: Date.now(), 
      name: body.name,
      price: body.price,
    }), { status: 201 })
  }),

  // Medicine endpoints
  http.get(`${API_BASE}/medicines/`, () => {
    return HttpResponse.json([
      createMockMedicine(),
      createMockMedicine({ id: 4, name: 'Aspirin', active_ingredient: 'Aspirin' }),
    ])
  }),

  http.get(`${API_BASE}/medicines/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockMedicine({ id }))
  }),

  http.post(`${API_BASE}/medicines/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(createMockMedicine({ 
      id: Date.now(), 
      name: body.name,
      active_ingredient: body.active_ingredient,
    }), { status: 201 })
  }),

  // Supplement endpoints
  http.get(`${API_BASE}/supplements/`, () => {
    return HttpResponse.json([
      createMockSupplement(),
      createMockSupplement({ id: 5, name: 'Omega-3', supplement_type: 'other' }),
    ])
  }),

  http.get(`${API_BASE}/supplements/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockSupplement({ id }))
  }),

  // Medical Device endpoints
  http.get(`${API_BASE}/medical-devices/`, () => {
    return HttpResponse.json([
      createMockMedicalDevice(),
      createMockMedicalDevice({ id: 6, name: 'Thermometer', device_type: 'diagnostic' }),
    ])
  }),

  http.get(`${API_BASE}/medical-devices/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockMedicalDevice({ id }))
  }),

  // User endpoints
  http.get(`${API_BASE}/users/`, () => {
    return HttpResponse.json([
      createMockUser(),
      createMockUser({ id: 2, first_name: 'Jane', last_name: 'Smith', role: 'pharmacist' }),
    ])
  }),

  http.get(`${API_BASE}/users/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockUser({ id }))
  }),

  http.post(`${API_BASE}/users/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(createMockUser({ 
      id: Date.now(), 
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
    }), { status: 201 })
  }),

  // Order endpoints
  http.get(`${API_BASE}/orders/`, () => {
    return HttpResponse.json([
      createMockOrder(),
      createMockOrder({ id: 2, status: 'completed', total_amount: '75.25' }),
    ])
  }),

  http.get(`${API_BASE}/orders/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockOrder({ id }))
  }),

  http.post(`${API_BASE}/orders/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(createMockOrder({ 
      id: Date.now(), 
      customer: body.customer,
      total_amount: body.total_amount || '0.00',
    }), { status: 201 })
  }),

  // Inventory endpoints
  http.get(`${API_BASE}/inventory/`, () => {
    return HttpResponse.json([
      createMockInventory(),
      createMockInventory({ id: 2, product: 2, current_stock: 15, is_low_stock: true }),
    ])
  }),

  http.get(`${API_BASE}/inventory/low_stock/`, () => {
    return HttpResponse.json([
      createMockInventory({ id: 2, product: 2, current_stock: 15, is_low_stock: true }),
    ])
  }),

  // Branch endpoints
  http.get(`${API_BASE}/branches/`, () => {
    return HttpResponse.json([
      createMockBranch(),
      createMockBranch({ id: 2, name: 'Secondary Branch', address: '456 Oak St' }),
    ])
  }),

  http.get(`${API_BASE}/branches/:id/`, ({ params }) => {
    const id = parseInt(params.id as string)
    return HttpResponse.json(createMockBranch({ id }))
  }),

  // Reports endpoints
  http.get(`${API_BASE}/reports/`, () => {
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [{
        id: 1,
        generated_by_name: 'Admin User',
        branch_name: 'Main Branch',
        report_summary: { total_sales: 1500 },
        report_name: 'Monthly Sales Report',
        report_type: 'sales',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        report_data: {},
        generated_at: '2024-01-01T00:00:00Z',
        branch: 1,
        generated_by: 1,
      }],
    })
  }),

  // Loyalty Points endpoints
  http.get(`${API_BASE}/loyalty-points/`, () => {
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [{
        id: 1,
        customer: 1,
        customer_name: 'John Doe',
        points: 150,
        earned_date: '2024-01-01T00:00:00Z',
        expiry_date: '2025-01-01T00:00:00Z',
        transaction_reference: 'ORDER-001',
        is_expired: false,
      }],
    })
  }),

  // Deliveries endpoints
  http.get(`${API_BASE}/deliveries/`, () => {
    return HttpResponse.json([{
      id: 1,
      order_number: 'ORD-001',
      customer_name: 'John Doe',
      assigned_staff_name: 'Jane Smith',
      is_overdue: false,
      delivery_type_display: {
        type: 'Home Delivery',
        is_pickup: false,
        is_home_delivery: true,
        fee: 5.00,
      },
      delivery_type: 'home',
      status: 'scheduled',
      scheduled_date: '2024-01-02T10:00:00Z',
      delivery_address: '123 Customer St',
      delivery_instructions: 'Ring doorbell',
      delivered_date: null,
      created_at: '2024-01-01T00:00:00Z',
      pickup_location: '',
      customer_notified: false,
      delivery_fee: '5.00',
      estimated_delivery_time: '2024-01-02T10:00:00Z',
      gps_coordinates: '',
      order: 1,
      assigned_staff: 2,
    }])
  }),

  // Prescriptions endpoints
  http.get(`${API_BASE}/prescriptions/`, () => {
    return HttpResponse.json([{
      id: 1,
      customer: 1,
      customer_name: 'John Doe',
      doctor_name: 'Dr. Smith',
      prescription_date: '2024-01-01T00:00:00Z',
      status: 'pending',
      medications: [
        { medicine: 1, quantity: 30, instructions: 'Take twice daily' }
      ],
      created_at: '2024-01-01T00:00:00Z',
    }])
  }),

  // Enhanced Order endpoints with filtering and search
  http.get(`${API_BASE}/orders/`, ({ request }) => {
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    const orderType = url.searchParams.get('order_type')
    
    let filteredOrders = [...mockOrdersWithVariousStatuses]
    
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(order =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      )
    }
    
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }
    
    if (orderType && orderType !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.order_type === orderType)
    }
    
    return HttpResponse.json(filteredOrders)
  }),

  // Enhanced User endpoints with role filtering
  http.get(`${API_BASE}/users/`, ({ request }) => {
    const url = new URL(request.url)
    const roleFilter = url.searchParams.get('role')
    const searchTerm = url.searchParams.get('search')
    
    let filteredUsers = [...mockUsersWithRoles]
    
    if (roleFilter && roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter)
    }
    
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return HttpResponse.json(filteredUsers)
  }),

  // Order status transition endpoint
  http.patch(`${API_BASE}/orders/:id/transition/`, async ({ params, request }) => {
    const orderId = parseInt(params.id as string)
    const body = await request.json() as { status: string }
    
    const order = mockOrdersWithVariousStatuses.find(o => o.id === orderId)
    if (!order) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({
      ...order,
      status: body.status
    })
  }),

  // Customer upgrade to VIP endpoint
  http.patch(`${API_BASE}/users/:id/upgrade-to-vip/`, ({ params }) => {
    const userId = parseInt(params.id as string)
    const user = mockUsersWithRoles.find(u => u.id === userId)
    
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({
      ...user,
      role: 'vip_customer'
    })
  }),

  // Factory pattern endpoints
  http.get(`${API_BASE}/user-factory/can-create/:userType/`, ({ params }) => {
    const userType = params.userType as string
    
    // Simulate factory availability
    const canCreate = ['customer', 'vip_customer'].includes(userType)
    
    return HttpResponse.json({ can_create: canCreate })
  }),

  http.post(`${API_BASE}/user-factory/customers/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(
      createMockUser({ 
        id: Date.now(), 
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        role: 'customer'
      }), 
      { status: 201 }
    )
  }),

  http.post(`${API_BASE}/user-factory/vip-customers/`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json(
      createMockUser({ 
        id: Date.now(), 
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        role: 'vip_customer'
      }), 
      { status: 201 }
    )
  }),

  // Statistics endpoints
  http.get(`${API_BASE}/orders/stats/`, () => {
    const stats = {
      totalOrders: mockOrdersWithVariousStatuses.length,
      pendingOrders: mockOrdersWithVariousStatuses.filter(o => o.status === 'pending').length,
      processingOrders: mockOrdersWithVariousStatuses.filter(o => o.status === 'processing').length,
      completedOrders: mockOrdersWithVariousStatuses.filter(o => o.status === 'completed').length,
      totalRevenue: mockOrdersWithVariousStatuses
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
    }
    return HttpResponse.json(stats)
  }),

  http.get(`${API_BASE}/customers/stats/`, () => {
    const customerStats = {
      totalCustomers: mockUsersWithRoles.filter(u => ['customer', 'vip_customer'].includes(u.role)).length,
      vipCustomers: mockUsersWithRoles.filter(u => u.role === 'vip_customer').length,
      regularCustomers: mockUsersWithRoles.filter(u => u.role === 'customer').length,
      activeCustomers: mockUsersWithRoles.filter(u => ['customer', 'vip_customer'].includes(u.role) && u.is_active).length
    }
    return HttpResponse.json(customerStats)
  }),

  // Bulk operations for testing
  http.post(`${API_BASE}/orders/bulk-create/`, async ({ request }) => {
    const body = await request.json() as { orders: any[] }
    const createdOrders = body.orders.map((orderData, index) => 
      createMockOrderWithItems({ 
        id: Date.now() + index,
        ...orderData
      })
    )
    return HttpResponse.json(createdOrders, { status: 201 })
  }),

  // Delay simulation for loading states
  http.get(`${API_BASE}/slow-endpoint/`, () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json({ message: 'Delayed response' }))
      }, 2000)
    })
  }),

  // Error handlers for testing error states
  http.get(`${API_BASE}/error/500`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get(`${API_BASE}/error/404`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get(`${API_BASE}/error/timeout`, () => {
    return new Promise(() => {
      // Never resolves - simulates timeout
    })
  }),

  // Network error simulation
  http.get(`${API_BASE}/error/network`, () => {
    throw new Error('Network Error')
  }),

  // Validation error simulation
  http.post(`${API_BASE}/error/validation`, () => {
    return HttpResponse.json(
      { 
        errors: {
          email: ['This field is required'],
          phone: ['Invalid phone number format']
        }
      },
      { status: 400 }
    )
  }),
]