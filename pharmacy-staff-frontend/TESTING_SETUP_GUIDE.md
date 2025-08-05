# Testing Environment Setup Guide

## Overview

This document provides a comprehensive guide for the testing environment setup for the Long Châu Pharmacy Management System (PMS) staff frontend application. The testing setup includes Jest, React Testing Library, MSW (Mock Service Worker), and TypeScript support.

## Testing Stack

- **Jest**: Testing framework with Next.js integration
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for realistic testing
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: Advanced user interaction simulation

## Directory Structure

```
pharmacy-staff-frontend/
├── __tests__/
│   ├── setup/
│   │   ├── globalSetup.js         # Global test setup
│   │   ├── globalTeardown.js      # Global test cleanup
│   │   └── setupTests.ts          # MSW server setup
│   ├── mocks/
│   │   ├── handlers.ts            # MSW request handlers
│   │   ├── server.ts              # MSW server (Node.js)
│   │   └── browser.ts             # MSW worker (Browser)
│   ├── utils/
│   │   ├── test-utils.tsx         # Custom render and utilities
│   │   └── index.ts               # Utility exports
│   └── example.test.tsx           # Example test file
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Jest setup file
└── package.json                   # Test scripts
```

## Configuration Files

### Jest Configuration (`jest.config.js`)

- **Next.js Integration**: Uses `next/jest` for seamless Next.js testing
- **TypeScript Support**: Configured for `.ts` and `.tsx` files
- **Module Mapping**: Absolute imports with `@/` prefix
- **Coverage**: Comprehensive coverage configuration with thresholds
- **Test Environment**: jsdom for DOM testing

### Setup Files

- **`jest.setup.js`**: Global mocks and test environment setup
- **`setupTests.ts`**: MSW server initialization
- **Global Setup/Teardown**: Environment preparation and cleanup

## Mock Service Worker (MSW) Setup

### API Mocking Strategy

MSW intercepts HTTP requests and provides realistic API responses:

- **Comprehensive Handlers**: All major API endpoints covered
- **Realistic Data**: Mock data generators for consistent testing
- **Error Scenarios**: Handlers for testing error states
- **Type Safety**: Full TypeScript support with interface matching

### Supported Endpoints

- **Products**: CRUD operations for medicines, supplements, medical devices
- **Users**: Customer and staff management
- **Orders**: Order processing and status management  
- **Inventory**: Stock tracking and low-stock alerts
- **Branches**: Branch management
- **Reports**: Analytics and reporting
- **Deliveries**: Delivery scheduling and tracking
- **Loyalty Points**: Customer loyalty program
- **Prescriptions**: Prescription management

## Test Utilities

### Custom Render Function

The `customRender` function in `test-utils.tsx` provides:

- **Provider Wrapping**: Automatic React Query provider setup
- **Test Query Client**: Optimized for testing with disabled retry and caching
- **Mock Data Factories**: Consistent test data generation
- **Utility Functions**: Common testing patterns and helpers

### Available Utilities

```typescript
// Custom render with providers
import { render, screen } from '@/testUtils'

// Mock data factories
const mockProduct = createMockProduct({ name: 'Test Product' })
const mockUser = createMockUser({ role: 'pharmacist' })
const mockOrder = createMockOrder({ status: 'completed' })

// Testing utilities
await waitForLoadingToFinish()
const restoreConsole = mockConsoleError()
const mockRouter = mockUseRouter({ pathname: '/products' })
```

## Running Tests

### Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Run tests with verbose output
npm run test:debug
```

### Test Coverage

- **Target Coverage**: 70% for branches, functions, lines, and statements
- **Coverage Reports**: Text, LCOV, and HTML formats
- **Excluded Files**: Type definitions, layout files, and configuration

## Writing Tests

### Basic Component Test

```typescript
import { render, screen } from '@/testUtils'
import { expect, test, describe } from '@jest/globals'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  test('should render correctly', () => {
    render(<MyComponent title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

### API Hook Testing

```typescript
import { renderHook, waitFor } from '@/testUtils'
import { useProducts } from '@/hooks/api/useProducts'

describe('useProducts', () => {
  test('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts())
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data[0].name).toBe('Paracetamol')
  })
})
```

### Testing User Interactions

```typescript
import { render, screen, userEvent } from '@/testUtils'

test('should handle button click', async () => {
  const user = userEvent.setup()
  const mockFn = jest.fn()
  
  render(<Button onClick={mockFn}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  
  expect(mockFn).toHaveBeenCalledTimes(1)
})
```

### Testing with MSW

```typescript
import { server } from '@/__tests__/mocks/server'
import { http, HttpResponse } from 'msw'

test('should handle API error', async () => {
  // Override default handler for this test
  server.use(
    http.get('https://longchau-pms.onrender.com/api/products/', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  
  // Your test code here
})
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Clear Test Names**: Descriptive test names that explain expected behavior
3. **Setup and Teardown**: Use `beforeEach` and `afterEach` for test isolation
4. **Mock Isolation**: Reset mocks between tests

### Async Testing

1. **Wait for Updates**: Use `waitFor` for async operations
2. **Loading States**: Test loading, success, and error states
3. **User Events**: Use `userEvent` for realistic user interactions
4. **API Calls**: Mock API responses with MSW

### Component Testing

1. **User-Centric**: Test from user's perspective
2. **Accessibility**: Test with screen reader queries
3. **Edge Cases**: Test error boundaries and edge cases
4. **Integration**: Test components with their providers

## Troubleshooting

### Common Issues

1. **Module Resolution**: Ensure paths are correctly configured in both Jest and TypeScript
2. **MSW Handler Conflicts**: Check for overlapping request handlers
3. **Async Timeouts**: Increase timeout for slow operations
4. **Mock Cleanup**: Ensure mocks are properly reset between tests

### Debug Tips

1. **Verbose Output**: Use `npm run test:debug` for detailed information
2. **Screen Debug**: Use `screen.debug()` to inspect rendered DOM
3. **Query Debugging**: Log queries to understand failures
4. **Network Inspection**: Use MSW's logging to debug requests

## IDE Integration

### VS Code

Recommended extensions:
- Jest Runner
- Jest Snippets
- Testing Library Snippets

### Configuration

Add to VS Code settings:
```json
{
  "jest.autoEnable": true,
  "jest.showCoverageOnLoad": false,
  "jest.autoRevealOutput": "on-exec-error"
}
```

## CI/CD Integration

The `test:ci` script is optimized for continuous integration:
- No watch mode
- Coverage generation
- Proper exit codes
- Performance optimized

## Future Enhancements

1. **E2E Testing**: Consider adding Playwright or Cypress
2. **Visual Regression**: Screenshot testing for UI consistency
3. **Performance Testing**: React performance profiling
4. **A11y Testing**: Automated accessibility testing

## Support

For questions or issues with the testing setup:
1. Check this documentation first
2. Review example tests in `__tests__/example.test.tsx`
3. Consult the Jest and Testing Library documentation
4. Check MSW documentation for API mocking issues

---

This testing environment provides a solid foundation for writing comprehensive, maintainable tests for the Long Châu PMS application. The setup ensures type safety, realistic API mocking, and follows testing best practices.