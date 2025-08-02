import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProductData {
  name: string
  sales: number
  revenue: number
}

interface TopProductsChartProps {
  data: ProductData[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis 
          yAxisId="revenue"
          orientation="left"
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₫${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          yAxisId="sales"
          orientation="right"
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `₫${value.toLocaleString('vi-VN')}` : `${value} units`,
            name === 'revenue' ? 'Revenue' : 'Units Sold'
          ]}
        />
        <Bar yAxisId="revenue" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}