import { z } from "zod"
import { nameSchema, positiveNumberSchema } from "./common"

// Base warehouse validation schema
export const warehouseBaseSchema = z.object({
  name: nameSchema.min(3, "Warehouse name must be at least 3 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  capacity: positiveNumberSchema.min(1000, "Capacity must be at least 1,000 units"),
  manager: z.number().optional(), // User ID reference
})

// Schema for creating new warehouse
export const warehouseCreateSchema = warehouseBaseSchema

// Schema for editing existing warehouse
export const warehouseEditSchema = warehouseBaseSchema.extend({
  id: z.number(),
})

// Type exports for use in components
export type WarehouseCreateData = z.infer<typeof warehouseCreateSchema>
export type WarehouseEditData = z.infer<typeof warehouseEditSchema>

// Computed fields schema (read-only data from API)
export const warehouseSchema = warehouseEditSchema.extend({
  total_stock: z.number().default(0),
  utilization_percentage: z.number().default(0),
  manager_name: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Warehouse = z.infer<typeof warehouseSchema>