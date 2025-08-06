'use client'

import React, { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Order, OrderItem } from '@/lib/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Package, AlertTriangle, XCircle } from 'lucide-react'
import { useUsers } from '@/hooks/api/useUsers'
import { useProducts } from '@/hooks/api/useProducts'
import { useBranches } from '@/hooks/api/useBranches'
import { 
  outOfStockProducts, 
  isProductOutOfStock, 
  mockOutOfStockError 
} from '@/lib/mock-data'

// Simple validation schema
const orderFormSchema = z.object({
  customer: z.number().nullable(),
  order_type: z.enum(['prescription', 'in_store', 'online']),
  branch: z.number().min(1, 'Branch is required'),
  created_by: z.number().min(1, 'Staff member is required'),
  notes: z.string().optional(),
  prescription: z.number().optional(),
  validated_by: z.number().optional(),
  delivery_address: z.string().optional(),
  delivery_instructions: z.string().optional(),
  // Unregistered customer
  unregistered_customer_name: z.string().optional(),
  unregistered_customer_phone: z.string().optional(),
  unregistered_customer_email: z.string().optional(),
})

interface CartItem {
  product: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderFormProps {
  order?: Partial<Order>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onStatusChange?: (orderId: number, newStatus: Order['status']) => Promise<void>
}

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  onStatusChange
}) => {
  // API data
  const { data: allUsers = [], isLoading: usersLoading } = useUsers()
  const { data: branches = [], isLoading: branchesLoading } = useBranches()
  const { data: products = [], isLoading: productsLoading } = useProducts()
  
  // Filter users by type
  const customers = allUsers.filter(user => user.is_customer_member === true)
  const staff = allUsers.filter(user => user.is_staff_member === true)
  const customersLoading = usersLoading
  const staffLoading = usersLoading
  
  // Form state
  const [customerType, setCustomerType] = useState<'registered' | 'unregistered'>('registered')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [outOfStockError, setOutOfStockError] = useState<string | null>(null)
  const [stockWarnings, setStockWarnings] = useState<{productId: number, message: string}[]>([])
  
  // Product addition
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productQuantity, setProductQuantity] = useState(1)

  const form = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer: order?.customer || null,
      order_type: order?.order_type || 'in_store',
      branch: order?.branch || undefined,
      created_by: order?.created_by || undefined,
      notes: order?.notes || '',
      prescription: order?.prescription || undefined,
      validated_by: order?.validated_by || undefined,
      delivery_address: order?.delivery_address || '',
      delivery_instructions: order?.delivery_instructions || '',
      unregistered_customer_name: order?.unregistered_customer_name || '',
      unregistered_customer_phone: order?.unregistered_customer_phone || '',
      unregistered_customer_email: order?.unregistered_customer_email || '',
    },
  })

  const watchOrderType = form.watch('order_type')

  // Initialize cart from existing order
  useEffect(() => {
    if (order?.items) {
      const items = order.items.map(item => ({
        product: typeof item.product === 'number' ? item.product : parseInt(String(item.product)),
        product_name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price || '0'),
        total_price: parseFloat(item.total_price || '0'),
      }))
      setCartItems(items)
    }
  }, [order])

  const handleAddProduct = () => {
    if (!selectedProduct) return
    
    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    // BUSINESS RULE VALIDATION: Check if product is out of stock
    if (isProductOutOfStock(product.id)) {
      setOutOfStockError(`Cannot add "${product.name}" - This product is currently out of stock`)
      setStockWarnings(prev => [...prev, {
        productId: product.id,
        message: `${product.name} is out of stock`
      }])
      return
    }

    // Check if product stock is available from mock data
    const outOfStockProduct = outOfStockProducts.find(p => p.id === product.id)
    if (outOfStockProduct) {
      setOutOfStockError(`Cannot add "${product.name}" - Available stock: ${outOfStockProduct.stock || 0}, Requested: ${productQuantity}`)
      return
    }

    // Clear previous errors
    setOutOfStockError(null)
    setStockWarnings(prev => prev.filter(w => w.productId !== product.id))

    const existingIndex = cartItems.findIndex(item => item.product === product.id)
    
    if (existingIndex >= 0) {
      // Update existing item
      const newItems = [...cartItems]
      newItems[existingIndex].quantity += productQuantity
      newItems[existingIndex].total_price = newItems[existingIndex].quantity * newItems[existingIndex].unit_price
      setCartItems(newItems)
    } else {
      // Add new item
      const unitPrice = parseFloat(product.price || '0')
      const newItem: CartItem = {
        product: product.id,
        product_name: product.name,
        quantity: productQuantity,
        unit_price: unitPrice,
        total_price: unitPrice * productQuantity,
      }
      setCartItems([...cartItems, newItem])
    }
    
    setSelectedProduct('')
    setProductQuantity(1)
  }

  const handleRemoveProduct = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const newItems = [...cartItems]
    newItems[index].quantity = newQuantity
    newItems[index].total_price = newItems[index].unit_price * newQuantity
    setCartItems(newItems)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      // BUSINESS RULE VALIDATION: Check cart items for out-of-stock products
      const outOfStockItems = cartItems.filter(item => isProductOutOfStock(item.product))
      if (outOfStockItems.length > 0) {
        setOutOfStockError(`Cannot process order: The following items are out of stock: ${outOfStockItems.map(item => item.product_name).join(', ')}`)
        return
      }

      const orderData = {
        customer: customerType === 'registered' ? data.customer : null,
        order_type: data.order_type,
        branch: data.branch,
        created_by: data.created_by,
        notes: data.notes,
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        total_amount: getTotalAmount().toString(),
        ...(data.order_type === 'prescription' && {
          prescription: data.prescription,
          validated_by: data.validated_by,
        }),
        ...(data.order_type === 'online' && {
          delivery_address: data.delivery_address,
          delivery_instructions: data.delivery_instructions,
        }),
        ...(customerType === 'unregistered' && {
          unregistered_customer_name: data.unregistered_customer_name,
          unregistered_customer_phone: data.unregistered_customer_phone,
          unregistered_customer_email: data.unregistered_customer_email,
        })
      }

      await onSubmit(orderData)
    } catch (error) {
      console.error('Order submission failed:', error)
      // Check if error is related to stock issues
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message
        if (errorMessage.includes('stock') || errorMessage.includes('inventory')) {
          setOutOfStockError(`Order failed: ${errorMessage}`)
        }
      }
    }
  }

  const isReadOnly = mode === 'edit' && order?.status === 'completed'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Type */}
                <div>
                  <Label>Order Type</Label>
                  <select
                    {...form.register('order_type')}
                    disabled={isReadOnly}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="in_store">In-Store Purchase</option>
                    <option value="online">Online Order</option>
                    <option value="prescription">Prescription Order</option>
                  </select>
                  {form.formState.errors.order_type && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.order_type.message}</p>
                  )}
                </div>

                {/* Customer Type */}
                <div>
                  <Label>Customer Type</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="registered"
                        checked={customerType === 'registered'}
                        onChange={(e) => setCustomerType(e.target.value as 'registered')}
                        disabled={isReadOnly}
                      />
                      <span>Registered Customer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="unregistered"
                        checked={customerType === 'unregistered'}
                        onChange={(e) => setCustomerType(e.target.value as 'unregistered')}
                        disabled={isReadOnly}
                      />
                      <span>Walk-in Customer</span>
                    </label>
                  </div>
                </div>

                {/* Customer Selection */}
                {customerType === 'registered' ? (
                  <div>
                    <Label>Customer</Label>
                    <select
                      {...form.register('customer', { 
                        setValueAs: (value) => value === '' ? null : parseInt(value) 
                      })}
                      disabled={isReadOnly || customersLoading}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">
                        {customersLoading ? 'Loading customers...' : 'Select customer...'}
                      </option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.display_name || `${customer.first_name} ${customer.last_name}`}
                          {customer.role === 'vip_customer' && ' (VIP)'}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.customer && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.customer.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <Label>Walk-in Customer Information</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Customer Name</Label>
                        <Input
                          {...form.register('unregistered_customer_name')}
                          placeholder="Enter customer name"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          {...form.register('unregistered_customer_phone')}
                          placeholder="Enter phone number"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email (Optional)</Label>
                      <Input
                        {...form.register('unregistered_customer_email')}
                        type="email"
                        placeholder="Enter email address"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                )}

                {/* Branch */}
                <div>
                  <Label>Branch</Label>
                  <select
                    {...form.register('branch', { setValueAs: (value) => parseInt(value) })}
                    disabled={isReadOnly || branchesLoading}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">
                      {branchesLoading ? 'Loading branches...' : 'Select branch...'}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.branch && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.branch.message}</p>
                  )}
                </div>

                {/* Staff */}
                <div>
                  <Label>Created By (Staff)</Label>
                  <select
                    {...form.register('created_by', { setValueAs: (value) => parseInt(value) })}
                    disabled={isReadOnly || staffLoading}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">
                      {staffLoading ? 'Loading staff...' : 'Select staff member...'}
                    </option>
                    {staff.map((staffMember) => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.display_name || `${staffMember.first_name} ${staffMember.last_name}`} - {staffMember.role}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.created_by && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.created_by.message}</p>
                  )}
                </div>

                {/* Prescription Fields */}
                {watchOrderType === 'prescription' && (
                  <>
                    <div>
                      <Label>Prescription ID</Label>
                      <Input
                        {...form.register('prescription', { setValueAs: (value) => value === '' ? undefined : parseInt(value) })}
                        type="number"
                        placeholder="Enter prescription ID"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Validated By (Pharmacist)</Label>
                      <select
                        {...form.register('validated_by', { setValueAs: (value) => value === '' ? undefined : parseInt(value) })}
                        disabled={isReadOnly}
                        className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="">Select pharmacist...</option>
                        {staff.filter(s => s.role === 'pharmacist').map((pharmacist) => (
                          <option key={pharmacist.id} value={pharmacist.id}>
                            {pharmacist.display_name || `${pharmacist.first_name} ${pharmacist.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Online Order Fields */}
                {watchOrderType === 'online' && (
                  <>
                    <div>
                      <Label>Delivery Address</Label>
                      <Textarea
                        {...form.register('delivery_address')}
                        placeholder="Enter delivery address"
                        rows={2}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Delivery Instructions (Optional)</Label>
                      <Textarea
                        {...form.register('delivery_instructions')}
                        placeholder="Special delivery instructions"
                        rows={2}
                        disabled={isReadOnly}
                      />
                    </div>
                  </>
                )}

                {/* Notes */}
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    {...form.register('notes')}
                    placeholder="Additional notes"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Products */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Product Section */}
                {!isReadOnly && (
                  <div className="p-4 border border-dashed rounded-lg">
                    <Label className="text-sm font-medium">Add Product</Label>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-input bg-background rounded-md text-sm overflow-hidden"
                        disabled={productsLoading}
                        title={selectedProduct ? products.find(p => p.id === parseInt(selectedProduct))?.name : ''}
                      >
                        <option value="">
                          {productsLoading ? 'Loading products...' : 'Select product...'}
                        </option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id} title={`${product.name} - ${formatCurrency(parseFloat(product.price || '0'))}`}>
                            {product.name.length > 50 ? `${product.name.substring(0, 47)}...` : product.name} - {formatCurrency(parseFloat(product.price || '0'))}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 sm:w-auto">
                        <Input
                          type="number"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-20 flex-shrink-0"
                          placeholder="Qty"
                        />
                        <Button
                          type="button"
                          onClick={handleAddProduct}
                          disabled={!selectedProduct}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Out-of-Stock Error Alert */}
                {outOfStockError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      Out of Stock Error
                    </AlertDescription>
                    <AlertDescription>
                      {outOfStockError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Stock Warnings */}
                {stockWarnings.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      Stock Issues Detected
                    </AlertDescription>
                    <div className="mt-2 space-y-1">
                      {stockWarnings.map((warning, index) => (
                        <div key={index} className="text-sm">
                          • {warning.message}
                        </div>
                      ))}
                    </div>
                  </Alert>
                )}

                {/* Cart Items */}
                <div className="space-y-2">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No items added yet</p>
                      {!isReadOnly && <p className="text-sm">Select products above to add to order</p>}
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate" title={item.product_name}>{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.unit_price)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isReadOnly ? (
                            <Badge variant="secondary">Qty: {item.quantity}</Badge>
                          ) : (
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              min={1}
                              className="w-16 sm:w-20"
                            />
                          )}
                          <div className="text-right min-w-[80px] sm:min-w-[100px]">
                            <div className="font-medium text-sm sm:text-base">{formatCurrency(item.total_price)}</div>
                          </div>
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-destructive flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {cartItems.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(getTotalAmount())}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Management (Edit Mode) */}
            {mode === 'edit' && order?.id && onStatusChange && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label>Current Status</Label>
                      <Badge variant="secondary" className="mt-1 block w-fit">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <Label>Update Status</Label>
                      <select
                        defaultValue={order.status}
                        onChange={(e) => onStatusChange(order.id!, e.target.value as Order['status'])}
                        disabled={isSubmitting}
                        className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          {!isReadOnly && (
            <Button 
              type="submit" 
              disabled={isSubmitting || cartItems.length === 0}
              className="min-w-[120px] w-full sm:w-auto"
            >
              {isSubmitting 
                ? 'Submitting...' 
                : mode === 'create' 
                  ? 'Create Order' 
                  : 'Update Order'
              }
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default OrderForm