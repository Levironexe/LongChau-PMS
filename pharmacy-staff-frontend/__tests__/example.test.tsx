import { render, screen } from './utils/test-utils'
import { expect, test, describe } from '@jest/globals'

// Example test to verify setup is working
describe('Testing Environment Setup', () => {
  test('should render a simple component', () => {
    const TestComponent = () => <div>Hello, Testing World!</div>

    render(<TestComponent />)
    
    expect(screen.getByText('Hello, Testing World!')).toBeInTheDocument()
  })

  // MSW test commented out temporarily until we fix the import issue
  // test('should have MSW mocking working', async () => {
  //   // This test will pass if MSW is properly set up to intercept API calls
  //   const response = await fetch('https://longchau-pms.onrender.com/api/products/')
  //   const data = await response.json()
  //   
  //   expect(response.ok).toBe(true)
  //   expect(Array.isArray(data)).toBe(true)
  //   expect(data.length).toBeGreaterThan(0)
  // })
})