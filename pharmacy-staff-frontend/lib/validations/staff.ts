import { z } from "zod"
import { emailSchema, phoneSchema, nameSchema } from "./common"

// Staff role validation
export const staffRoleSchema = z.enum(["pharmacist", "technician", "manager", "cashier", "inventory_manager"], {
  message: "Please select a valid staff role",
})

// Single staff validation schema - all fields are optional except the base ones
export const staffFormSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  employee_id: z.string().min(1, "Employee ID is required"),
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: staffRoleSchema,
  branch: z
    .union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine((val) => val > 0, "Please select a valid branch"),
  hire_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  // Optional fields that exist in database but may be null
  license_number: z.string().optional(),
  specialization: z.string().optional(),
  certification_level: z.string().optional(),
  supervised_by: z
    .union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? parseInt(val, 10) : val)
    .optional(),
})

// Update schema
export const updateStaffSchema = staffFormSchema.partial().extend({
  id: z.number().positive("Invalid staff ID"),
})

// Factory schema (exclude auto-generated fields)
export const createStaffFactorySchema = staffFormSchema.omit({
  user_id: true,
  employee_id: true,
  role: true,
})

// Type inference
export type StaffFormInput = z.infer<typeof staffFormSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>
export type CreateStaffFactoryInput = z.infer<typeof createStaffFactorySchema>

// Form validation messages
export const staffValidationMessages = {
  user_id: {
    required: "User ID is required",
  },
  employee_id: {
    required: "Employee ID is required",
  },
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
    required: "Please select a staff role",
    invalid: "Please select a valid staff role",
  },
  branch: {
    required: "Please select a branch",
    invalid: "Please select a valid branch",
  },
  hire_date: {
    required: "Hire date is required",
    invalid: "Please enter a valid hire date",
  },
  license_number: {
    required: "License number is required",
    max: "License number must not exceed 50 characters",
  },
  specialization: {
    required: "Specialization is required",
    max: "Specialization must not exceed 100 characters",
  },
  certification_level: {
    required: "Certification level is required",
    max: "Certification level must not exceed 20 characters",
  },
  supervised_by: {
    required: "Please select a supervising pharmacist",
    invalid: "Please select a valid supervising pharmacist",
  },
  department: {
    required: "Department assignment is required",
    max: "Department name must not exceed 50 characters",
  },
} as const