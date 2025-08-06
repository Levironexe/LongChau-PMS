'use client'

import { useState, useEffect } from 'react'
import { 
  queryInventoryDirect, 
  getInventoryByBranch, 
  getAllBranches, 
  getAllProducts,
  findMissingProductsInInventory,
  getTableCounts,
  testConnection
} from '../../lib/supabase'

export default function DebugInventoryPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [missingProducts, setMissingProducts] = useState<any[]>([])
  const [tableCounts, setTableCounts] = useState<{branches?: number; products?: number; inventory?: number; inventory_records?: number}>({})
  const [selectedBranch, setSelectedBranch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setConnectionStatus('connecting')
    try {
      console.log('🔄 Testing Supabase connection with service role key...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...')
      
      // First, test the connection
      const connectionTest = await testConnection()
      console.log('Connection test result:', connectionTest)
      
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.error}`)
      }
      console.log('✅ Connection test passed:', connectionTest.message)
      
      // Get table counts to verify data access
      console.log('Getting table counts...')
      const counts = await getTableCounts()
      setTableCounts(counts)
      console.log('📊 Table counts:', counts)
      
      // Load all data in parallel
      console.log('Loading all data...')
      const [branchesData, productsData, inventoryData] = await Promise.all([
        getAllBranches(),
        getAllProducts(), 
        queryInventoryDirect()
      ])

      console.log('Raw data loaded:')
      console.log('- Branches:', branchesData)
      console.log('- Products:', productsData?.slice(0, 3)) // Just first 3 for brevity
      console.log('- Inventory:', inventoryData?.slice(0, 3)) // Just first 3 for brevity

      setBranches(branchesData || [])
      setProducts(productsData || [])
      setInventory(inventoryData || [])
      
      // Find missing products (products without inventory records)
      const missing = await findMissingProductsInInventory()
      setMissingProducts(missing || [])

      console.log('✅ Supabase Data Loaded:')
      console.log('  - Branches:', branchesData?.length || 0)
      console.log('  - Products:', productsData?.length || 0) 
      console.log('  - Inventory Records:', inventoryData?.length || 0)
      console.log('  - Missing Products:', missing?.length || 0)

      setConnectionStatus('connected')
      setError('')

    } catch (err: any) {
      setConnectionStatus('failed')
      setError(`❌ Supabase connection failed: ${err.message}`)
      console.error('🚨 Supabase error:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBranchInventory = async (branchId: string) => {
    if (!branchId) return
    
    setLoading(true)
    try {
      console.log(`🔄 Loading inventory for branch ${branchId}...`)
      
      const [branchInventory, branchMissing] = await Promise.all([
        getInventoryByBranch(parseInt(branchId)),
        findMissingProductsInInventory(parseInt(branchId))
      ])
      
      setInventory(branchInventory || [])
      setMissingProducts(branchMissing || [])
      
      console.log('📦 Branch inventory:', branchInventory?.length || 0, 'records')
      console.log('⚠️ Missing products:', branchMissing?.length || 0, 'products')
      
    } catch (err) {
      setError(`Failed to load branch inventory: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Branch inventory error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value
    setSelectedBranch(branchId)
    if (branchId) {
      loadBranchInventory(branchId)
    } else {
      loadInitialData()
    }
  }

  if (loading && inventory.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Inventory - Direct Supabase Connection</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Inventory - Direct Supabase Connection</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Branch Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Branch:</label>
        <select 
          value={selectedBranch} 
          onChange={handleBranchChange}
          className="border border-gray-300 rounded px-3 py-2 w-64"
        >
          <option value="">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Connection Status */}
      <div className="mb-4 p-4 rounded border-l-4 border-blue-500 bg-blue-50">
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <strong>Direct Database Connection:</strong>
          <span className="ml-2">
            {connectionStatus === 'connected' ? '✅ Connected' :
             connectionStatus === 'connecting' ? '🔄 Connecting...' : '❌ Failed'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Database: kwcttylitdqirnjkmhzk.supabase.co
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold">Total Branches</h3>
          <p className="text-2xl">{tableCounts.branches || branches.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold">Total Products</h3>
          <p className="text-2xl">{tableCounts.products || products.length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold">Inventory Records</h3>
          <p className="text-2xl">{tableCounts.inventory_records || inventory.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-semibold">Missing Products</h3>
          <p className="text-2xl text-red-600">{missingProducts.length}</p>
        </div>
      </div>

      {/* Missing Products Alert */}
      {missingProducts.length > 0 && (
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold mb-2">⚠️ Missing Products Found!</h3>
          <p className="mb-2">These products exist but have no inventory records in the selected branch:</p>
          <div className="max-h-32 overflow-y-auto">
            {missingProducts.map(product => (
              <div key={product.id} className="text-sm">
                • {product.name} ({product.product_code})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Inventory */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Current Inventory {selectedBranch && `(Branch: ${branches.find(b => b.id == selectedBranch)?.name})`}
        </h2>
        
        {inventory.length === 0 ? (
          <p className="text-gray-500">No inventory records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">Product ID</th>
                  <th className="border px-4 py-2 text-left">Product Name</th>
                  <th className="border px-4 py-2 text-left">Branch ID</th>
                  <th className="border px-4 py-2 text-left">Current Stock</th>
                  <th className="border px-4 py-2 text-left">Min Stock</th>
                  <th className="border px-4 py-2 text-left">Reorder Point</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={`${item.branch_id}-${item.product_id}`} 
                      className={item.current_stock <= item.reorder_point ? 'bg-red-50' : ''}>
                    <td className="border px-4 py-2">{item.product_id}</td>
                    <td className="border px-4 py-2">
                      <div>
                        <div className="font-medium">{item.core_medicine?.name || 'Unknown Product'}</div>
                        <div className="text-xs text-gray-500">{item.core_medicine?.product_code}</div>
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      <div>
                        <div>{item.branch_id}</div>
                        <div className="text-xs text-gray-500">{item.core_pharmacybranch?.name}</div>
                      </div>
                    </td>
                    <td className="border px-4 py-2 font-semibold">
                      {item.current_stock}
                    </td>
                    <td className="border px-4 py-2">{item.minimum_stock}</td>
                    <td className="border px-4 py-2">{item.reorder_point}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.current_stock <= item.reorder_point 
                          ? 'bg-red-200 text-red-700' 
                          : item.current_stock <= item.minimum_stock
                          ? 'bg-yellow-200 text-yellow-700'
                          : 'bg-green-200 text-green-700'
                      }`}>
                        {item.current_stock <= item.reorder_point 
                          ? 'Low Stock' 
                          : item.current_stock <= item.minimum_stock
                          ? 'Reorder Soon'
                          : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <p className="text-sm text-gray-600">
          This page connects directly to Supabase to debug inventory issues.
          <br />
          Connection status: {error ? '❌ Failed' : '✅ Connected'}
          <br />
          Service role key configured: ✅
        </p>
      </div>
    </div>
  )
}