"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/forms"
import { createCustomerSchema, createCustomerFactorySchema, updateCustomerSchema, type CreateCustomerInput, type UpdateCustomerInput, type CreateCustomerFactoryInput } from "@/lib/validations/customer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TextField, TextAreaField, SelectField } from "@/components/forms"
import { User } from "@/lib/types"

// Auto-generate customer IDs
const generateCustomerId = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CUST-${timestamp}-${random}`
}

interface CustomerFormProps {
  // Form data and state
  customer?: User | null // If editing existing customer
  useFactoryPattern?: boolean
  onFactoryPatternChange?: (enabled: boolean) => void
  
  // Factory pattern availability
  canCreateCustomerViaFactory?: boolean
  canCreateVipCustomerViaFactory?: boolean
  
  // Form submission handlers
  onSubmit: (data: CreateCustomerInput | UpdateCustomerInput | CreateCustomerFactoryInput) => void
  onCancel: () => void
  
  // Loading states
  isSubmitting?: boolean
}

export function CustomerForm({
  customer = null,
  useFactoryPattern = false,
  onFactoryPatternChange,
  canCreateCustomerViaFactory = false,
  canCreateVipCustomerViaFactory = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomerFormProps) {
  const isEditing = !!customer
  
  // Determine which schema to use based on mode and factory pattern
  const getSchema = () => {
    if (isEditing) return updateCustomerSchema
    if (useFactoryPattern) return createCustomerFactorySchema
    return createCustomerSchema
  }
  
  // Set up form with appropriate defaults - IDs auto-generated for create mode
  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: isEditing ? {
      user_id: customer?.user_id || "",
      customer_id: customer?.customer_id || "",
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      role: (customer?.role as "customer" | "vip_customer") || "customer",
      branch: customer?.branch || 1,
      address: customer?.address || "",
      date_of_birth: customer?.date_of_birth || "",
    } : {
      user_id: !useFactoryPattern ? generateCustomerId() : "",
      customer_id: !useFactoryPattern ? generateCustomerId() : "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "customer" as const,
      branch: 1,
      address: "",
      date_of_birth: "",
    }
  })
  
  // Watch the role field for factory pattern logic
  const selectedRole = form.watch("role")
  
  // Determine if factory pattern is available for current role
  const isFactoryAvailable = !isEditing && (
    (selectedRole === "customer" && canCreateCustomerViaFactory) ||
    (selectedRole === "vip_customer" && canCreateVipCustomerViaFactory)
  )
  
  const handleSubmit = (data: any) => {
    onSubmit(data)
  }
  
  const customerTypeOptions = [
    { value: "customer", label: "Regular Customer" },
    { value: "vip_customer", label: "VIP Customer" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="first_name"
            label="First Name"
            placeholder="Enter first name"
          />
          <TextField
            control={form.control}
            name="last_name"
            label="Last Name"
            placeholder="Enter last name"
          />
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email address"
          />
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            type="tel"
            placeholder="Enter phone number"
          />
        </div>

        {/* Role and Branch */}
        <div className="grid grid-cols-2 gap-4">
          {!useFactoryPattern && (
            <SelectField
              control={form.control}
              name="role"
              label="Customer Type"
              placeholder="Select customer type"
              options={customerTypeOptions}
            />
          )}
          <SelectField
            control={form.control}
            name="branch"
            label="Branch"
            placeholder="Select branch"
            options={[
              { value: "1", label: "Branch 1" },
              { value: "2", label: "Branch 2" },
              { value: "3", label: "Branch 3" },
            ]}
          />
        </div>

        {/* Date of Birth */}
        <TextField
          control={form.control}
          name="date_of_birth"
          label="Date of Birth"
          type="date"
        />

        {/* Factory Pattern Toggle - Only show for create mode when available */}
        {isFactoryAvailable && onFactoryPatternChange && (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="customer-factory-toggle" className="text-sm font-medium text-gray-900">
                  Use Factory Pattern
                </Label>
                <p className="text-xs text-gray-500">
                  Create this {selectedRole === 'vip_customer' ? 'VIP customer' : 'customer'} using the Factory Pattern with enhanced defaults and automatic benefits
                </p>
              </div>
              <Switch
                id="customer-factory-toggle"
                checked={useFactoryPattern}
                onCheckedChange={onFactoryPatternChange}
              />
            </div>
            {useFactoryPattern && (
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                ✨ Factory Pattern enabled - {selectedRole === 'vip_customer' ? 'VIP benefits and enhanced features' : 'Enhanced customer creation with optimizations'}
              </div>
            )}
          </div>
        )}

        {/* Address Field */}
        <TextField
          control={form.control}
          name="address"
          label="Address (Optional)"
          placeholder="Enter customer address"
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Update' : 'Create'} Customer
          </Button>
        </div>
      </form>
    </Form>
  )
}