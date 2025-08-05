"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/forms"
import { branchCreateSchema, branchEditSchema, validateBranchForApi, branchValidationPatterns, type BranchCreateData, type BranchEditData } from "@/lib/validations/branch"
import type { Branch } from "@/lib/types"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField, TextAreaField, SelectField } from "@/components/forms"

interface BranchFormProps {
  // Form data and state
  branch?: Branch | null // If editing existing branch
  
  // Form submission handlers  
  onSubmit: (data: BranchCreateData | BranchEditData) => void
  onCancel: () => void
  
  // Loading states
  isSubmitting?: boolean
}

export function BranchForm({
  branch = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BranchFormProps) {
  const isEditing = !!branch
  
  // Determine which schema to use based on mode
  const getSchema = () => {
    return isEditing ? branchEditSchema : branchCreateSchema
  }
  
  // Set up form with appropriate defaults
  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: isEditing ? {
      name: branch?.name || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      email: branch?.email || "",
      manager_name: branch?.manager_name || "",
      status: branch?.status || "active",
      opening_hours: branch?.opening_hours || "",
      notes: branch?.notes || "",
    } : {
      name: "",
      address: "",
      phone: "",
      email: "",
      manager_name: "",
      status: "active" as const,
      opening_hours: "",
      notes: "",
    }
  })

  const handleSubmit = (data: any) => {
    const cleanedData = validateBranchForApi(data)
    onSubmit(cleanedData)
  }

  const statusOptions = branchValidationPatterns.statusOptions.map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  }))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Branch Name and Status */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="name"
            label="Branch Name"
            placeholder="Long Chau - District Name"
          />
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            placeholder="Select status"
            options={statusOptions}
          />
        </div>

        {/* Address */}
        <TextField
          control={form.control}
          name="address"
          label="Address"
          placeholder="Street address, District, City"
        />

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="+84-28-3822-xxxx"
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="branch@longchau.com.vn"
          />
        </div>

        {/* Management Information */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="manager_name"
            label="Manager Name"
            placeholder="Full name of branch manager"
          />
          <TextField
            control={form.control}
            name="opening_hours"
            label="Opening Hours"
            placeholder="7:00 AM - 10:00 PM"
          />
        </div>

        {/* Notes */}
        <TextAreaField
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Any special notes about this branch..."
          rows={3}
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
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isEditing ? "Updating..." : "Creating..."
            ) : (
              isEditing ? "Update Branch" : "Create Branch"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

