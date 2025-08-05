import axios from 'axios'
import { 
  User, 
  Order, 
  Product, 
  Medicine, 
  Supplement, 
  MedicalDevice, 
  InventoryRecord,
  Report,
  Delivery,
  LoyaltyPoints,
  Branch
} from '../lib/types'

// API Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://longchau-pms.onrender.com/api"
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Test results interface
interface TestResult {
  endpoint: string
  method: string
  status: 'success' | 'error' | 'warning'
  responseStatus?: number
  responseTime?: number
  dataStructure?: 'valid' | 'invalid' | 'partial'
  issues?: string[]
  sampleData?: any
  expectedType?: string
  actualStructure?: any
}

interface ApiTestReport {
  summary: {
    totalTests: number
    passed: number
    failed: number
    warnings: number
    timestamp: string
  }
  testResults: TestResult[]
  recommendations: string[]
}

class ApiEndpointTester {
  private results: TestResult[] = []
  private recommendations: string[] = []

  private log(message: string, type: 'info' | 'error' | 'warning' = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  private async testEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    expectedType?: string,
    sampleData?: any,
    typeValidator?: (data: any) => { valid: boolean; issues: string[] }
  ): Promise<TestResult> {
    const startTime = Date.now()
    const testResult: TestResult = {
      endpoint,
      method,
      status: 'error',
      expectedType
    }

    try {
      let response
      
      switch (method) {
        case 'GET':
          response = await api.get(endpoint)
          break
        case 'POST':
          response = await api.post(endpoint, sampleData || {})
          break
        case 'PUT':
          response = await api.put(endpoint, sampleData || {})
          break
        case 'PATCH':
          response = await api.patch(endpoint, sampleData || {})
          break
        case 'DELETE':
          response = await api.delete(endpoint)
          break
      }

      const responseTime = Date.now() - startTime
      testResult.responseStatus = response.status
      testResult.responseTime = responseTime
      testResult.sampleData = response.data

      if (response.status >= 200 && response.status < 300) {
        testResult.status = 'success'
        
        // Validate data structure if validator provided
        if (typeValidator && response.data) {
          const validation = typeValidator(response.data)
          testResult.dataStructure = validation.valid ? 'valid' : 'partial'
          testResult.issues = validation.issues
          
          if (!validation.valid) {
            testResult.status = 'warning'
          }
        }

        this.log(`${method} ${endpoint} - ${response.status} (${responseTime}ms)`)
      } else {
        testResult.status = 'error'
        testResult.issues = [`HTTP ${response.status}`]
        this.log(`${method} ${endpoint} - Failed with ${response.status}`, 'error')
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime
      testResult.responseTime = responseTime
      testResult.responseStatus = error.response?.status
      testResult.issues = [error.message]
      
      if (error.response?.status === 404) {
        testResult.status = 'warning'
        this.log(`${method} ${endpoint} - Not Found (404) - ${responseTime}ms`, 'warning')
      } else {
        testResult.status = 'error'
        this.log(`${method} ${endpoint} - Error: ${error.message}`, 'error')
      }
    }

    this.results.push(testResult)
    return testResult
  }

  // Type validators
  private validateUser = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'first_name', 'last_name', 'email', 'role']
    
    // Handle paginated response
    const users = Array.isArray(data) ? data : (data.results || [data])
    
    if (users.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const user = users[0]
    
    required.forEach(field => {
      if (!(field in user)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    const validRoles = ['customer', 'vip_customer', 'pharmacist', 'technician', 'manager', 'cashier', 'inventory_manager']
    if (user.role && !validRoles.includes(user.role)) {
      issues.push(`Invalid role: ${user.role}`)
    }

    return { valid: issues.length === 0, issues }
  }

  private validateOrder = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'customer', 'total_amount', 'status', 'order_type', 'order_date']
    
    const orders = Array.isArray(data) ? data : (data.results || [data])
    
    if (orders.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const order = orders[0]
    
    required.forEach(field => {
      if (!(field in order)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled']
    if (order.status && !validStatuses.includes(order.status)) {
      issues.push(`Invalid status: ${order.status}`)
    }

    const validOrderTypes = ['prescription', 'in_store', 'online']
    if (order.order_type && !validOrderTypes.includes(order.order_type)) {
      issues.push(`Invalid order_type: ${order.order_type}`)
    }

    return { valid: issues.length === 0, issues }
  }

  private validateProduct = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'name', 'product_type', 'price', 'requires_prescription']
    
    const products = Array.isArray(data) ? data : (data.results || [data])
    
    if (products.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const product = products[0]
    
    required.forEach(field => {
      if (!(field in product)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    const validProductTypes = ['medicine', 'supplement', 'medical_device']
    if (product.product_type && !validProductTypes.includes(product.product_type)) {
      issues.push(`Invalid product_type: ${product.product_type}`)
    }

    return { valid: issues.length === 0, issues }
  }

  private validateInventoryRecord = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'current_stock', 'minimum_stock', 'is_low_stock']
    
    const records = Array.isArray(data) ? data : (data.results || [data])
    
    if (records.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const record = records[0]
    
    required.forEach(field => {
      if (!(field in record)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    return { valid: issues.length === 0, issues }
  }

  private validateReport = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'report_type', 'report_data', 'generated_at']
    
    const reports = Array.isArray(data) ? data : (data.results || [data])
    
    if (reports.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const report = reports[0]
    
    required.forEach(field => {
      if (!(field in report)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    const validReportTypes = ['sales', 'staff_performance', 'inventory', 'prescription']
    if (report.report_type && !validReportTypes.includes(report.report_type)) {
      issues.push(`Invalid report_type: ${report.report_type}`)
    }

    return { valid: issues.length === 0, issues }
  }

  private validateDelivery = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'order', 'delivery_type', 'status', 'scheduled_date']
    
    const deliveries = Array.isArray(data) ? data : (data.results || [data])
    
    if (deliveries.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const delivery = deliveries[0]
    
    required.forEach(field => {
      if (!(field in delivery)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    const validDeliveryTypes = ['pickup', 'home']
    if (delivery.delivery_type && !validDeliveryTypes.includes(delivery.delivery_type)) {
      issues.push(`Invalid delivery_type: ${delivery.delivery_type}`)
    }

    const validStatuses = ['scheduled', 'in_transit', 'delivered', 'cancelled']
    if (delivery.status && !validStatuses.includes(delivery.status)) {
      issues.push(`Invalid status: ${delivery.status}`)
    }

    return { valid: issues.length === 0, issues }
  }

  private validateBranch = (data: any): { valid: boolean; issues: string[] } => {
    const issues: string[] = []
    const required = ['id', 'name', 'address', 'phone', 'email']
    
    const branches = Array.isArray(data) ? data : (data.results || [data])
    
    if (branches.length === 0) {
      return { valid: true, issues: ['Empty response'] }
    }

    const branch = branches[0]
    
    required.forEach(field => {
      if (!(field in branch)) {
        issues.push(`Missing required field: ${field}`)
      }
    })

    return { valid: issues.length === 0, issues }
  }

  // Main testing methods
  async testUserEndpoints() {
    this.log('Testing User Management Endpoints...')
    
    // Test main user endpoints
    await this.testEndpoint('/users/', 'GET', 'User[]', undefined, this.validateUser)
    await this.testEndpoint('/users/customers/', 'GET', 'User[]', undefined, this.validateUser)
    await this.testEndpoint('/users/pharmacists/', 'GET', 'User[]', undefined, this.validateUser)
    await this.testEndpoint('/users/staff/', 'GET', 'User[]', undefined, this.validateUser)
    
    // Test role filtering
    await this.testEndpoint('/users/?role=customer', 'GET', 'User[]', undefined, this.validateUser)
    await this.testEndpoint('/users/?role=pharmacist', 'GET', 'User[]', undefined, this.validateUser)
    
    // Test user profiles
    await this.testEndpoint('/user-profiles/', 'GET')
    
    // Test loyalty points
    await this.testEndpoint('/loyalty-points/', 'GET')
  }

  async testProductEndpoints() {
    this.log('Testing Product Management Endpoints...')
    
    // Test medicine endpoints
    await this.testEndpoint('/medicines/', 'GET', 'Medicine[]', undefined, this.validateProduct)
    await this.testEndpoint('/prescription-medicines/', 'GET', 'Medicine[]', undefined, this.validateProduct)
    await this.testEndpoint('/otc-medicines/', 'GET', 'Medicine[]', undefined, this.validateProduct)
    
    // Test supplement endpoints
    await this.testEndpoint('/supplements/', 'GET', 'Supplement[]', undefined, this.validateProduct)
    
    // Test medical device endpoints
    await this.testEndpoint('/medical-devices/', 'GET', 'MedicalDevice[]', undefined, this.validateProduct)
  }

  async testInventoryEndpoints() {
    this.log('Testing Inventory Management Endpoints...')
    
    await this.testEndpoint('/inventory-records/', 'GET', 'InventoryRecord[]', undefined, this.validateInventoryRecord)
    await this.testEndpoint('/inventory/low-stock/', 'GET', 'InventoryRecord[]', undefined, this.validateInventoryRecord)
    await this.testEndpoint('/inventory-transactions/', 'GET')
  }

  async testOrderEndpoints() {
    this.log('Testing Order Management Endpoints...')
    
    await this.testEndpoint('/orders/', 'GET', 'Order[]', undefined, this.validateOrder)
    await this.testEndpoint('/orders/?order_type=prescription', 'GET', 'Order[]', undefined, this.validateOrder)
    await this.testEndpoint('/orders/?order_type=in_store', 'GET', 'Order[]', undefined, this.validateOrder)
    await this.testEndpoint('/orders/?order_type=online', 'GET', 'Order[]', undefined, this.validateOrder)
    
    // Test order items
    await this.testEndpoint('/order-items/', 'GET')
  }

  async testPrescriptionEndpoints() {
    this.log('Testing Prescription Management Endpoints...')
    
    await this.testEndpoint('/prescriptions/', 'GET')
    await this.testEndpoint('/prescription-items/', 'GET')
  }

  async testDeliveryEndpoints() {
    this.log('Testing Delivery Management Endpoints...')
    
    await this.testEndpoint('/deliveries/', 'GET', 'Delivery[]', undefined, this.validateDelivery)
    await this.testEndpoint('/deliveries/?delivery_type=pickup', 'GET', 'Delivery[]', undefined, this.validateDelivery)
    await this.testEndpoint('/deliveries/?delivery_type=home', 'GET', 'Delivery[]', undefined, this.validateDelivery)
  }

  async testBranchEndpoints() {
    this.log('Testing Branch Management Endpoints...')
    
    await this.testEndpoint('/branches/', 'GET', 'Branch[]', undefined, this.validateBranch)
    await this.testEndpoint('/branch-configs/', 'GET')
  }

  async testReportEndpoints() {
    this.log('Testing Report Generation Endpoints...')
    
    await this.testEndpoint('/reports/', 'GET', 'Report[]', undefined, this.validateReport)
    
    // Test report generation (these might require authentication)
    await this.testEndpoint('/reports/sales/', 'POST', 'Report', {
      report_name: 'Test Sales Report',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      branch: 1,
      generated_by: 1
    })
    
    await this.testEndpoint('/reports/staff-performance/', 'POST', 'Report', {
      report_name: 'Test Staff Performance Report',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      branch: 1,
      generated_by: 1
    })
    
    await this.testEndpoint('/reports/inventory/', 'POST', 'Report', {
      report_name: 'Test Inventory Report',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      branch: 1,
      generated_by: 1
    })
  }

  async testFactoryEndpoints() {
    this.log('Testing Factory Pattern Endpoints...')
    
    await this.testEndpoint('/product-factories/', 'GET')
    await this.testEndpoint('/factory/create-medicine/', 'POST', 'Medicine', {
      name: 'Test Medicine',
      price: '10.00',
      active_ingredient: 'Test Active Ingredient',
      dosage_form: 'tablet',
      strength: '500mg',
      is_prescription: false,
      requires_prescription: false
    })
    
    await this.testEndpoint('/factory/create-supplement/', 'POST', 'Supplement', {
      name: 'Test Supplement',
      price: '15.00',
      supplement_type: 'vitamin',
      ingredients: ['Vitamin C'],
      requires_prescription: false
    })
  }

  private analyzeResults() {
    this.log('Analyzing test results...')
    
    // Analyze common issues
    const commonIssues: Record<string, number> = {}
    const endpointIssues: Record<string, string[]> = {}

    this.results.forEach(result => {
      if (result.issues) {
        result.issues.forEach(issue => {
          commonIssues[issue] = (commonIssues[issue] || 0) + 1
        })
        endpointIssues[result.endpoint] = result.issues
      }
    })

    // Generate recommendations
    if (commonIssues['Missing required field: stock']) {
      this.recommendations.push('Many products are missing stock information. Consider implementing inventory integration.')
    }

    if (commonIssues['Empty response']) {
      this.recommendations.push('Several endpoints return empty responses. Verify database seeding and test data.')
    }

    const failedEndpoints = this.results.filter(r => r.status === 'error')
    if (failedEndpoints.length > 0) {
      this.recommendations.push(`${failedEndpoints.length} endpoints are failing. Check API server status and authentication requirements.`)
    }

    const slowEndpoints = this.results.filter(r => (r.responseTime || 0) > 5000)
    if (slowEndpoints.length > 0) {
      this.recommendations.push(`${slowEndpoints.length} endpoints have slow response times (>5s). Consider optimization.`)
    }

    // Check for deprecated endpoints being used
    const deprecatedPatterns = ['/api/customers/', '/api/pharmacists/', '/api/prescription-orders/']
    const deprecatedFound = this.results.filter(r => 
      deprecatedPatterns.some(pattern => r.endpoint.includes(pattern))
    )
    
    if (deprecatedFound.length > 0) {
      this.recommendations.push('Some deprecated endpoint patterns detected. Ensure migration to unified RBAC endpoints.')
    }
  }

  async runAllTests(): Promise<ApiTestReport> {
    this.log('Starting comprehensive API endpoint testing...')
    this.results = []
    this.recommendations = []

    // Run all test suites
    await this.testBranchEndpoints()
    await this.testUserEndpoints()
    await this.testProductEndpoints()
    await this.testInventoryEndpoints()
    await this.testOrderEndpoints()
    await this.testPrescriptionEndpoints()
    await this.testDeliveryEndpoints()
    await this.testReportEndpoints()
    await this.testFactoryEndpoints()

    // Analyze results
    this.analyzeResults()

    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'success').length,
      failed: this.results.filter(r => r.status === 'error').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      timestamp: new Date().toISOString()
    }

    this.log(`Testing completed: ${summary.passed}/${summary.totalTests} passed, ${summary.failed} failed, ${summary.warnings} warnings`)

    return {
      summary,
      testResults: this.results,
      recommendations: this.recommendations
    }
  }
}

// Export for use in testing
export { ApiEndpointTester }

// CLI execution
if (require.main === module) {
  const tester = new ApiEndpointTester()
  
  tester.runAllTests()
    .then(report => {
      console.log('\n=== API TESTING REPORT ===')
      console.log(JSON.stringify(report, null, 2))
      
      // Save to file
      const fs = require('fs')
      const path = require('path')
      const reportPath = path.join(__dirname, '../reports/api-test-report.json')
      
      // Ensure reports directory exists
      const reportsDir = path.dirname(reportPath)
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true })
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`\nReport saved to: ${reportPath}`)
    })
    .catch(console.error)
}