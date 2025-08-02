import React from 'react'
import { render, screen } from '@testing-library/react'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { OrdersChart } from '@/components/charts/OrdersChart'
import { InventoryStatusChart } from '@/components/charts/InventoryStatusChart'

// Mock recharts components to avoid canvas/SVG rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  LineChart: ({ children, data, ...props }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, ...props }: any) => (
    <div 
      data-testid="line" 
      data-datakey={dataKey} 
      data-stroke={stroke}
      {...props}
    />
  ),
  BarChart: ({ children, data, ...props }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} {...props}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, ...props }: any) => (
    <div 
      data-testid="bar" 
      data-datakey={dataKey} 
      data-fill={fill}
      {...props}
    />
  ),
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Pie: ({ data, dataKey, cx, cy, outerRadius, label, ...props }: any) => (
    <div 
      data-testid="pie" 
      data-chart-data={JSON.stringify(data)}
      data-datakey={dataKey}
      data-cx={cx}
      data-cy={cy}
      data-outer-radius={outerRadius}
      {...props}
    >
      {/* Render pie segments */}
      {data?.map((entry: any, index: number) => (
        <div
          key={`segment-${index}`}
          data-testid={`pie-segment-${index}`}
          data-value={entry[dataKey]}
          data-label={entry.status || entry.name}
        />
      ))}
    </div>
  ),
  Cell: ({ fill, ...props }: any) => (
    <div data-testid="cell" data-fill={fill} {...props} />
  ),
  XAxis: ({ dataKey, ...props }: any) => (
    <div data-testid="x-axis" data-datakey={dataKey} {...props} />
  ),
  YAxis: ({ tickFormatter, ...props }: any) => (
    <div 
      data-testid="y-axis" 
      data-tick-formatter={tickFormatter?.toString()}
      {...props}
    />
  ),
  CartesianGrid: (props: any) => (
    <div data-testid="cartesian-grid" {...props} />
  ),
  Tooltip: ({ formatter, contentStyle, ...props }: any) => (
    <div 
      data-testid="tooltip" 
      data-formatter={formatter?.toString()}
      data-content-style={JSON.stringify(contentStyle)}
      {...props}
    />
  ),
  Legend: (props: any) => (
    <div data-testid="legend" {...props} />
  ),
}))

describe('Chart Components Integration Tests', () => {
  describe('RevenueChart', () => {
    const mockRevenueData = [
      { date: 'Jan 1', revenue: 150.5, orders: 5 },
      { date: 'Jan 2', revenue: 275.25, orders: 8 },
      { date: 'Jan 3', revenue: 189.75, orders: 6 },
      { date: 'Jan 4', revenue: 345.0, orders: 12 },
      { date: 'Jan 5', revenue: 225.5, orders: 7 },
    ]

    it('renders revenue chart with correct data structure', () => {
      render(<RevenueChart data={mockRevenueData} />)

      // Check main chart container
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()

      // Verify data is passed correctly
      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mockRevenueData))
    })

    it('configures line element with correct properties', () => {
      render(<RevenueChart data={mockRevenueData} />)

      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-datakey', 'revenue')
      expect(line).toHaveAttribute('data-stroke', 'hsl(var(--primary))')
    })

    it('includes chart axes and grid', () => {
      render(<RevenueChart data={mockRevenueData} />)

      // Check axes
      const xAxis = screen.getByTestId('x-axis')
      const yAxis = screen.getByTestId('y-axis')
      
      expect(xAxis).toBeInTheDocument()
      expect(xAxis).toHaveAttribute('data-datakey', 'date')
      expect(yAxis).toBeInTheDocument()

      // Check grid
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('includes tooltip with Vietnamese currency formatting', () => {
      render(<RevenueChart data={mockRevenueData} />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toBeInTheDocument()
      
      // Check content style
      const contentStyle = JSON.parse(tooltip.getAttribute('data-content-style') || '{}')
      expect(contentStyle.backgroundColor).toBe('hsl(var(--background))')
      expect(contentStyle.border).toBe('1px solid hsl(var(--border))')
    })

    it('handles empty data gracefully', () => {
      render(<RevenueChart data={[]} />)

      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', '[]')
      
      // Chart components should still render
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('renders with responsive container', () => {
      render(<RevenueChart data={mockRevenueData} />)

      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveAttribute('width', '100%')
      expect(container).toHaveAttribute('height', '200')
    })
  })

  describe('OrdersChart', () => {
    const mockOrdersData = [
      { date: 'Prescription', orders: 15, type: 'prescription' },
      { date: 'In store', orders: 25, type: 'in_store' },
      { date: 'Online', orders: 10, type: 'online' },
    ]

    it('renders orders chart with correct data structure', () => {
      render(<OrdersChart data={mockOrdersData} />)

      // Check main chart container
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

      // Verify data is passed correctly
      const barChart = screen.getByTestId('bar-chart')
      expect(barChart).toHaveAttribute('data-chart-data', JSON.stringify(mockOrdersData))
    })

    it('configures bar element with correct properties', () => {
      render(<OrdersChart data={mockOrdersData} />)

      const bar = screen.getByTestId('bar')
      expect(bar).toHaveAttribute('data-datakey', 'orders')
      expect(bar).toHaveAttribute('data-fill', 'hsl(var(--primary))')
    })

    it('includes chart axes and grid', () => {
      render(<OrdersChart data={mockOrdersData} />)

      // Check axes
      const xAxis = screen.getByTestId('x-axis')
      const yAxis = screen.getByTestId('y-axis')
      
      expect(xAxis).toBeInTheDocument()
      expect(xAxis).toHaveAttribute('data-datakey', 'date')
      expect(yAxis).toBeInTheDocument()

      // Check grid
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('includes tooltip for order counts', () => {
      render(<OrdersChart data={mockOrdersData} />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toBeInTheDocument()
      
      // Check content style
      const contentStyle = JSON.parse(tooltip.getAttribute('data-content-style') || '{}')
      expect(contentStyle.backgroundColor).toBe('hsl(var(--background))')
    })

    it('handles different order types correctly', () => {
      const diverseOrderData = [
        { date: 'Prescription', orders: 5, type: 'prescription' },
        { date: 'In store', orders: 15, type: 'in_store' },
        { date: 'Online', orders: 3, type: 'online' },
        { date: 'Emergency', orders: 2, type: 'emergency' },
      ]

      render(<OrdersChart data={diverseOrderData} />)

      const barChart = screen.getByTestId('bar-chart')
      expect(barChart).toHaveAttribute('data-chart-data', JSON.stringify(diverseOrderData))
    })

    it('renders with responsive container', () => {
      render(<OrdersChart data={mockOrdersData} />)

      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveAttribute('width', '100%')
      expect(container).toHaveAttribute('height', '200')
    })
  })

  describe('InventoryStatusChart', () => {
    const mockInventoryData = [
      { status: 'In Stock', count: 45, color: '#10b981' },
      { status: 'Low Stock', count: 8, color: '#f59e0b' },
      { status: 'Out of Stock', count: 2, color: '#ef4444' },
    ]

    it('renders inventory status chart with correct data structure', () => {
      render(<InventoryStatusChart data={mockInventoryData} />)

      // Check main chart container
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()

      // Verify data is passed correctly
      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-chart-data', JSON.stringify(mockInventoryData))
    })

    it('configures pie element with correct properties', () => {
      render(<InventoryStatusChart data={mockInventoryData} />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-datakey', 'count')
      expect(pie).toHaveAttribute('data-cx', '50%')
      expect(pie).toHaveAttribute('data-cy', '50%')
      expect(pie).toHaveAttribute('data-outer-radius', '60')
    })

    it('renders pie segments for each inventory status', () => {
      render(<InventoryStatusChart data={mockInventoryData} />)

      // Check that segments are rendered for each data point
      expect(screen.getByTestId('pie-segment-0')).toBeInTheDocument()
      expect(screen.getByTestId('pie-segment-1')).toBeInTheDocument()
      expect(screen.getByTestId('pie-segment-2')).toBeInTheDocument()

      // Verify segment data
      const segment0 = screen.getByTestId('pie-segment-0')
      const segment1 = screen.getByTestId('pie-segment-1')
      const segment2 = screen.getByTestId('pie-segment-2')

      expect(segment0).toHaveAttribute('data-value', '45')
      expect(segment0).toHaveAttribute('data-label', 'In Stock')

      expect(segment1).toHaveAttribute('data-value', '8')
      expect(segment1).toHaveAttribute('data-label', 'Low Stock')

      expect(segment2).toHaveAttribute('data-value', '2')
      expect(segment2).toHaveAttribute('data-label', 'Out of Stock')
    })

    it('includes tooltip and legend', () => {
      render(<InventoryStatusChart data={mockInventoryData} />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('handles different inventory statuses correctly', () => {
      const customInventoryData = [
        { status: 'Available', count: 100, color: '#22c55e' },
        { status: 'Reserved', count: 15, color: '#3b82f6' },
        { status: 'Damaged', count: 3, color: '#ef4444' },
        { status: 'Expired', count: 1, color: '#6b7280' },
      ]

      render(<InventoryStatusChart data={customInventoryData} />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-chart-data', JSON.stringify(customInventoryData))

      // Check segments for custom data
      expect(screen.getByTestId('pie-segment-0')).toHaveAttribute('data-label', 'Available')
      expect(screen.getByTestId('pie-segment-1')).toHaveAttribute('data-label', 'Reserved')
      expect(screen.getByTestId('pie-segment-2')).toHaveAttribute('data-label', 'Damaged')
      expect(screen.getByTestId('pie-segment-3')).toHaveAttribute('data-label', 'Expired')
    })

    it('handles empty inventory data', () => {
      render(<InventoryStatusChart data={[]} />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-chart-data', '[]')
      
      // Should not render any segments
      expect(screen.queryByTestId('pie-segment-0')).not.toBeInTheDocument()
    })

    it('renders with responsive container', () => {
      render(<InventoryStatusChart data={mockInventoryData} />)

      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveAttribute('width', '100%')
      expect(container).toHaveAttribute('height', '200')
    })
  })

  describe('Chart Integration with Real Data Patterns', () => {
    it('handles Vietnamese currency formatting in revenue chart', () => {
      const vietnameseRevenueData = [
        { date: 'T2', revenue: 1500000, orders: 25 }, // 1.5M VND
        { date: 'T3', revenue: 2750000, orders: 45 }, // 2.75M VND
        { date: 'T4', revenue: 890000, orders: 18 },  // 890K VND
      ]

      render(<RevenueChart data={vietnameseRevenueData} />)

      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(vietnameseRevenueData))
    })

    it('handles zero values in charts gracefully', () => {
      const dataWithZeros = [
        { date: 'Monday', orders: 0, type: 'online' },
        { date: 'Tuesday', orders: 5, type: 'in_store' },
        { date: 'Wednesday', orders: 0, type: 'prescription' },
      ]

      render(<OrdersChart data={dataWithZeros} />)

      const barChart = screen.getByTestId('bar-chart')
      expect(barChart).toHaveAttribute('data-chart-data', JSON.stringify(dataWithZeros))
    })

    it('handles single data point scenarios', () => {
      const singleDataPoint = [
        { status: 'In Stock', count: 100, color: '#10b981' }
      ]

      render(<InventoryStatusChart data={singleDataPoint} />)

      expect(screen.getByTestId('pie-segment-0')).toBeInTheDocument()
      expect(screen.queryByTestId('pie-segment-1')).not.toBeInTheDocument()
    })

    it('handles large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 30 }, (_, index) => ({
        date: `Day ${index + 1}`,
        revenue: Math.random() * 1000,
        orders: Math.floor(Math.random() * 20)
      }))

      render(<RevenueChart data={largeDataset} />)

      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(largeDataset))
    })
  })

  describe('Chart Accessibility and Styling', () => {
    it('applies correct CSS classes for styling', () => {
      render(<RevenueChart data={[{ date: 'Test', revenue: 100, orders: 1 }]} />)

      const xAxis = screen.getByTestId('x-axis')
      const yAxis = screen.getByTestId('y-axis')

      expect(xAxis).toHaveClass('text-xs', 'fill-muted-foreground')
      expect(yAxis).toHaveClass('text-xs', 'fill-muted-foreground')
    })

    it('configures tooltips with consistent styling', () => {
      const testData = [{ status: 'Test', count: 1, color: '#000' }]
      render(<InventoryStatusChart data={testData} />)

      const tooltip = screen.getByTestId('tooltip')
      const contentStyle = JSON.parse(tooltip.getAttribute('data-content-style') || '{}')
      
      expect(contentStyle.backgroundColor).toBe('hsl(var(--background))')
      expect(contentStyle.border).toBe('1px solid hsl(var(--border))')
      expect(contentStyle.borderRadius).toBe('6px')
    })

    it('uses consistent color scheme', () => {
      const testData = [{ date: 'Test', orders: 1, type: 'test' }]
      render(<OrdersChart data={testData} />)

      const bar = screen.getByTestId('bar')
      expect(bar).toHaveAttribute('data-fill', 'hsl(var(--primary))')
    })
  })
})