"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { TextField, TextAreaField, SelectField } from "@/components/forms/FormField"
import { zodResolver } from "@/lib/forms"
import {
  warehouseCreateSchema,
  warehouseEditSchema,
  type WarehouseCreateData,
  type WarehouseEditData,
  type Warehouse,
} from "@/lib/validations/warehouse"

interface WarehouseFormProps {
  warehouse?: Warehouse | null
  onSubmit: (data: WarehouseCreateData | WarehouseEditData) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function WarehouseForm({
  warehouse,
  onSubmit,
  onCancel,
  isSubmitting,
}: WarehouseFormProps) {
  const isEditing = Boolean(warehouse)
  const schema = isEditing ? warehouseEditSchema : warehouseCreateSchema

  const form = useForm<WarehouseCreateData | WarehouseEditData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: warehouse?.name || "",
      address: warehouse?.address || "",
      capacity: warehouse?.capacity || 1000,
      manager: warehouse?.manager || undefined,
      ...(isEditing && warehouse ? { id: warehouse.id } : {}),
    },
  })

  const handleSubmit = (data: WarehouseCreateData | WarehouseEditData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Warehouse Information</h3>
          
          <TextField
            control={form.control}
            name="name"
            label="Warehouse Name"
            placeholder="e.g., Long Chau Central Warehouse - HCM"
          />

          <TextAreaField
            control={form.control}
            name="address"
            label="Address"
            placeholder="Enter warehouse address with district and city"
            rows={3}
          />

          <TextField
            control={form.control}
            name="capacity"
            label="Storage Capacity"
            placeholder="Maximum storage capacity in units"
            type="number"
            description="Total storage capacity for all products in units"
          />
        </div>

        {/* Optional Manager Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Management (Optional)</h3>
          
          <TextField
            control={form.control}
            name="manager"
            label="Manager User ID"
            placeholder="Enter manager user ID (optional)"
            type="number"
            description="Leave empty if no manager assigned yet"
          />
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Warehouse Guidelines</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Name:</strong> Use clear, location-specific names (e.g., "Long Chau Central Warehouse - HCM")</div>
            <div><strong>Address:</strong> Include full address with district/city for delivery logistics</div>
            <div><strong>Capacity:</strong> Set realistic storage limits based on physical space (minimum 1,000 units)</div>
            <div><strong>Manager:</strong> Can be assigned later - use User ID from staff management</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              isEditing ? "Updating..." : "Creating..."
            ) : (
              isEditing ? "Update Warehouse" : "Create Warehouse"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}