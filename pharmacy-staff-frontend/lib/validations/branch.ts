import { z } from "zod"

// Phone number validation pattern for Vietnamese phone numbers
const phonePattern = /^(\+84|84|0)[1-9][0-9]{8,9}$/

// Branch validation schema matching the API requirements
export const branchCreateSchema = z.object({
  // Required fields (as per API OPTIONS call)
  name: z.string()
    .min(1, "Branch name is required")
    .max(200, "Branch name must be 200 characters or less")
    .refine(
      name => name.trim().length > 0,
      "Branch name cannot be just whitespace"
    ),

  address: z.string()
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .refine(
      address => address.trim().length > 0,
      "Address cannot be just whitespace"
    ),

  phone: z.string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be 20 characters or less")
    .regex(
      phonePattern,
      "Please enter a valid Vietnamese phone number (e.g., +84-28-3822-1234)"
    ),

  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must be 254 characters or less")
    .toLowerCase(),

  // Optional fields
  manager_name: z.string()
    .max(100, "Manager name must be 100 characters or less")
    .optional()
    .or(z.literal("")),

  status: z.enum(["active", "inactive", "maintenance"])
    .default("active")
    .optional(),

  opening_hours: z.string()
    .max(100, "Opening hours must be 100 characters or less")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
})

// Schema for editing branches (allows all fields to be optional for partial updates)
export const branchEditSchema = z.object({
  name: z.string()
    .min(1, "Branch name is required")
    .max(200, "Branch name must be 200 characters or less")
    .refine(
      name => name.trim().length > 0,
      "Branch name cannot be just whitespace"
    )
    .optional(),

  address: z.string()
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .refine(
      address => address.trim().length > 0,
      "Address cannot be just whitespace"
    )
    .optional(),

  phone: z.string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be 20 characters or less")
    .regex(
      phonePattern,
      "Please enter a valid Vietnamese phone number (e.g., +84-28-3822-1234)"
    )
    .optional(),

  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must be 254 characters or less")
    .toLowerCase()
    .optional(),

  manager_name: z.string()
    .max(100, "Manager name must be 100 characters or less")
    .optional()
    .or(z.literal("")),

  status: z.enum(["active", "inactive", "maintenance"])
    .optional(),

  opening_hours: z.string()
    .max(100, "Opening hours must be 100 characters or less")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
})

// Configuration validation schema for branch settings
export const branchConfigSchema = z.object({
  branch: z.number()
    .int("Branch ID must be an integer")
    .positive("Branch ID must be positive"),

  setting_name: z.string()
    .min(1, "Setting name is required")
    .max(100, "Setting name must be 100 characters or less")
    .refine(
      name => name.trim().length > 0,
      "Setting name cannot be just whitespace"
    ),

  setting_type: z.enum(["string", "number", "boolean"], {
    message: "Setting type must be string, number, or boolean"
  }),

  setting_value: z.union([
    z.string().max(500, "String value must be 500 characters or less"),
    z.number(),
    z.boolean()
  ]),
})

// Type definitions
export type BranchCreateData = z.infer<typeof branchCreateSchema>
export type BranchEditData = z.infer<typeof branchEditSchema>
export type BranchConfigData = z.infer<typeof branchConfigSchema>

// Utility function to validate branch data before API submission
export const validateBranchForApi = (data: any) => {
  // Clean up empty strings to undefined for optional fields
  const cleanedData = {
    ...data,
    manager_name: data.manager_name?.trim() || undefined,
    opening_hours: data.opening_hours?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  }

  return cleanedData
}

// Common validation patterns for reuse
export const branchValidationPatterns = {
  phonePattern,
  statusOptions: ["active", "inactive", "maintenance"] as const,
  configTypeOptions: ["string", "number", "boolean"] as const,
}