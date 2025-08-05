import { z } from "zod"
import { emailSchema, phoneSchema, nameSchema, optionalDateSchema, textAreaSchema } from "./index"

// Customer role validation
export const customerRoleSchema = z.enum(["customer", "vip_customer"], {
  message: "Please select a valid customer type",
})

// Base customer validation schema for create operations - IDs auto-generated in form
export const createCustomerSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  customer_id: z.string().min(1, "Customer ID is required"),
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: customerRoleSchema,
  branch: z
    .union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine((val) => val > 0, "Please select a valid branch"),
  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
})

// Customer update schema - makes some fields optional for partial updates
export const updateCustomerSchema = createCustomerSchema.partial()

// Factory customer schema - excludes auto-generated fields
export const createCustomerFactorySchema = createCustomerSchema.omit({
  user_id: true,
  customer_id: true,
  role: true,
})

// VIP upgrade validation
export const vipUpgradeSchema = z.object({
  id: z.number().positive("Please select a valid customer"),
})

// Customer search filters schema
export const customerFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["all", "customer", "vip_customer"]).optional(),
  page: z.number().min(1).optional(),
  page_size: z.number().min(1).max(100).optional(),
})

// Infer TypeScript types from schemas
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreateCustomerFactoryInput = z.infer<typeof createCustomerFactorySchema>
export type VipUpgradeInput = z.infer<typeof vipUpgradeSchema>
export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>

// Form validation messages
export const customerValidationMessages = {
  first_name: {
    required: "First name is required",
    min: "First name must be at least 2 characters",
    max: "First name must not exceed 100 characters",
  },
  last_name: {
    required: "Last name is required", 
    min: "Last name must be at least 2 characters",
    max: "Last name must not exceed 100 characters",
  },
  email: {
    required: "Email address is required",
    invalid: "Please enter a valid email address",
  },
  phone: {
    required: "Phone number is required",
    invalid: "Please enter a valid phone number",
  },
  role: {
    required: "Please select a customer type",
    invalid: "Please select a valid customer type",
  },
  branch: {
    required: "Please select a branch",
    invalid: "Please select a valid branch",
  },
  address: {
    max: "Address must not exceed 200 characters",
  },
  date_of_birth: {
    invalid: "Please enter a valid date of birth",
  },
} as const