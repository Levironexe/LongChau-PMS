import { z } from 'zod'

// Order item validation schema
export const orderItemSchema = z.object({
  product: z.number().min(1, 'Product ID is required'),
  product_name: z.string().optional(), // Read-only field from API
  product_code: z.string().optional(), // Read-only field from API
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.string().optional(), // Calculated by API
  total_price: z.string().optional(), // Calculated by API
})

// Base order validation schema
export const baseOrderSchema = z.object({
  // Required fields for order creation
  order_type: z.enum(['prescription', 'in_store', 'online']).refine(val => ['prescription', 'in_store', 'online'].includes(val), {
    message: 'Please select a valid order type'
  }),
  customer: z.number().min(1, 'Customer selection is required').nullable(),
  branch: z.number().min(1, 'Branch selection is required').optional(),
  created_by: z.number().min(1, 'Staff member is required').optional(),
  
  // Unregistered customer fields (used when customer is null)
  unregistered_customer_name: z.string().min(1, 'Customer name is required for walk-in customers').optional(),
  unregistered_customer_phone: z.string().optional(),
  unregistered_customer_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  unregistered_customer_address: z.string().optional(),
  
  // Optional fields
  notes: z.string().max(500, 'Notes must be under 500 characters').optional().or(z.literal('')),
  
  // Delivery fields (required for online orders)
  delivery_address: z.string().max(200, 'Delivery address must be under 200 characters').optional().or(z.literal('')),
  delivery_instructions: z.string().max(300, 'Delivery instructions must be under 300 characters').optional().or(z.literal('')),
  
  // Prescription-specific fields
  prescription: z.number().optional(),
  validated_by: z.number().optional(),
  
  // Order items (for creating orders with items)
  items: z.array(orderItemSchema).optional(),
  
  // Read-only fields from API responses
  id: z.number().optional(),
  order_number: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  order_date: z.string().optional(),
  total_amount: z.string().optional(),
  validation_date: z.string().optional(),
  served_by: z.number().optional(),
  
  // Computed fields from API
  customer_name: z.string().optional(),
  customer_role: z.string().optional(),
  created_by_name: z.string().optional(),
  validated_by_name: z.string().optional(),
  served_by_name: z.string().optional(),
  branch_name: z.string().optional(),
  calculated_total: z.number().optional(),
})

// Prescription order schema (requires prescription and validation)
export const prescriptionOrderSchema = baseOrderSchema.extend({
  order_type: z.literal('prescription'),
  prescription: z.number().min(1, 'Prescription is required for prescription orders'),
  // validated_by will be set when pharmacist validates
}).refine((data) => {
  // For prescription orders, ensure delivery fields are not required
  return data.order_type === 'prescription'
}, {
  message: 'Prescription orders require prescription reference'
})

// Online order schema (requires delivery information)
export const onlineOrderSchema = baseOrderSchema.extend({
  order_type: z.literal('online'),
  delivery_address: z.string().min(10, 'Delivery address is required for online orders')
    .max(200, 'Delivery address must be under 200 characters'),
  delivery_instructions: z.string().max(300, 'Delivery instructions must be under 300 characters').optional().or(z.literal('')),
}).refine((data) => {
  return data.order_type === 'online' && data.delivery_address && data.delivery_address.trim().length > 0
}, {
  message: 'Online orders require delivery address',
  path: ['delivery_address']
})

// In-store order schema (simplest form)
export const inStoreOrderSchema = baseOrderSchema.extend({
  order_type: z.literal('in_store'),
  // In-store orders don't require prescription or delivery info
})

// Discriminated union for order types with custom validation
export const orderSchema = z.discriminatedUnion('order_type', [
  prescriptionOrderSchema,
  onlineOrderSchema,
  inStoreOrderSchema,
]).refine((data) => {
  // Either customer is provided OR unregistered customer details are provided
  if (data.customer === null || data.customer === undefined) {
    return data.unregistered_customer_name && data.unregistered_customer_name.trim().length > 0
  }
  return true
}, {
  message: 'Either select a customer or provide walk-in customer name',
  path: ['customer']
})

// Order status transition schema
export const orderStatusTransitionSchema = z.object({
  new_status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional().or(z.literal('')),
})

// Order search/filter schema
export const orderFilterSchema = z.object({
  order_type: z.enum(['prescription', 'in_store', 'online']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  customer: z.number().optional(),
  branch: z.number().optional(),
  created_by: z.number().optional(),
  order_date_from: z.string().optional(),
  order_date_to: z.string().optional(),
})

// Shopping cart item schema for frontend cart management
export const cartItemSchema = z.object({
  product: z.number().min(1, 'Product ID is required'),
  product_name: z.string().min(1, 'Product name is required'),
  product_code: z.string().min(1, 'Product code is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(999, 'Maximum quantity is 999'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  total_price: z.number().min(0, 'Total price must be positive'),
  available_stock: z.number().min(0, 'Available stock must be non-negative').optional(),
})

// Cart validation schema
export const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart must have at least one item'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  discount_amount: z.number().min(0, 'Discount must be non-negative').optional(),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  customer_type: z.enum(['customer', 'vip_customer']).optional(),
})

// VIP customer validation for discounts
export const vipDiscountSchema = z.object({
  customer_id: z.number().min(1, 'Customer ID is required'),
  customer_type: z.enum(['customer', 'vip_customer']),
  discount_rate: z.number().min(0).max(1, 'Discount rate must be between 0 and 1').optional(),
  membership_level: z.string().optional(),
})

// Complex order scenario schemas
export const bulkOrderSchema = baseOrderSchema.extend({
  items: z.array(orderItemSchema).min(5, 'Bulk orders require at least 5 items'),
  bulk_discount_requested: z.boolean().optional(),
  special_instructions: z.string().max(1000, 'Special instructions must be under 1000 characters').optional(),
})

// Prescription order with validation workflow
export const prescriptionValidationSchema = z.object({
  prescription_id: z.number().min(1, 'Prescription ID is required'),
  validated_by: z.number().min(1, 'Pharmacist ID is required'),
  validation_notes: z.string().max(500, 'Validation notes must be under 500 characters').optional(),
  approved: z.boolean(),
  validation_date: z.string().optional(), // ISO date string
})

// Type exports for frontend use
export type OrderItemFormData = z.infer<typeof orderItemSchema>
export type BaseOrderFormData = z.infer<typeof baseOrderSchema>
export type PrescriptionOrderFormData = z.infer<typeof prescriptionOrderSchema>
export type OnlineOrderFormData = z.infer<typeof onlineOrderSchema>
export type InStoreOrderFormData = z.infer<typeof inStoreOrderSchema>
export type OrderFormData = z.infer<typeof orderSchema>

// Re-export API types to avoid conflicts
export type { Order, OrderItem } from '@/lib/types'
export type OrderStatusTransition = z.infer<typeof orderStatusTransitionSchema>
export type OrderFilter = z.infer<typeof orderFilterSchema>
export type CartItem = z.infer<typeof cartItemSchema>
export type Cart = z.infer<typeof cartSchema>
export type VipDiscount = z.infer<typeof vipDiscountSchema>
export type BulkOrder = z.infer<typeof bulkOrderSchema>
export type PrescriptionValidation = z.infer<typeof prescriptionValidationSchema>

// Validation utility functions
export const validateOrderByType = (orderData: any) => {
  try {
    return orderSchema.parse(orderData)
  } catch (error) {
    throw new Error(`Order validation failed: ${error}`)
  }
}

export const validateCartItems = (cartData: any) => {
  try {
    return cartSchema.parse(cartData)
  } catch (error) {
    throw new Error(`Cart validation failed: ${error}`)
  }
}

export const getOrderTypeDefaults = (orderType: string) => {
  const defaults = {
    order_type: orderType,
    notes: '',
    delivery_address: '',
    delivery_instructions: '',
    items: [],
  }

  switch (orderType) {
    case 'prescription':
      return {
        ...defaults,
        prescription: undefined,
        validated_by: undefined,
      }
    case 'online':
      return {
        ...defaults,
        delivery_address: '', // Will require user input
      }
    case 'in_store':
      return defaults
    default:
      return defaults
  }
}