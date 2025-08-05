import { z } from "zod"
import { positiveNumberSchema } from "./common"

// Transfer status enum
export const transferStatusSchema = z.enum([
  "REQUESTED", 
  "PENDING", 
  "APPROVED", 
  "IN_TRANSIT", 
  "COMPLETED", 
  "CANCELLED"
])

// Base transfer request validation schema - handles form string inputs
export const transferRequestBaseSchema = z.object({
  source_warehouse: z.union([
    z.string().min(1, "Please select a source warehouse").transform(Number),
    z.number().min(1, "Please select a source warehouse")
  ]),
  destination_branch: z.union([
    z.string().min(1, "Please select a destination branch").transform(Number),
    z.number().min(1, "Please select a destination branch")
  ]),
  product: z.union([
    z.string().min(1, "Please select a product").transform(Number),
    z.number().min(1, "Please select a product")
  ]),
  quantity: z.union([
    z.string().min(1, "Please enter quantity").transform(Number),
    z.number().min(1, "Quantity must be at least 1")
  ]).refine(val => val >= 1, "Quantity must be at least 1"),
  requested_by: z.union([
    z.string().min(1, "Please select who is requesting this transfer").transform(Number),
    z.number().min(1, "Please select who is requesting this transfer")
  ]),
  notes: z.string().optional(),
  transfer_number: z.string().optional(),
})

// Schema for creating new transfer request
export const transferRequestCreateSchema = transferRequestBaseSchema

// Schema for transfer approval
export const transferApprovalSchema = z.object({
  transfer_id: z.number().min(1, "Invalid transfer ID"),
  approved_by_id: z.number().min(1, "Approver must be specified"),
  approval_notes: z.string().optional(),
})

// Schema for transfer completion
export const transferCompletionSchema = z.object({
  transfer_id: z.number().min(1, "Invalid transfer ID"),
  completion_notes: z.string().optional(),
})

// Form input type (before validation/transformation)
export interface TransferRequestFormData {
  source_warehouse: string | number
  destination_branch: string | number  
  product: string | number
  quantity: string | number
  requested_by: string | number
  notes?: string
  transfer_number?: string
}

// API output type (after validation/transformation)
export type TransferRequestCreateData = z.infer<typeof transferRequestCreateSchema>
export type TransferApprovalData = z.infer<typeof transferApprovalSchema>
export type TransferCompletionData = z.infer<typeof transferCompletionSchema>
export type TransferStatus = z.infer<typeof transferStatusSchema>

// Complete inventory transfer schema (read-only data from API)
export const inventoryTransferSchema = z.object({
  id: z.number(),
  source_warehouse_name: z.string(),
  destination_branch_name: z.string(),
  product_name: z.string(),
  product_code: z.string(),
  requested_by_name: z.string(),
  approved_by_name: z.string().optional(),
  can_be_approved: z.boolean().default(false),
  transfer_number: z.string(),
  status: transferStatusSchema,
  quantity: z.number(),
  unit_cost: z.string(),
  request_date: z.string(),
  approved_date: z.string().nullable(),
  shipped_date: z.string().nullable(),
  received_date: z.string().nullable(),
  notes: z.string().optional(),
  source_warehouse: z.number(),
  destination_branch: z.number(),
  product: z.number(),
  requested_by: z.number(),
  approved_by: z.number().nullable(),
})

export type InventoryTransfer = z.infer<typeof inventoryTransferSchema>