import { zodResolver } from "@hookform/resolvers/zod"
import { UseFormProps, useForm } from "react-hook-form"
import { z, ZodSchema } from "zod"

// Generic form hook that combines react-hook-form with zod validation
export function useZodForm<TSchema extends ZodSchema>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  })
}

// Form submission handler type
export type FormSubmitHandler<T> = (data: T) => void | Promise<void>

// Form error display utilities
export function getFieldError(
  errors: Record<string, any>,
  fieldName: string
): string | undefined {
  const fieldError = errors[fieldName]
  if (!fieldError) return undefined
  
  if (typeof fieldError.message === 'string') {
    return fieldError.message
  }
  
  return "This field has an error"
}

// Check if form has any errors
export function hasFormErrors(errors: Record<string, any>): boolean {
  return Object.keys(errors).length > 0
}

// Get all error messages as array
export function getAllErrorMessages(errors: Record<string, any>): string[] {
  return Object.values(errors)
    .map((error: any) => error?.message)
    .filter((message): message is string => typeof message === 'string')
}