import { z } from "zod"
import { positiveNumberSchema, currencySchema } from "./common"

// Base warehouse inventory validation schema
export const warehouseInventoryBaseSchema = z.object({
  warehouse: z.number().min(1, "Please select a warehouse"),
  product: z.number().min(1, "Please select a product"),
  current_stock: positiveNumberSchema,
  minimum_stock: positiveNumberSchema,
  reorder_point: positiveNumberSchema,
  cost_price: currencySchema,
  supplier: z.string().optional(),
})

// Schema for creating new warehouse inventory entry
export const warehouseInventoryCreateSchema = warehouseInventoryBaseSchema.refine(
  (data) => data.reorder_point >= data.minimum_stock,
  {
    message: "Reorder point must be greater than or equal to minimum stock",
    path: ["reorder_point"],
  }
).refine(
  (data) => data.current_stock >= 0,
  {
    message: "Current stock cannot be negative",
    path: ["current_stock"],
  }
)

// Schema for editing existing warehouse inventory
export const warehouseInventoryEditSchema = warehouseInventoryCreateSchema.extend({
  id: z.number(),
})

// Schema for adding stock to warehouse inventory
export const addStockSchema = z.object({
  warehouse_inventory_id: z.number().min(1, "Invalid warehouse inventory entry"),
  quantity_added: positiveNumberSchema.min(1, "Quantity must be at least 1"),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})

// Type exports for use in components
export type WarehouseInventoryCreateData = z.infer<typeof warehouseInventoryCreateSchema>
export type WarehouseInventoryEditData = z.infer<typeof warehouseInventoryEditSchema>
export type AddStockData = z.infer<typeof addStockSchema>

// Complete warehouse inventory schema (read-only data from API)
export const warehouseInventorySchema = warehouseInventoryEditSchema.extend({
  warehouse_name: z.string(),
  product_name: z.string(),
  product_code: z.string(),
  is_low_stock: z.boolean().default(false),
  last_restocked: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type WarehouseInventory = z.infer<typeof warehouseInventorySchema>