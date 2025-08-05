import { z } from "zod"
import { nameSchema, priceSchema, textAreaSchema } from "./index"

// Base product validation schema - product_code auto-generated in form
const baseProductSchema = z.object({
  name: nameSchema,
  price: priceSchema,
  description: textAreaSchema,
  manufacturer: z
    .string()
    .max(100, "Manufacturer name must not exceed 100 characters")
    .optional(),
  product_code: z.string().min(1, "Product code is required"),
})

// Medicine-specific validation - API fields only
export const medicineFormSchema = baseProductSchema.extend({
  product_type: z.literal("medicine"),
  requires_prescription: z.boolean(),
  active_ingredient: z
    .string()
    .min(1, "Active ingredient is required")
    .max(200, "Active ingredient must not exceed 200 characters"),
  dosage_form: z.enum(["tablet", "capsule", "syrup", "injection", "cream", "drops"], {
    message: "Please select a valid dosage form",
  }),
  strength: z
    .string()
    .min(1, "Strength is required")
    .max(50, "Strength must not exceed 50 characters"),
  therapeutic_class: z
    .string()
    .min(1, "Therapeutic class is required")
    .max(100, "Therapeutic class must not exceed 100 characters"),
})

// Supplement-specific validation - API fields only
export const supplementFormSchema = baseProductSchema.extend({
  product_type: z.literal("supplement"),
  supplement_type: z
    .string()
    .min(1, "Supplement type is required")
    .max(50, "Supplement type must not exceed 50 characters"),
  ingredients: z
    .array(z.string().min(1, "Ingredient cannot be empty"))
    .min(1, "At least one ingredient is required")
    .max(20, "Cannot have more than 20 ingredients"),
  dosage_instructions: z
    .string()
    .max(500, "Dosage instructions must not exceed 500 characters")
    .optional(),
})

// Medical Device-specific validation - API fields only
export const medicalDeviceFormSchema = baseProductSchema.extend({
  product_type: z.literal("medical_device"),
  device_category: z
    .string()
    .min(1, "Device category is required")
    .max(100, "Device category must not exceed 100 characters"),
  warranty_period_months: z
    .number()
    .int("Warranty period must be a whole number")
    .min(0, "Warranty period cannot be negative")
    .max(120, "Warranty period cannot exceed 120 months")
    .optional(),
  requires_training: z.boolean().optional(),
})

// Union type for all product forms
export const productFormSchema = z.discriminatedUnion("product_type", [
  medicineFormSchema,
  supplementFormSchema,
  medicalDeviceFormSchema,
])

// Update schemas (partial)
export const updateMedicineSchema = medicineFormSchema.partial().extend({
  id: z.number().positive("Invalid product ID"),
})

export const updateSupplementSchema = supplementFormSchema.partial().extend({
  id: z.number().positive("Invalid product ID"),
})

export const updateMedicalDeviceSchema = medicalDeviceFormSchema.partial().extend({
  id: z.number().positive("Invalid product ID"),
})

// Factory schemas (exclude auto-generated fields)
export const createMedicineFactorySchema = medicineFormSchema.omit({ 
  product_type: true, 
  product_code: true 
})
export const createSupplementFactorySchema = supplementFormSchema.omit({ 
  product_type: true, 
  product_code: true 
})

// Type inference
export type MedicineFormInput = z.infer<typeof medicineFormSchema>
export type SupplementFormInput = z.infer<typeof supplementFormSchema>
export type MedicalDeviceFormInput = z.infer<typeof medicalDeviceFormSchema>
export type ProductFormInput = z.infer<typeof productFormSchema>

export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>
export type UpdateSupplementInput = z.infer<typeof updateSupplementSchema>
export type UpdateMedicalDeviceInput = z.infer<typeof updateMedicalDeviceSchema>

export type CreateMedicineFactoryInput = z.infer<typeof createMedicineFactorySchema>
export type CreateSupplementFactoryInput = z.infer<typeof createSupplementFactorySchema>

// Form validation messages
export const productValidationMessages = {
  name: {
    required: "Product name is required",
    min: "Product name must be at least 2 characters",
    max: "Product name must not exceed 100 characters",
  },
  price: {
    required: "Price is required",
    invalid: "Please enter a valid price (e.g., 10.99)",
  },
  product_code: {
    required: "Product code is required",
    max: "Product code must not exceed 50 characters",
  },
  active_ingredient: {
    required: "Active ingredient is required",
    max: "Active ingredient must not exceed 200 characters",
  },
  strength: {
    required: "Strength is required",
    max: "Strength must not exceed 50 characters",
  },
  ingredients: {
    required: "At least one ingredient is required",
    min: "At least one ingredient is required",
    max: "Cannot have more than 20 ingredients",
  },
  dosage_form: {
    required: "Please select a dosage form",
  },
  supplement_type: {
    required: "Supplement type is required",
  },
  device_category: {
    required: "Device category is required",
  },
  warranty_period_months: {
    invalid: "Please enter a valid warranty period in months",
  },
} as const