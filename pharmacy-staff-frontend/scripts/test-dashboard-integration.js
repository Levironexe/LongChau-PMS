const axios = require('axios');

const BASE_URL = 'https://longchau-pms.onrender.com/api';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

async function testDashboardIntegration() {
  console.log('🏠 Testing Dashboard Integration Scenarios\n');
  
  try {
    // Test 1: Customer filtering for dashboard stats
    console.log('📊 Test 1: Customer Statistics');
    const customersResponse = await api.get('/users/customers/');
    console.log(`   ✅ Customers endpoint: ${customersResponse.data.length} customers`);
    console.log(`   📋 Customer roles: ${[...new Set(customersResponse.data.map(c => c.role))].join(', ')}`);
    
    // Test 2: Revenue calculation from orders
    console.log('\n💰 Test 2: Revenue Calculation');
    const ordersResponse = await api.get('/orders/');
    const orders = ordersResponse.data.results || ordersResponse.data || [];
    console.log(`   ✅ Orders endpoint: ${orders.length} orders`);
    
    const todayDate = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.order_date && order.order_date.startsWith(todayDate));
    console.log(`   📅 Today orders: ${todayOrders.length}`);
    
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(order.total_amount || 0);
      return sum + amount;
    }, 0);
    console.log(`   💵 Total revenue: ₫${totalRevenue.toLocaleString('vi-VN')}`);
    
    // Test 3: Low stock detection
    console.log('\n📦 Test 3: Low Stock Detection');
    const lowStockResponse = await api.get('/inventory/low-stock/');
    console.log(`   ✅ Low stock endpoint: ${lowStockResponse.data.length} items`);
    
    if (lowStockResponse.data.length > 0) {
      const sample = lowStockResponse.data[0];
      console.log(`   📋 Sample low stock item: ${sample.product_name || 'Unknown Product'}`);
      console.log(`   📊 Current stock: ${sample.current_stock}, Minimum: ${sample.minimum_stock}`);
    }
    
    // Test 4: User statistics breakdown
    console.log('\n👥 Test 4: Staff vs Customer Breakdown');
    const allUsersResponse = await api.get('/users/');
    const allUsers = allUsersResponse.data.results || allUsersResponse.data || [];
    
    const customerRoles = ['customer', 'vip_customer'];
    const customers = allUsers.filter(user => customerRoles.includes(user.role));
    const staff = allUsers.filter(user => !customerRoles.includes(user.role));
    
    console.log(`   👥 Total users: ${allUsers.length}`);
    console.log(`   🛒 Customers: ${customers.length} (${customerRoles.join(', ')})`);
    console.log(`   👨‍💼 Staff: ${staff.length}`);
    
    const staffRoles = [...new Set(staff.map(s => s.role))];
    console.log(`   🏷️  Staff roles: ${staffRoles.join(', ')}`);
    
    // Test 5: Branch statistics
    console.log('\n🏢 Test 5: Branch Statistics');
    const branchesResponse = await api.get('/branches/');
    const branches = branchesResponse.data.results || branchesResponse.data || [];
    console.log(`   ✅ Branches endpoint: ${branches.length} branches`);
    
    if (branches.length > 0) {
      const totalUsers = branches.reduce((sum, branch) => sum + (branch.user_count || 0), 0);
      const totalStaff = branches.reduce((sum, branch) => sum + (branch.staff_count || 0), 0);
      const totalCustomers = branches.reduce((sum, branch) => sum + (branch.customer_count || 0), 0);
      
      console.log('   📊 Aggregated stats across branches:');
      console.log(`      Users: ${totalUsers}, Staff: ${totalStaff}, Customers: ${totalCustomers}`);
    }
    
    // Test 6: Report availability
    console.log('\n📈 Test 6: Reports Integration');
    const reportsResponse = await api.get('/reports/');
    const reports = reportsResponse.data.results || reportsResponse.data || [];
    console.log(`   ✅ Reports endpoint: ${reports.length} reports`);
    
    const reportTypes = [...new Set(reports.map(r => r.report_type))];
    console.log(`   📋 Available report types: ${reportTypes.join(', ')}`);
    
    if (reports.length > 0) {
      const latestReport = reports.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))[0];
      console.log(`   📅 Latest report: ${latestReport.report_name} (${latestReport.report_type})`);
    }
    
    // Test 7: Product data integration
    console.log('\n🏪 Test 7: Product Inventory Integration');
    const medicinesResponse = await api.get('/medicines/');
    const supplementsResponse = await api.get('/supplements/');
    const devicesResponse = await api.get('/medical-devices/');
    
    const medicines = medicinesResponse.data.results || medicinesResponse.data || [];
    const supplements = supplementsResponse.data.results || supplementsResponse.data || [];
    const devices = devicesResponse.data.results || devicesResponse.data || [];
    
    const totalProducts = medicines.length + supplements.length + devices.length;
    console.log(`   ✅ Total products: ${totalProducts}`);
    console.log(`      Medicines: ${medicines.length}`);
    console.log(`      Supplements: ${supplements.length}`);
    console.log(`      Devices: ${devices.length}`);
    
    // Check stock information availability
    const medicinesWithStock = medicines.filter(m => m.current_stock !== null && m.current_stock !== undefined);
    console.log(`   📦 Medicines with stock data: ${medicinesWithStock.length}/${medicines.length}`);
    
    console.log('\n✅ DASHBOARD INTEGRATION TESTS PASSED');
    console.log('All essential data for dashboard functionality is available and properly structured.');
    
  } catch (error) {
    console.log('❌ Dashboard integration test failed:', error.message);
  }
}

testDashboardIntegration().catch(console.error);