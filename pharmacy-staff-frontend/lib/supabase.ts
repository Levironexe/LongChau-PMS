import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('core_pharmacybranch')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Connected to Supabase successfully' }
  } catch (err: any) {
    console.error('Connection test error:', err)
    return { success: false, error: err.message }
  }
}

// Function to get all branches
export async function getAllBranches() {
  try {
    const { data, error } = await supabase
      .from('core_pharmacybranch')
      .select('id, name, address, phone, email')
      .order('name')
    
    if (error) {
      console.error('Get branches error:', error)
      throw error
    }
    
    return data
  } catch (err) {
    console.error('Get branches failed:', err)
    throw err
  }
}

// Function to get all products
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('core_medicine')
      .select('id, product_code, name, manufacturer, price, is_available')
      .order('name')
    
    if (error) {
      console.error('Get products error:', error)
      throw error
    }
    
    return data
  } catch (err) {
    console.error('Get products failed:', err)
    throw err
  }
}

// Function to query inventory directly
export async function queryInventoryDirect() {
  try {
    const { data, error } = await supabase
      .from('core_inventoryrecord')
      .select(`
        *,
        core_medicine!inner(
          id,
          name,
          product_code,
          manufacturer,
          price,
          is_available
        ),
        core_pharmacybranch!inner(
          id,
          name,
          address
        )
      `)
      .order('branch_id')
    
    if (error) {
      console.error('Query inventory error:', error)
      throw error
    }
    
    return data
  } catch (err) {
    console.error('Query inventory failed:', err)
    throw err
  }
}

// Function to get inventory by branch
export async function getInventoryByBranch(branchId: number) {
  try {
    const { data, error } = await supabase
      .from('core_inventoryrecord')
      .select(`
        *,
        core_medicine!inner(
          id,
          name,
          product_code,
          manufacturer,
          price,
          is_available
        ),
        core_pharmacybranch!inner(
          id,
          name,
          address
        )
      `)
      .eq('branch_id', branchId)
      .order('core_medicine.name')
    
    if (error) {
      console.error('Get branch inventory error:', error)
      throw error
    }
    
    return data
  } catch (err) {
    console.error('Get branch inventory failed:', err)
    throw err
  }
}

// Function to find missing products in inventory
export async function findMissingProductsInInventory(branchId?: number) {
  try {
    // First get all products
    const { data: allProducts, error: productsError } = await supabase
      .from('core_medicine')
      .select('id, product_code, name, manufacturer, is_available')
      .eq('is_available', true)
    
    if (productsError) {
      console.error('Get products for missing check error:', productsError)
      throw productsError
    }
    
    // Then get inventory records for the branch (or all branches if no branchId)
    let inventoryQuery = supabase
      .from('core_inventoryrecord')
      .select('product_id')
    
    if (branchId) {
      inventoryQuery = inventoryQuery.eq('branch_id', branchId)
    }
    
    const { data: inventoryRecords, error: inventoryError } = await inventoryQuery
    
    if (inventoryError) {
      console.error('Get inventory for missing check error:', inventoryError)
      throw inventoryError
    }
    
    // Find products that don't have inventory records
    const inventoryProductIds = new Set(inventoryRecords?.map(record => record.product_id) || [])
    const missingProducts = allProducts?.filter(product => !inventoryProductIds.has(product.id)) || []
    
    return missingProducts
  } catch (err) {
    console.error('Find missing products failed:', err)
    throw err
  }
}

// Function to get table counts
export async function getTableCounts() {
  try {
    const [branchesResult, productsResult, inventoryResult] = await Promise.all([
      supabase.from('core_pharmacybranch').select('id', { count: 'exact', head: true }),
      supabase.from('core_medicine').select('id', { count: 'exact', head: true }),
      supabase.from('core_inventoryrecord').select('id', { count: 'exact', head: true })
    ])
    
    const counts = {
      branches: branchesResult.count || 0,
      products: productsResult.count || 0,
      inventory_records: inventoryResult.count || 0
    }
    
    return counts
  } catch (err) {
    console.error('Get table counts failed:', err)
    throw err
  }
}