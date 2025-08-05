module.exports = async () => {
  // Global setup for tests
  console.log('Setting up test environment...')
  
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api'
  
  // Any other global setup needed
}