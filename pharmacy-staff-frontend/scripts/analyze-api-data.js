const axios = require('axios');

const BASE_URL = 'https://longchau-pms.onrender.com/api';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

async function analyzeEndpoint(endpoint, expectedFields) {
  try {
    const response = await api.get(endpoint);
    const data = response.data;
    const items = Array.isArray(data) ? data : (data.results || [data]);
    
    if (items.length === 0) {
      console.log(`⚠️  ${endpoint}: No data available`);
      return { endpoint, status: 'empty', issues: ['No data available'] };
    }
    
    const sample = items[0];
    const actualFields = Object.keys(sample);
    const missingFields = expectedFields.filter(field => !actualFields.includes(field));
    const extraFields = actualFields.filter(field => !expectedFields.includes(field));
    
    console.log(`📋 ${endpoint}:`);
    console.log(`   📊 Sample count: ${items.length}`);
    console.log(`   🏗️  Actual fields: ${actualFields.join(', ')}`);
    
    if (missingFields.length > 0) {
      console.log(`   ❌ Missing expected fields: ${missingFields.join(', ')}`);
    }
    
    if (extraFields.length > 0) {
      console.log(`   ➕ Extra fields: ${extraFields.slice(0, 10).join(', ')}${extraFields.length > 10 ? '...' : ''}`);
    }
    
    // Show sample data structure
    console.log(`   📝 Sample data:`);
    Object.entries(sample).slice(0, 5).forEach(([key, value]) => {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const truncated = valueStr.length > 50 ? valueStr.substring(0, 50) + '...' : valueStr;
      console.log(`      ${key}: ${truncated}`);
    });
    console.log('');
    
    return {
      endpoint,
      status: missingFields.length === 0 ? 'valid' : 'partial',
      issues: missingFields.length > 0 ? [`Missing fields: ${missingFields.join(', ')}`] : [],
      actualFields,
      missingFields,
      extraFields,
      sampleData: sample
    };
    
  } catch (error) {
    console.log(`❌ ${endpoint}: Error - ${error.message}`);
    return { endpoint, status: 'error', error: error.message };
  }
}

async function runDataStructureAnalysis() {
  console.log('🔍 Analyzing API Data Structures vs TypeScript Types\n');
  
  // Define expected fields based on TypeScript interfaces
  const analyses = await Promise.all([
    // User interface
    analyzeEndpoint('/users/', ['id', 'first_name', 'last_name', 'email', 'phone', 'role']),
    
    // Order interface
    analyzeEndpoint('/orders/', ['id', 'customer', 'total_amount', 'status', 'order_type', 'order_date']),
    
    // Product interfaces
    analyzeEndpoint('/medicines/', ['id', 'name', 'product_type', 'price', 'requires_prescription', 'active_ingredient', 'dosage_form', 'strength', 'is_prescription']),
    
    analyzeEndpoint('/supplements/', ['id', 'name', 'product_type', 'price', 'requires_prescription', 'supplement_type', 'ingredients']),
    
    analyzeEndpoint('/medical-devices/', ['id', 'name', 'product_type', 'price', 'requires_prescription', 'device_type', 'device_class']),
    
    // Inventory interface
    analyzeEndpoint('/inventory-records/', ['id', 'current_stock', 'minimum_stock', 'is_low_stock', 'branch']),
    
    // Delivery interface
    analyzeEndpoint('/deliveries/', ['id', 'order', 'delivery_type', 'status', 'scheduled_date', 'assigned_staff']),
    
    // Report interface
    analyzeEndpoint('/reports/', ['id', 'report_type', 'report_data', 'generated_at', 'generated_by', 'branch']),
    
    // Branch interface
    analyzeEndpoint('/branches/', ['id', 'name', 'address', 'phone', 'email']),
    
    // Loyalty Points interface
    analyzeEndpoint('/loyalty-points/', ['id', 'customer', 'points', 'earned_date', 'expiry_date'])
  ]);
  
  // Summary
  console.log('📊 DATA STRUCTURE ANALYSIS SUMMARY:\n');
  
  const valid = analyses.filter(a => a.status === 'valid');
  const partial = analyses.filter(a => a.status === 'partial');
  const errors = analyses.filter(a => a.status === 'error');
  const empty = analyses.filter(a => a.status === 'empty');
  
  console.log(`✅ Fully Valid: ${valid.length}`);
  console.log(`⚠️  Partially Valid: ${partial.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`📭 Empty Responses: ${empty.length}`);
  
  if (partial.length > 0) {
    console.log('\n⚠️  PARTIAL MATCHES (Missing Expected Fields):');
    partial.forEach(p => {
      console.log(`   ${p.endpoint}: ${p.issues.join(', ')}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => {
      console.log(`   ${e.endpoint}: ${e.error}`);
    });
  }
  
  // Additional analysis
  console.log('\n🔬 DETAILED FINDINGS:');
  
  // Check dashboard compatibility
  const dashboardIssues = [];
  const userAnalysis = analyses.find(a => a.endpoint === '/users/');
  const orderAnalysis = analyses.find(a => a.endpoint === '/orders/');
  
  if (userAnalysis && userAnalysis.status !== 'error') {
    // Check if dashboard can use customer filtering
    const hasCustomerRole = userAnalysis.actualFields.includes('role');
    if (!hasCustomerRole) {
      dashboardIssues.push('User role field missing - dashboard customer filtering may fail');
    }
  }
  
  if (orderAnalysis && orderAnalysis.status !== 'error') {
    // Check if dashboard can calculate revenue
    const hasTotalAmount = orderAnalysis.actualFields.includes('total_amount');
    const hasOrderDate = orderAnalysis.actualFields.includes('order_date');
    if (!hasTotalAmount) {
      dashboardIssues.push('Order total_amount field missing - revenue calculation may fail');
    }
    if (!hasOrderDate) {
      dashboardIssues.push('Order order_date field missing - date filtering may fail');
    }
  }
  
  if (dashboardIssues.length > 0) {
    console.log('\n🚨 DASHBOARD COMPATIBILITY ISSUES:');
    dashboardIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  } else {
    console.log('\n✅ Dashboard data integration looks compatible');
  }
  
  return analyses;
}

runDataStructureAnalysis().catch(console.error);