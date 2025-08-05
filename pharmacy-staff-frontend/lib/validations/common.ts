import { z } from "zod"

// Common validation patterns - moved to separate file to avoid circular dependencies
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, "Please enter a valid phone number")

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")

export const priceSchema = z
  .string()
  .min(1, "Price is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price (e.g., 10.99)")

export const dateSchema = z
  .string()
  .min(1, "Date is required")
  .refine((date) => !isNaN(Date.parse(date)), "Please enter a valid date")

export const optionalDateSchema = z
  .string()
  .optional()
  .refine(
    (date) => !date || !isNaN(Date.parse(date)),
    "Please enter a valid date"
  )

// Quantity validation for numbers
export const quantitySchema = z
  .number()
  .min(0, "Quantity cannot be negative")
  .int("Quantity must be a whole number")

// Stock level validation
export const stockLevelSchema = z
  .number()
  .min(0, "Stock level cannot be negative")
  .int("Stock level must be a whole number")

// ID validation
export const idSchema = z
  .number()
  .positive("Please select a valid option")

// Text area validation
export const textAreaSchema = z
  .string()
  .max(1000, "Text must not exceed 1000 characters")
  .optional()

// Required text area
export const requiredTextAreaSchema = z
  .string()
  .min(1, "This field is required")
  .max(1000, "Text must not exceed 1000 characters")

// Positive number validation
export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number")

// Currency validation
export const currencySchema = z
  .string()
  .min(1, "Price is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price (e.g., 10.99)")