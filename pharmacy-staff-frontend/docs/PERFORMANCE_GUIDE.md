# ⚡ Performance & Caching Guide - Long Châu PMS

## Overview

This guide outlines the performance optimization strategies and caching mechanisms implemented in the Long Châu Pharmacy Management System to ensure fast, responsive user experience.

## Table of Contents

- [Caching Strategy](#caching-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Bundle Optimization](#bundle-optimization)
- [Runtime Performance](#runtime-performance)
- [Monitoring & Analytics](#monitoring--analytics)
- [Best Practices](#best-practices)

## Caching Strategy

### React Query Caching Architecture

Our application uses TanStack Query (React Query) for intelligent data caching with different strategies based on data characteristics:

#### Cache Time Configuration

```typescript
// lib/queryKeys.ts - Cache configuration per data type
export const CACHE_CONFIG = {
  // Real-time critical data (short cache)
  orders: {
    staleTime: 30 * 1000,      // 30 seconds
    cacheTime: 5 * 60 * 1000,  // 5 minutes
    refetchInterval: 60 * 1000  // 1 minute background refetch
  },
  
  // Frequently changing data (medium cache)
  inventory: {
    staleTime: 60 * 1000,      // 1 minute
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000 // 2 minutes background refetch
  },
  
  // Semi-static data (longer cache)
  users: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true
  },
  
  // Static data (extended cache)
  products: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  },
  
  // Configuration data (longest cache)
  branches: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false
  },
  
  // Analytics and stats (balanced cache)
  statistics: {
    staleTime: 2 * 60 * 1000,  // 2 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 5 * 60 * 1000 // 5 minutes background refetch
  }
}
```

#### Query Key Structure

Hierarchical query keys for efficient cache invalidation:

```typescript
// Centralized query key factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const
}

// Usage examples:
// userKeys.all -> ['users']
// userKeys.list({ role: 'customer' }) -> ['users', 'list', { role: 'customer' }]
// userKeys.detail(123) -> ['users', 'detail', 123]
```

#### Smart Cache Invalidation

```typescript
// Automatic invalidation on mutations
const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries(userKeys.all)
      
      // Invalidate related statistics
      queryClient.invalidateQueries(['stats', 'users'])
      
      // Update user count optimistically
      queryClient.setQueryData(['stats', 'overview'], (old: any) => ({
        ...old,
        totalUsers: (old?.totalUsers || 0) + 1
      }))
    }
  })
}
```

### Optimistic Updates

Immediate UI feedback with automatic rollback on errors:

```typescript
const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserRequest) => 
      userService.updateUser(id, data),
    
    // Optimistically update UI immediately
    onMutate: async (variables) => {
      const { id, ...updates } = variables
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries(userKeys.detail(id))
      
      // Snapshot current value
      const previousUser = queryClient.getQueryData(userKeys.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(userKeys.detail(id), (old: any) => ({
        ...old,
        ...updates,
        updated_at: new Date().toISOString()
      }))
      
      // Return rollback data
      return { previousUser, id }
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(context.id),
          context.previousUser
        )
      }
    },
    
    // Always refetch after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(userKeys.detail(variables.id))
    }
  })
}
```

### Background Synchronization

Automatic background updates for critical data:

```typescript
// Inventory with real-time updates
const useInventoryRecords = (filters?: InventoryFilters) => {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => inventoryService.getInventoryRecords(filters),
    ...CACHE_CONFIG.inventory,
    
    // Aggressive background sync for critical stock data
    refetchInterval: 2 * 60 * 1000, // Every 2 minutes
    refetchIntervalInBackground: true,
    
    // Refetch on window focus for immediate updates
    refetchOnWindowFocus: true,
    
    // Show stale data while refetching
    keepPreviousData: true
  })
}
```

## Performance Optimizations

### Code Splitting & Lazy Loading

```typescript
// Lazy load heavy components
const ReportsPage = lazy(() => import('@/app/reports/page'))
const InventoryPage = lazy(() => import('@/app/inventory/page'))

// Route-based code splitting
const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
    </Routes>
  </Suspense>
)
```

### Component Optimization

```typescript
// Memoize expensive calculations
const Dashboard = () => {
  const { data: orders } = useOrders()
  const { data: users } = useUsers()
  
  // Memoize dashboard statistics
  const dashboardStats = useMemo(() => {
    if (!orders || !users) return null
    
    return {
      todayRevenue: calculateTodayRevenue(orders),
      totalCustomers: users.filter(u => u.role === 'customer').length,
      lowStockCount: calculateLowStockItems(orders),
      revenueGrowth: calculateGrowthRate(orders)
    }
  }, [orders, users])
  
  // Memoize chart data processing
  const chartData = useMemo(() => ({
    revenueData: processRevenueData(orders),
    ordersData: processOrdersData(orders),
    inventoryData: processInventoryData(orders)
  }), [orders])
  
  return (
    <div>
      <StatsCards stats={dashboardStats} />
      <ChartsSection data={chartData} />
    </div>
  )
}
```

### Image Optimization

```typescript
// Next.js Image component with optimization
import Image from 'next/image'

const ProductImage = ({ product }: { product: Product }) => (
  <Image
    src={product.image_url}
    alt={product.name}
    width={300}
    height={200}
    priority={false}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    sizes="(max-width: 768px) 100vw, 300px"
  />
)
```

### Virtual Scrolling for Large Lists

```typescript
// React Window for large datasets
import { FixedSizeList as List } from 'react-window'

const VirtualizedUserList = ({ users }: { users: User[] }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <UserCard user={users[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={users.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

## Bundle Optimization

### Current Bundle Analysis

Based on our production build:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    14.7 kB         262 kB
├ ○ /branches                            9.09 kB         173 kB
├ ○ /customers                           3.52 kB         171 kB
├ ○ /deliveries                          7.29 kB         171 kB
├ ○ /inventory                           7.84 kB         172 kB
├ ○ /orders                              4.88 kB         172 kB
├ ○ /reports                             8.14 kB         276 kB
└ ○ /warehouse                           3.22 kB         100 kB

+ First Load JS shared by all            87.9 kB
```

### Bundle Size Optimizations

```typescript
// Tree shaking - import only what you need
import { format, parseISO } from 'date-fns' // ✅ Good
import * as dateFns from 'date-fns' // ❌ Bad - imports entire library

// Conditional imports
const heavyLibrary = await import('heavy-library')

// Dynamic imports for charts
const Chart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
)
```

### Webpack Bundle Analyzer

```bash
# Analyze bundle composition
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // your next config
})

# Generate analysis
ANALYZE=true npm run build
```

## Runtime Performance

### Measuring Performance

```typescript
// Performance monitoring hook
const usePerformanceMonitor = (operationName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>()
  
  const startMeasurement = useCallback(() => {
    performance.mark(`${operationName}-start`)
  }, [operationName])
  
  const endMeasurement = useCallback(() => {
    performance.mark(`${operationName}-end`)
    performance.measure(
      operationName,
      `${operationName}-start`,
      `${operationName}-end`
    )
    
    const measure = performance.getEntriesByName(operationName)[0]
    setMetrics({
      duration: measure.duration,
      startTime: measure.startTime,
      name: operationName
    })
  }, [operationName])
  
  return { startMeasurement, endMeasurement, metrics }
}

// Usage in components
const OrdersList = () => {
  const { startMeasurement, endMeasurement } = usePerformanceMonitor('orders-load')
  const { data: orders, isLoading } = useOrders({
    onSuccess: endMeasurement
  })
  
  useEffect(() => {
    if (isLoading) startMeasurement()
  }, [isLoading, startMeasurement])
  
  return <OrderTable orders={orders} />
}
```

### Memory Management

```typescript
// Cleanup subscriptions and timers
const useDataPolling = (queryKey: string, interval: number) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const timer = setInterval(() => {
      queryClient.invalidateQueries([queryKey])
    }, interval)
    
    return () => clearInterval(timer)
  }, [queryKey, interval, queryClient])
}

// AbortController for cancelled requests
const useCancellableQuery = (queryKey: string, queryFn: () => Promise<any>) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: ({ signal }) => {
      // Service should support AbortSignal
      return queryFn({ signal })
    },
    // React Query automatically cancels on unmount
  })
}
```

### Debouncing for Search

```typescript
// Optimized search with debouncing
const useSearchProducts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Only search when debounced term changes
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'search', debouncedTerm],
    queryFn: () => productService.searchProducts(debouncedTerm),
    enabled: debouncedTerm.length > 2, // Minimum 3 characters
    keepPreviousData: true, // Show previous results while loading
    staleTime: 30 * 1000 // Cache search results for 30 seconds
  })
  
  return {
    searchTerm,
    setSearchTerm,
    products,
    isLoading: isLoading && debouncedTerm.length > 2
  }
}
```

## Monitoring & Analytics

### Performance Metrics Collection

```typescript
// Custom performance tracking
class PerformanceTracker {
  private metrics: Map<string, PerformanceEntry[]> = new Map()
  
  startTiming(name: string) {
    performance.mark(`${name}-start`)
  }
  
  endTiming(name: string) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measures = performance.getEntriesByName(name)
    this.metrics.set(name, measures)
  }
  
  getMetrics(name: string) {
    return this.metrics.get(name) || []
  }
  
  getAllMetrics() {
    return Object.fromEntries(this.metrics)
  }
  
  // Send metrics to analytics service
  async sendMetrics() {
    const metrics = this.getAllMetrics()
    
    // Send to your analytics provider
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    })
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker()
```

### React Query DevTools Integration

```typescript
// Development-only devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

### Web Vitals Monitoring

```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics provider
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    event_label: metric.id,
    non_interaction: true,
  })
}

export function reportWebVitals(metric) {
  // Log performance metrics
  console.log(metric)
  
  // Send to analytics
  sendToAnalytics(metric)
}

// Measure specific interactions
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## Best Practices

### 1. Query Configuration Guidelines

```typescript
// Configure queries based on data characteristics
const useDataQuery = (type: 'static' | 'dynamic' | 'realtime') => {
  const configs = {
    static: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false
    },
    dynamic: {
      staleTime: 2 * 60 * 1000,  // 2 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true
    },
    realtime: {
      staleTime: 0,              // Always stale
      cacheTime: 60 * 1000,      // 1 minute
      refetchInterval: 30 * 1000 // 30 seconds
    }
  }
  
  return configs[type]
}
```

### 2. Error Boundaries for Performance

```typescript
// Performance-aware error boundary
class PerformanceErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorInfo: null }
  }
  
  static getDerivedStateFromError(error) {
    // Log performance impact of errors
    performanceTracker.endTiming('component-render')
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    // Send error metrics
    this.sendErrorMetrics(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />
    }
    
    return this.props.children
  }
}
```

### 3. Resource Preloading

```typescript
// Preload critical resources
const useResourcePreloader = () => {
  useEffect(() => {
    // Preload next likely page
    router.prefetch('/orders')
    
    // Preload critical data
    queryClient.prefetchQuery({
      queryKey: userKeys.all,
      queryFn: userService.getUsers,
      staleTime: 10 * 60 * 1000
    })
  }, [])
}
```

### 4. Performance Budget

```typescript
// Performance budget configuration
const PERFORMANCE_BUDGET = {
  maxBundleSize: 300 * 1024, // 300KB
  maxFirstLoadJS: 400 * 1024, // 400KB
  maxQueryTime: 2000, // 2 seconds
  maxRenderTime: 100, // 100ms
  maxMemoryUsage: 50 * 1024 * 1024 // 50MB
}

// Performance monitoring
const checkPerformanceBudget = () => {
  const navigation = performance.getEntriesByType('navigation')[0]
  const loadTime = navigation.loadEventEnd - navigation.fetchStart
  
  if (loadTime > PERFORMANCE_BUDGET.maxQueryTime) {
    console.warn(`Page load exceeded budget: ${loadTime}ms`)
  }
}
```

### 5. Cache Warming

```typescript
// Warm cache with likely needed data
const useCacheWarming = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Warm frequently accessed data
    const warmCache = async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: userKeys.stats(),
          queryFn: userService.getStatistics
        }),
        queryClient.prefetchQuery({
          queryKey: inventoryKeys.lowStock(),
          queryFn: inventoryService.getLowStockRecords
        })
      ])
    }
    
    // Warm cache after initial load
    setTimeout(warmCache, 1000)
  }, [queryClient])
}
```

## Deployment Optimizations

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate=59"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://longchau-pms.onrender.com/api/:path*"
    }
  ]
}
```

### Environment-Specific Optimizations

```typescript
// next.config.js
module.exports = {
  // Production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Compression
  compress: true,
  
  // Performance monitoring
  ...(process.env.NODE_ENV === 'production' && {
    webpack: (config) => {
      config.optimization.splitChunks.cacheGroups.vendor = {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
      return config
    }
  })
}
```

This comprehensive performance guide ensures the Long Châu PMS delivers optimal user experience with intelligent caching, efficient resource utilization, and robust monitoring capabilities.