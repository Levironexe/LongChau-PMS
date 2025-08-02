# 🧪 Testing Guide - Long Châu PMS

## Overview

This guide provides comprehensive information about the testing infrastructure, methodologies, and best practices implemented in the Long Châu Pharmacy Management System frontend.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Strategies](#testing-strategies)
- [Coverage Reports](#coverage-reports)
- [CI/CD Integration](#cicd-integration)

## Testing Stack

### Core Testing Technologies

- **Jest** - Primary testing framework with Next.js integration
- **React Testing Library** - Component and DOM testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom DOM matchers
- **MSW (Mock Service Worker)** - API mocking for realistic testing

### Configuration Files

```
├── jest.config.js          # Jest configuration with Next.js integration
├── jest.setup.js           # Global test setup and mocks
├── __tests__/
│   ├── utils/
│   │   └── test-utils.tsx  # Custom render utilities
│   ├── mocks/
│   │   └── handlers.ts     # MSW API handlers
│   └── setup/
│       ├── globalSetup.js  # Global test setup
│       └── globalTeardown.js # Global test teardown
```

## Test Structure

### Directory Organization

```
__tests__/
├── services/           # Service layer unit tests
│   ├── orderService.test.ts
│   ├── userService.test.ts
│   └── inventoryService.test.ts
├── hooks/              # React Query hook tests
│   ├── useOrders.test.ts
│   ├── useUsers.test.ts
│   └── useInventory.test.ts
├── integration/        # Component integration tests
│   ├── Dashboard.test.tsx
│   ├── OrderManagement.test.tsx
│   └── CustomerManagement.test.tsx
├── components/         # Component unit tests
│   └── charts/
├── utils/              # Utility functions and test helpers
└── example.test.tsx    # Working example test
```

### Test Categories

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Component + hook + API integration
3. **Service Tests** - API service layer testing
4. **Hook Tests** - React Query custom hooks
5. **Performance Tests** - Loading times and cache behavior

## Running Tests

### Available Test Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci

# Run tests with verbose output and debugging
npm run test:debug

# Run specific test file
npm test -- OrderService.test.ts

# Run tests matching pattern
npm test -- --testPathPattern=services

# Run tests with specific timeout
npm test -- --testTimeout=10000
```

### Test Execution Examples

```bash
# Run service tests only
npm test -- __tests__/services/

# Run hook tests with coverage
npm run test:coverage -- __tests__/hooks/

# Run integration tests in watch mode
npm run test:watch -- __tests__/integration/

# Run all tests excluding slow tests
npm test -- --testPathIgnorePatterns=slow
```

## Writing Tests

### Service Layer Tests

```typescript
// __tests__/services/userService.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import { api } from '@/lib/api'
import { userService } from '@/lib/services/userService'

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  createQueryParams: jest.fn()
}))

const mockedApi = jest.mocked(api)

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', last_name: 'Doe', role: 'customer' }
      ]
      
      mockedApi.get.mockResolvedValue({ data: { results: mockUsers } })

      const result = await userService.getUsers()

      expect(mockedApi.get).toHaveBeenCalledWith('/users/')
      expect(result).toEqual(mockUsers)
    })

    it('should handle API errors', async () => {
      mockedApi.get.mockRejectedValue(new Error('Network error'))

      await expect(userService.getUsers()).rejects.toThrow('Network error')
    })
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        role: 'customer'
      }

      const mockResponse = { data: { id: 1, ...userData } }
      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await userService.createUser(userData)

      expect(mockedApi.post).toHaveBeenCalledWith('/users/', userData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation errors', async () => {
      const invalidUserData = { first_name: '', email: 'invalid-email' }

      mockedApi.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            first_name: ['This field cannot be blank'],
            email: ['Enter a valid email address']
          }
        }
      })

      await expect(userService.createUser(invalidUserData as any))
        .rejects.toThrow()
    })
  })
})
```

### Hook Tests

```typescript
// __tests__/hooks/useUsers.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useUsers, useCreateUser } from '@/hooks/api/useUsers'

// Mock the service
jest.mock('@/lib/services/userService', () => ({
  userService: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
  }
}))

const mockUserService = require('@/lib/services/userService').userService

describe('User Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
        mutations: { retry: false }
      }
    })
    jest.clearAllMocks()
  })

  const createWrapper = (client: QueryClient) => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }

  describe('useUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: 1, first_name: 'John', role: 'customer' },
        { id: 2, first_name: 'Jane', role: 'pharmacist' }
      ]

      mockUserService.getUsers.mockResolvedValue(mockUsers)

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUsers)
      expect(mockUserService.getUsers).toHaveBeenCalledWith(undefined)
    })

    it('should handle loading state', () => {
      mockUserService.getUsers.mockReturnValue(new Promise(() => {}))

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(queryClient)
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to fetch users'
      mockUserService.getUsers.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(queryClient)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error(errorMessage))
    })
  })

  describe('useCreateUser', () => {
    it('should create user successfully', async () => {
      const userData = { first_name: 'John', email: 'john@test.com' }
      const createdUser = { id: 1, ...userData }

      mockUserService.createUser.mockResolvedValue(createdUser)

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(queryClient)
      })

      result.current.mutate(userData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(createdUser)
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData)
    })
  })
})
```

### Component Integration Tests

```typescript
// __tests__/integration/CustomerManagement.test.tsx
import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomerManagement from '@/app/customers/page'

// Mock the hooks
jest.mock('@/hooks/api/useUsers', () => ({
  useUsers: jest.fn(),
  useCreateUser: jest.fn(),
  useUpdateUser: jest.fn(),
  useDeleteUser: jest.fn()
}))

const mockUseUsers = require('@/hooks/api/useUsers').useUsers
const mockUseCreateUser = require('@/hooks/api/useUsers').useCreateUser

describe('Customer Management Integration', () => {
  let queryClient: QueryClient
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    user = userEvent.setup()
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should display customer list correctly', async () => {
    const mockCustomers = [
      { 
        id: 1, 
        first_name: 'John', 
        last_name: 'Doe', 
        email: 'john@example.com',
        role: 'customer' 
      },
      { 
        id: 2, 
        first_name: 'Jane', 
        last_name: 'Smith', 
        email: 'jane@example.com',
        role: 'vip_customer' 
      }
    ]

    mockUseUsers.mockReturnValue({
      data: mockCustomers,
      isLoading: false,
      isError: false
    })

    renderWithQueryClient(<CustomerManagement />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('should handle customer creation workflow', async () => {
    const mockMutate = jest.fn()
    
    mockUseUsers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    })

    mockUseCreateUser.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isError: false
    })

    renderWithQueryClient(<CustomerManagement />)

    // Click create customer button
    const createButton = screen.getByRole('button', { name: /add customer/i })
    await user.click(createButton)

    // Fill in the form
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const emailInput = screen.getByLabelText(/email/i)

    await user.type(firstNameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.type(emailInput, 'john@example.com')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create customer/i })
    await user.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      role: 'customer'
    })
  })

  it('should show loading state', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    })

    renderWithQueryClient(<CustomerManagement />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should show error state', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load customers')
    })

    renderWithQueryClient(<CustomerManagement />)

    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Testing Strategies

### 1. Test Pyramid Approach

```
    /\
   /  \      E2E Tests (Few)
  /____\     Integration Tests (Some)
 /______\    Unit Tests (Many)
```

- **Unit Tests (70%)**: Services, utilities, individual components
- **Integration Tests (20%)**: Component + hook + API combinations
- **E2E Tests (10%)**: Critical user workflows

### 2. Testing Patterns

#### Arrange-Act-Assert Pattern

```typescript
it('should create user successfully', async () => {
  // Arrange
  const userData = { first_name: 'John', email: 'john@test.com' }
  const expectedUser = { id: 1, ...userData }
  mockUserService.createUser.mockResolvedValue(expectedUser)

  // Act
  const result = await userService.createUser(userData)

  // Assert
  expect(mockUserService.createUser).toHaveBeenCalledWith(userData)
  expect(result).toEqual(expectedUser)
})
```

#### Given-When-Then Pattern

```typescript
describe('Customer VIP Upgrade', () => {
  it('should upgrade regular customer to VIP', async () => {
    // Given a regular customer
    const customer = { id: 1, role: 'customer', first_name: 'John' }
    
    // When upgrading to VIP
    const upgradedCustomer = await userService.upgradeToVip(1, 'High volume')
    
    // Then the customer should be VIP
    expect(upgradedCustomer.role).toBe('vip_customer')
    expect(upgradedCustomer.benefits).toContain('10_percent_discount')
  })
})
```

### 3. Mock Strategies

#### Service-Level Mocking

```typescript
// Mock entire service module
jest.mock('@/lib/services/userService', () => ({
  userService: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  }
}))
```

#### API-Level Mocking

```typescript
// Mock API calls directly
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))
```

#### MSW Integration

```typescript
// Mock Service Worker for realistic API mocking
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/users/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          { id: 1, first_name: 'John', role: 'customer' }
        ]
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 4. Error Testing

```typescript
describe('Error Scenarios', () => {
  it('should handle network errors', async () => {
    mockUserService.getUsers.mockRejectedValue(new Error('Network timeout'))
    
    await expect(userService.getUsers()).rejects.toThrow('Network timeout')
  })

  it('should handle 404 errors', async () => {
    mockApi.get.mockRejectedValue({
      response: { status: 404, data: { message: 'User not found' } }
    })

    await expect(userService.getUser(999)).rejects.toThrow()
  })

  it('should handle validation errors', async () => {
    mockApi.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          email: ['This field is required'],
          first_name: ['This field cannot be blank']
        }
      }
    })

    const { result } = renderHook(() => useCreateUser(), { wrapper })
    
    result.current.mutate({ email: '', first_name: '' })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error.response.status).toBe(400)
    })
  })
})
```

## Coverage Reports

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  coverageReporters: ['text', 'lcov', 'html']
}
```

### Viewing Coverage Reports

```bash
# Generate and view coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# View coverage summary
cat coverage/coverage-summary.json
```

### Coverage Analysis

```bash
# Coverage by file type
npm run test:coverage -- --collectCoverageFrom="lib/services/**/*.ts"

# Coverage for specific directory
npm run test:coverage -- __tests__/services/

# Detailed coverage with uncovered lines
npm run test:coverage -- --verbose
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run test suite
        run: npm run test:ci
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Vercel Integration

```json
{
  "buildCommand": "npm run build",
  "testCommand": "npm run test:ci",
  "installCommand": "npm ci",
  "framework": "nextjs"
}
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the scenario
- **Keep tests focused** on single behaviors
- **Follow consistent naming patterns**

### 2. Test Data Management

```typescript
// Create test data factories
const createMockUser = (overrides = {}) => ({
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// Use factories in tests
const testUser = createMockUser({ role: 'pharmacist' })
```

### 3. Async Testing

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(result.current.isSuccess).toBe(true)
}, { timeout: 5000 })

// Use async/await with proper error handling
it('should handle async operations', async () => {
  await expect(asyncOperation()).resolves.toEqual(expectedResult)
})
```

### 4. Clean Test Environment

```typescript
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Reset query client
  queryClient.clear()
  
  // Reset any global state
  resetGlobalState()
})
```

## Debugging Tests

### Common Issues and Solutions

1. **Tests timing out**
   ```bash
   # Increase timeout
   npm test -- --testTimeout=10000
   ```

2. **Mock not working**
   ```typescript
   // Ensure mock is set up before import
   jest.mock('@/lib/api')
   import { api } from '@/lib/api'
   ```

3. **React Query cache issues**
   ```typescript
   // Create fresh query client for each test
   beforeEach(() => {
     queryClient = new QueryClient({
       defaultOptions: { queries: { retry: false } }
     })
   })
   ```

4. **TypeScript errors in tests**
   ```typescript
   // Use proper type assertions
   const mockedService = jest.mocked(userService)
   ```

### Debug Tools

```typescript
// Add debug output
console.log('Current result:', result.current)

// Use screen.debug() for DOM inspection
screen.debug()

// Add breakpoints in tests
debugger
```

## Performance Testing

### Testing Loading Performance

```typescript
it('should load users within acceptable time', async () => {
  const startTime = Date.now()
  
  const { result } = renderHook(() => useUsers(), { wrapper })
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
  
  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(2000) // 2 seconds max
})
```

### Memory Leak Testing

```typescript
it('should not leak memory on unmount', () => {
  const { unmount } = renderHook(() => useUsers(), { wrapper })
  
  // Verify cleanup
  unmount()
  
  // Check for memory leaks (implementation specific)
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
})
```

This comprehensive testing guide ensures high-quality, maintainable code with excellent coverage and reliable CI/CD integration for the Long Châu Pharmacy Management System.