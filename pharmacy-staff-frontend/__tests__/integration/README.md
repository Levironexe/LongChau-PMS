# Integration Tests for LongChau PMS Frontend

This directory contains comprehensive integration tests for the key UI components of the LongChau Pharmacy Management System frontend application.

## Overview

These integration tests focus on testing components with their API integrations, user interactions, and real-world workflows. They use React Testing Library for component testing and Mock Service Worker (MSW) for API mocking.

## Test Structure

### 1. Dashboard Integration Tests (`Dashboard.test.tsx`)

Tests the main dashboard page functionality:

- **Key Metrics Display**: Tests revenue, orders, customers, and low stock alerts
- **Chart Interactions**: Tests tab switching between revenue, orders, and inventory charts  
- **API Integration**: Tests data loading from multiple API endpoints
- **Navigation**: Tests quick action buttons and navigation links
- **Loading States**: Tests component behavior during data fetching
- **Error Handling**: Tests graceful degradation when API calls fail

**Key Test Scenarios:**
```typescript
// Example: Testing dashboard loads with API data
it('loads dashboard with key metrics from API', async () => {
  // Mock API responses for users and orders
  // Render dashboard component
  // Assert key metrics are displayed correctly
})

// Example: Testing chart tab interactions
it('navigates through chart tabs correctly', async () => {
  // Click through revenue, orders, and inventory tabs
  // Assert correct chart components are rendered
})
```

### 2. Orders Management Tests (`OrdersManagement.test.tsx`)

Tests the complete order management workflow:

- **Order Listing**: Tests order display with status badges and customer information
- **Search & Filtering**: Tests search by customer name and filtering by status
- **Create Order**: Tests the complete order creation workflow including:
  - Customer selection
  - Product selection and cart management
  - Quantity adjustments
  - Form validation
  - Order submission
- **Edit Orders**: Tests editing existing orders
- **Status Transitions**: Tests changing order status (pending → processing → completed)
- **Order Details**: Tests the order details modal
- **Delete Operations**: Tests order deletion functionality

**Key Test Scenarios:**
```typescript
// Example: Testing complete order creation workflow
it('allows adding products to cart', async () => {
  // Open create order dialog
  // Select customer
  // Add products to cart
  // Adjust quantities
  // Submit order
  // Verify success
})

// Example: Testing order status transitions
it('allows status transitions for pending orders', async () => {
  // Find pending order
  // Change status to processing
  // Verify API call and UI update
})
```

### 3. Customer Management Tests (`CustomerManagement.test.tsx`)

Tests customer management with factory pattern support:

- **Customer Listing**: Tests customer display with type badges and contact information
- **Search & Filtering**: Tests search by name/email and filtering by customer type
- **Create Customer**: Tests customer creation including:
  - Form field validation
  - Customer type selection (regular/VIP)
  - Factory pattern toggle functionality
  - Address and notes fields
- **Edit Customers**: Tests updating customer information
- **VIP Upgrades**: Tests upgrading regular customers to VIP status
- **Delete Operations**: Tests customer deletion
- **Factory Pattern**: Tests the factory pattern for enhanced customer creation

**Key Test Scenarios:**
```typescript
// Example: Testing factory pattern functionality
it('shows factory pattern toggle for eligible customer types', async () => {
  // Open create customer dialog
  // Verify factory pattern toggle is available
  // Enable factory pattern
  // Verify enhanced creation message
})

// Example: Testing VIP upgrade
it('allows upgrading regular customer to VIP', async () => {
  // Find regular customer
  // Click VIP upgrade button
  // Verify API call and status change
})
```

### 4. Chart Components Tests (`Charts.test.tsx`)

Tests data visualization components:

- **Revenue Chart**: Tests line chart with Vietnamese currency formatting
- **Orders Chart**: Tests bar chart with order type categorization
- **Inventory Status Chart**: Tests pie chart with stock status visualization
- **Data Handling**: Tests charts with various data scenarios:
  - Empty data
  - Single data points
  - Large datasets
  - Zero values
- **Responsive Design**: Tests chart responsiveness
- **Styling**: Tests consistent theming and accessibility

**Key Test Scenarios:**
```typescript
// Example: Testing chart data integration
it('renders revenue chart with correct data structure', () => {
  // Provide mock revenue data
  // Render chart component
  // Verify data is passed correctly to chart elements
})

// Example: Testing chart accessibility
it('applies correct CSS classes for styling', () => {
  // Render chart
  // Verify accessibility classes and styling
})
```

## API Mocking Strategy

The tests use MSW (Mock Service Worker) to mock API calls. The enhanced handlers support:

### Core Features
- **Filtering**: Search and filter parameters for orders and customers
- **Status Changes**: Order status transitions and customer upgrades
- **Factory Pattern**: Customer factory creation endpoints
- **Statistics**: Dashboard metrics and statistics endpoints

### Error Scenarios
- **500 Errors**: Server error simulation
- **404 Errors**: Not found error simulation  
- **Network Errors**: Connection failure simulation
- **Validation Errors**: Form validation error responses
- **Timeouts**: Request timeout simulation

### Performance Testing
- **Delayed Responses**: Slow endpoint simulation for loading state testing
- **Bulk Operations**: Mass data creation for stress testing

## Running the Tests

### Individual Test Files
```bash
# Run specific integration test
npm test Dashboard.test.tsx
npm test OrdersManagement.test.tsx
npm test CustomerManagement.test.tsx
npm test Charts.test.tsx
```

### All Integration Tests
```bash
# Run all integration tests
npm test -- __tests__/integration/

# Run with coverage
npm run test:coverage -- __tests__/integration/

# Run in watch mode
npm run test:watch -- __tests__/integration/
```

### Debug Mode
```bash
# Run with verbose output
npm run test:debug -- __tests__/integration/
```

## Test Utilities

### Custom Render Function
The `test-utils.tsx` provides a custom render function with:
- React Query client setup
- Mock router configuration
- Provider wrapper setup

```typescript
import { render, createMockUser, createMockOrder } from '../utils/test-utils'

// Use custom render for components that need providers
render(<YourComponent />)
```

### Mock Data Factories
Pre-built factories for creating test data:
- `createMockUser()`: User/customer data
- `createMockOrder()`: Order data with items
- `createMockProduct()`: Product data

### User Event Setup
All tests use `@testing-library/user-event` for realistic user interactions:
```typescript
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')
```

## Best Practices

### 1. Test User Workflows
Focus on complete user journeys rather than isolated component behavior:
```typescript
// Good: Test complete workflow
it('creates order from start to finish', async () => {
  // Open dialog → Select customer → Add products → Submit
})

// Avoid: Testing isolated actions
it('opens dialog', () => { /* ... */ })
it('selects customer', () => { /* ... */ })
```

### 2. Use Semantic Queries
Prefer queries that match how users interact with the app:
```typescript
// Good: Semantic queries
screen.getByRole('button', { name: /create order/i })
screen.getByLabelText(/customer name/i)

// Avoid: Implementation details
screen.getByTestId('create-button')
screen.getByClassName('customer-input')
```

### 3. Test Error States
Always test both success and failure scenarios:
```typescript
it('handles API errors gracefully', async () => {
  // Mock API error
  server.use(http.get('/api/orders/', () => new HttpResponse(null, { status: 500 })))
  
  // Verify error handling
  render(<OrdersPage />)
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

### 4. Clean Up Between Tests
Each test starts with a clean state:
```typescript
beforeEach(() => {
  server.resetHandlers() // Reset MSW handlers
  // Clear any component state if needed
})
```

## Coverage Goals

These integration tests aim for:
- **User Workflows**: 100% coverage of critical user paths
- **API Integration**: All major API endpoints tested
- **Error Handling**: All error states and edge cases covered
- **Accessibility**: Proper ARIA usage and keyboard navigation
- **Responsive Design**: Component behavior across different screen sizes

## Maintenance

### Adding New Tests
1. Follow existing patterns for consistency
2. Use descriptive test names that explain the user scenario
3. Group related tests in describe blocks
4. Mock API responses realistically
5. Test both success and failure paths

### Updating Tests
When components change:
1. Update mock data to match new API contracts
2. Adjust queries if UI elements change
3. Add tests for new features
4. Remove tests for deprecated functionality

## Contributing

When adding new integration tests:
1. Follow the established patterns in existing tests
2. Use the shared test utilities and mock factories
3. Test real user scenarios, not implementation details
4. Include both positive and negative test cases
5. Document any new testing patterns or utilities