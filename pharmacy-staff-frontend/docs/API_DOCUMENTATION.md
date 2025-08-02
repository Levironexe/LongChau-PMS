# 🏥 Long Châu PMS - API Documentation

## Overview

This document provides comprehensive documentation for all API hooks, services, and utilities used in the Long Châu Pharmacy Management System frontend application.

## Table of Contents

- [Services](#services)
- [React Query Hooks](#react-query-hooks)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Caching Strategies](#caching-strategies)
- [Testing](#testing)

## Services

All API services are located in `lib/services/` and provide direct interface to the backend REST API.

### User Service (`lib/services/userService.ts`)

Handles all user-related operations including customers, staff, and pharmacists.

#### Core Methods:
```typescript
// Get all users with optional filtering
userService.getUsers(filters?: { role?: string, search?: string }): Promise<User[]>

// Get single user by ID
userService.getUser(id: number): Promise<User>

// Create new user
userService.createUser(data: CreateUserRequest): Promise<User>

// Update user information
userService.updateUser(id: number, data: Partial<User>): Promise<User>

// Delete user
userService.deleteUser(id: number): Promise<void>

// Factory methods
userService.createPharmacist(data: PharmacistData): Promise<User>
userService.createVipCustomer(data: CustomerData): Promise<User>
userService.upgradeToVip(id: number, reason?: string): Promise<User>
```

#### Usage Example:
```typescript
import { userService } from '@/lib/services/userService'

// Create a new pharmacist
const newPharmacist = await userService.createPharmacist({
  first_name: 'Dr. Sarah',
  last_name: 'Wilson',
  email: 'sarah@pharmacy.com',
  license_number: 'PHM12345'
})

// Upgrade customer to VIP
const vipCustomer = await userService.upgradeToVip(123, 'High purchase volume')
```

### Order Service (`lib/services/orderService.ts`)

Manages order operations with state pattern and strategy pattern implementations.

#### Core Methods:
```typescript
// Get all orders with filtering
orderService.getOrders(filters?: OrderFilters): Promise<Order[]>

// Get single order
orderService.getOrder(id: number): Promise<Order>

// Create new order
orderService.createOrder(data: CreateOrderRequest): Promise<Order>

// Update order (full update)
orderService.updateOrder(data: UpdateOrderRequest): Promise<Order>

// Partial update
orderService.patchOrder(data: PatchOrderRequest): Promise<Order>

// State pattern transitions
orderService.transitionOrder(id: number, status: OrderStatus): Promise<Order>

// Strategy pattern processing
orderService.processOrder(id: number, action?: string): Promise<Order>

// Calculate order total
orderService.calculateTotal(id: number): Promise<OrderTotal>
```

#### Usage Example:
```typescript
import { orderService } from '@/lib/services/orderService'

// Create a new prescription order
const newOrder = await orderService.createOrder({
  customer: 123,
  order_type: 'prescription',
  order_items: [
    { product: 456, quantity: 2, unit_price: '15.50' }
  ]
})

// Transition order status safely
const processedOrder = await orderService.transitionOrder(newOrder.id, 'processing')
```

### Product Service (`lib/services/productService.ts`)

Handles all product-related operations including medicines, supplements, and medical devices.

#### Core Methods:
```typescript
// Get medicines with filtering
productService.getMedicines(filters?: ProductFilters): Promise<Medicine[]>

// Get supplements
productService.getSupplements(filters?: ProductFilters): Promise<Supplement[]>

// Get medical devices
productService.getMedicalDevices(filters?: ProductFilters): Promise<MedicalDevice[]>

// Unified product search
productService.searchProducts(query: string, filters?: ProductFilters): Promise<Product[]>

// Create new product
productService.createMedicine(data: CreateMedicineRequest): Promise<Medicine>
productService.createSupplement(data: CreateSupplementRequest): Promise<Supplement>
productService.createMedicalDevice(data: CreateMedicalDeviceRequest): Promise<MedicalDevice>
```

## React Query Hooks

All hooks are located in `hooks/api/` and provide React Query integration with automatic caching, loading states, and error handling.

### User Hooks (`hooks/api/useUsers.ts`)

#### Query Hooks:
```typescript
// Get all users
const { data: users, isLoading, error } = useUsers(filters?)

// Get single user
const { data: user } = useUser(id)

// Get users by role
const { data: customers } = useCustomers()
const { data: pharmacists } = usePharmacists()
const { data: staff } = useStaff()

// User statistics
const { data: stats } = useUserStats()
```

#### Mutation Hooks:
```typescript
// Create user
const createUserMutation = useCreateUser()
createUserMutation.mutate(userData)

// Update user
const updateUserMutation = useUpdateUser()
updateUserMutation.mutate({ id: 123, ...updateData })

// Delete user
const deleteUserMutation = useDeleteUser()
deleteUserMutation.mutate(123)

// Factory methods
const createPharmacistMutation = useCreatePharmacist()
const upgradeToVipMutation = useUpgradeToVip()
```

#### Usage Example:
```typescript
import { useUsers, useCreateUser } from '@/hooks/api/useUsers'

function CustomerManagement() {
  const { data: customers, isLoading } = useUsers({ role: 'customer' })
  const createCustomerMutation = useCreateUser()

  const handleCreateCustomer = (data) => {
    createCustomerMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Customer created successfully!')
      },
      onError: (error) => {
        toast.error(`Failed to create customer: ${error.message}`)
      }
    })
  }

  if (isLoading) return <Loading />

  return (
    <div>
      {customers?.map(customer => 
        <CustomerCard key={customer.id} customer={customer} />
      )}
    </div>
  )
}
```

### Order Hooks (`hooks/api/useOrders.ts`)

#### Query Hooks:
```typescript
// Get all orders
const { data: orders, isLoading } = useOrders(filters?)

// Get single order
const { data: order } = useOrder(id)

// Get orders by type
const { data: prescriptionOrders } = usePrescriptionOrders()
const { data: inStoreOrders } = useInStoreOrders()
const { data: onlineOrders } = useOnlineOrders()

// Order statistics
const { data: orderStats } = useOrderStats()
```

#### Mutation Hooks:
```typescript
// Create order
const createOrderMutation = useCreateOrder()

// Update order
const updateOrderMutation = useUpdateOrder()

// Process order with state pattern
const transitionOrderMutation = useTransitionOrder()

// Process order with strategy pattern
const processOrderMutation = useProcessOrder()
```

### Product Hooks (`hooks/api/useProducts.ts`)

#### Query Hooks:
```typescript
// Get medicines
const { data: medicines } = useMedicines(filters?)

// Get supplements
const { data: supplements } = useSupplements(filters?)

// Get medical devices
const { data: devices } = useMedicalDevices(filters?)

// Unified product search
const { data: searchResults } = useProductSearch(query, filters?)

// Product statistics
const { data: productStats } = useProductStats()
```

### Inventory Hooks (`hooks/api/useInventory.ts`)

#### Query Hooks:
```typescript
// Get inventory records
const { data: inventory } = useInventoryRecords(filters?)

// Get low stock items
const { data: lowStock } = useLowStockRecords()

// Get inventory by branch
const { data: branchInventory } = useInventoryRecordsByBranch(branchId)

// Get inventory transactions
const { data: transactions } = useInventoryTransactions(filters?)

// Inventory statistics
const { data: inventoryStats } = useInventoryStats()
```

## Usage Examples

### Complete Order Management Flow

```typescript
import { 
  useOrders, 
  useCreateOrder, 
  useTransitionOrder,
  useProcessOrder 
} from '@/hooks/api/useOrders'

function OrderManagement() {
  const { data: orders, isLoading } = useOrders()
  const createOrderMutation = useCreateOrder()
  const transitionOrderMutation = useTransitionOrder()
  const processOrderMutation = useProcessOrder()

  // Create new order
  const handleCreateOrder = async (orderData) => {
    const newOrder = await createOrderMutation.mutateAsync(orderData)
    
    // Transition to processing
    await transitionOrderMutation.mutateAsync({
      id: newOrder.id,
      status: 'processing'
    })
    
    // Process with high priority
    await processOrderMutation.mutateAsync({
      id: newOrder.id,
      action: 'fulfill_priority'
    })
  }

  return (
    <div>
      <OrderForm onSubmit={handleCreateOrder} />
      <OrderList orders={orders} />
    </div>
  )
}
```

### Customer VIP Upgrade Workflow

```typescript
import { useUpgradeToVip, useUsers } from '@/hooks/api/useUsers'

function CustomerUpgrade({ customerId }) {
  const { data: customer } = useUser(customerId)
  const upgradeToVipMutation = useUpgradeToVip()

  const handleUpgrade = () => {
    upgradeToVipMutation.mutate(
      { 
        id: customerId, 
        reason: 'High purchase volume' 
      },
      {
        onSuccess: (upgradedCustomer) => {
          toast.success(`${upgradedCustomer.first_name} upgraded to VIP!`)
        }
      }
    )
  }

  return (
    <div>
      <CustomerInfo customer={customer} />
      {customer?.role === 'customer' && (
        <Button 
          onClick={handleUpgrade}
          loading={upgradeToVipMutation.isLoading}
        >
          Upgrade to VIP
        </Button>
      )}
    </div>
  )
}
```

## Error Handling

All hooks and services implement comprehensive error handling:

### Service Level Error Handling

```typescript
// Services automatically throw errors for HTTP error status codes
try {
  const user = await userService.getUser(123)
} catch (error) {
  if (error.response?.status === 404) {
    console.log('User not found')
  } else if (error.response?.status === 401) {
    console.log('Unauthorized access')
  } else {
    console.log('Network or server error')
  }
}
```

### Hook Level Error Handling

```typescript
const { data, error, isError, isLoading } = useUsers()

// Programmatic error handling
if (isError) {
  console.error('Failed to load users:', error.message)
}

// Mutation error handling
const createUserMutation = useCreateUser()

createUserMutation.mutate(userData, {
  onError: (error) => {
    if (error.response?.status === 400) {
      // Handle validation errors
      setFormErrors(error.response.data)
    } else {
      toast.error('Failed to create user')
    }
  }
})
```

## Caching Strategies

React Query caching is configured per hook type:

### Cache Configuration

```typescript
// Query hooks cache configuration
const CACHE_CONFIG = {
  // Fast-changing data (short cache)
  orders: { staleTime: 30000 }, // 30 seconds
  inventory: { staleTime: 60000 }, // 1 minute
  
  // Stable data (longer cache)
  users: { staleTime: 300000 }, // 5 minutes
  products: { staleTime: 600000 }, // 10 minutes
  branches: { staleTime: 900000 }, // 15 minutes
  
  // Statistics (medium cache)
  stats: { staleTime: 120000 } // 2 minutes
}
```

### Cache Invalidation

```typescript
// Mutations automatically invalidate related queries
const createUserMutation = useCreateUser()

// This will invalidate and refetch:
// - useUsers()
// - useUserStats()
// - useCustomers() (if creating customer)
createUserMutation.mutate(userData)
```

### Manual Cache Management

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { userKeys } from '@/lib/queryKeys'

function UserManagement() {
  const queryClient = useQueryClient()

  // Manually invalidate specific queries
  const refreshUsers = () => {
    queryClient.invalidateQueries(userKeys.all)
  }

  // Manually set query data
  const optimisticUpdate = (userId, newData) => {
    queryClient.setQueryData(
      userKeys.detail(userId),
      newData
    )
  }

  return <div>...</div>
}
```

## Testing

### Service Testing

```typescript
import { userService } from '@/lib/services/userService'

// Mock API calls
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

test('should create user successfully', async () => {
  const mockUser = { id: 1, name: 'John Doe' }
  mockedApi.post.mockResolvedValue({ data: mockUser })

  const result = await userService.createUser(userData)
  
  expect(mockedApi.post).toHaveBeenCalledWith('/users/', userData)
  expect(result).toEqual(mockUser)
})
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsers } from '@/hooks/api/useUsers'

test('should fetch users successfully', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const { result } = renderHook(() => useUsers(), { wrapper })

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })

  expect(result.current.data).toBeDefined()
})
```

## Performance Optimization

### Query Key Management

All query keys are centralized in `lib/queryKeys.ts`:

```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
}
```

### Optimistic Updates

```typescript
const updateUserMutation = useUpdateUser()

updateUserMutation.mutate(
  { id: userId, ...updates },
  {
    // Optimistic update - immediately update UI
    onMutate: async (newUserData) => {
      await queryClient.cancelQueries(userKeys.detail(userId))
      
      const previousUser = queryClient.getQueryData(userKeys.detail(userId))
      
      queryClient.setQueryData(
        userKeys.detail(userId),
        { ...previousUser, ...newUserData }
      )
      
      return { previousUser }
    },
    
    // Rollback on error
    onError: (err, newUserData, context) => {
      queryClient.setQueryData(
        userKeys.detail(userId),
        context.previousUser
      )
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries(userKeys.detail(userId))
    }
  }
)
```

## Environment Configuration

### Environment Variables

Create `.env.local` for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://longchau-pms.onrender.com/api

# Feature Flags
NEXT_PUBLIC_ENABLE_FACTORY_PATTERNS=true
NEXT_PUBLIC_ENABLE_CHARTS=true

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Production Configuration

For Vercel deployment, set environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_API_URL` - Production API URL
- `NEXT_PUBLIC_ENABLE_FACTORY_PATTERNS` - Enable factory patterns
- `NEXT_PUBLIC_ENABLE_CHARTS` - Enable chart visualizations

## Best Practices

1. **Always use hooks for data fetching** - Never call services directly in components
2. **Handle loading and error states** - Provide proper UX feedback
3. **Use optimistic updates for mutations** - Improve perceived performance
4. **Implement proper cache invalidation** - Keep data fresh and consistent
5. **Test API integration thoroughly** - Mock all external dependencies
6. **Follow TypeScript best practices** - Maintain type safety throughout

## Troubleshooting

### Common Issues

1. **Stale data showing**: Check cache invalidation after mutations
2. **Infinite loading states**: Verify query keys are stable
3. **TypeScript errors**: Ensure service and hook types match API responses
4. **Test failures**: Mock all external dependencies properly

### Debug Tools

- **React Query Devtools**: Install for query inspection
- **Network tab**: Monitor actual API calls
- **Console logging**: Add temporary logging for debugging
- **Error boundaries**: Catch and display errors gracefully

This documentation covers the complete API integration architecture for the Long Châu Pharmacy Management System. For specific implementation details, refer to the individual service and hook files in the codebase.