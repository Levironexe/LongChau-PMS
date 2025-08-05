"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/forms"
import { 
  staffFormSchema,
  createStaffFactorySchema,
  type StaffFormInput,
  type CreateStaffFactoryInput
} from "@/lib/validations/staff"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TextField, SelectField } from "@/components/forms"
import { User } from "@/lib/types"

// Auto-generate staff IDs
const generateStaffId = (role: string) => {
  const prefix = role.toUpperCase().substring(0, 3)
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

interface StaffFormProps {
  // Form data and state
  staff?: User | null // If editing existing staff member
  useFactoryPattern?: boolean
  onFactoryPatternChange?: (enabled: boolean) => void
  
  // Factory pattern availability
  canCreatePharmacistViaFactory?: boolean
  canCreateTechnicianViaFactory?: boolean
  canCreateManagerViaFactory?: boolean
  canCreateCashierViaFactory?: boolean
  canCreateInventoryManagerViaFactory?: boolean
  
  // Available pharmacists for supervision (for technicians)
  availablePharmacists?: User[]
  
  // Form submission handlers
  onSubmit: (data: StaffFormInput | CreateStaffFactoryInput) => void
  onCancel: () => void
  
  // Loading states
  isSubmitting?: boolean
}

export function StaffForm({
  staff = null,
  useFactoryPattern = false,
  onFactoryPatternChange,
  canCreatePharmacistViaFactory = false,
  canCreateTechnicianViaFactory = false,
  canCreateManagerViaFactory = false,
  canCreateCashierViaFactory = false,
  canCreateInventoryManagerViaFactory = false,
  availablePharmacists = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StaffFormProps) {
  const isEditing = !!staff
  
  // Determine the staff role for the form - use initial role for editing, default for creating
  const initialRole = staff?.role || "pharmacist"
  
  // Get the appropriate schema based on factory pattern
  const getSchema = React.useCallback(() => {
    if (useFactoryPattern) {
      return createStaffFactorySchema
    }
    return staffFormSchema
  }, [useFactoryPattern])
  
  // Set up form with appropriate defaults
  const getDefaultValues = () => {
    if (isEditing) {
      return {
        user_id: staff?.user_id || "",
        employee_id: staff?.employee_id || "",
        first_name: staff?.first_name || "",
        last_name: staff?.last_name || "",
        email: staff?.email || "",
        phone: staff?.phone || "",
        role: (staff?.role as "pharmacist" | "technician" | "manager" | "cashier" | "inventory_manager") || "pharmacist",
        branch: staff?.branch || 1,
        hire_date: staff?.hire_date || "",
        license_number: (staff as any)?.license_number || "",
        specialization: (staff as any)?.specialization || "",
        certification_level: (staff as any)?.certification_level || "",
        supervised_by: (staff as any)?.supervised_by || undefined,
      }
    }
    
    if (useFactoryPattern) {
      return {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        branch: 1,
        hire_date: new Date().toISOString().split('T')[0],
        license_number: "",
        specialization: "",
        certification_level: "",
        supervised_by: undefined,
      }
    }
    
    return {
      user_id: generateStaffId("pharmacist"),
      employee_id: generateStaffId("pharmacist"),
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "pharmacist" as const,
      branch: 1,
      hire_date: new Date().toISOString().split('T')[0],
      license_number: "",
      specialization: "",
      certification_level: "",
      supervised_by: undefined,
    }
  }
  
  const form = useForm({
    resolver: zodResolver(getSchema()) as any,
    defaultValues: getDefaultValues() as any,
  })
  
  // Watch the role field for conditional rendering and ID generation
  const selectedRole = form.watch("role")
  
  // Update IDs when role changes (only in create mode)
  React.useEffect(() => {
    if (!isEditing && !useFactoryPattern && selectedRole) {
      form.setValue("user_id", generateStaffId(selectedRole))
      form.setValue("employee_id", generateStaffId(selectedRole))
    }
  }, [selectedRole, isEditing, useFactoryPattern, form])
  
  // Update form resolver when factory pattern changes
  React.useEffect(() => {
    const newSchema = getSchema()
    const currentValues = form.getValues()
    form.reset(currentValues, {
      resolver: zodResolver(newSchema),
      keepDirty: true,
      keepTouched: true,
    } as any)
  }, [useFactoryPattern, form, getSchema])
  
  // Determine if factory pattern is available for current role
  const isFactoryAvailable = !isEditing && (
    (selectedRole === "pharmacist" && canCreatePharmacistViaFactory) ||
    (selectedRole === "technician" && canCreateTechnicianViaFactory) ||
    (selectedRole === "manager" && canCreateManagerViaFactory) ||
    (selectedRole === "cashier" && canCreateCashierViaFactory) ||
    (selectedRole === "inventory_manager" && canCreateInventoryManagerViaFactory)
  )
  
  const handleSubmit = (data: any) => {
    onSubmit(data)
  }
  
  const staffRoleOptions = [
    { value: "pharmacist", label: "Pharmacist" },
    { value: "technician", label: "Pharmacy Technician" },
    { value: "manager", label: "Store Manager" },
    { value: "cashier", label: "Cashier" },
    { value: "inventory_manager", label: "Inventory Manager" },
  ]

  const branchOptions = [
    { value: "1", label: "Branch 1" },
    { value: "2", label: "Branch 2" },
    { value: "3", label: "Branch 3" },
    { value: "4", label: "Branch 4" },
    { value: "5", label: "Branch 5" },
  ]

  const certificationLevelOptions = [
    { value: "Level 1", label: "Level 1" },
    { value: "Level 2", label: "Level 2" },
    { value: "Level 3", label: "Level 3" },
  ]

  const pharmacistOptions = availablePharmacists.map(pharmacist => ({
    value: pharmacist.id.toString(),
    label: pharmacist.display_name || `${pharmacist.first_name} ${pharmacist.last_name}`,
  }))


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
          {!isEditing && !useFactoryPattern && (
            <SelectField
              control={form.control}
              name="role"
              label="Staff Role"
              placeholder="Select staff role"
              options={staffRoleOptions}
            />
          )}
          <SelectField
            control={form.control}
            name="branch"
            label="Branch"
            placeholder="Select branch"
            options={branchOptions}
          />
        </div>

        {/* Hire Date */}
        <TextField
          control={form.control}
          name="hire_date"
          label="Hire Date"
          type="date"
        />

        {/* Pharmacist-specific fields */}
        {selectedRole === "pharmacist" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Pharmacist Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="license_number"
                  label="License Number"
                  placeholder="Enter license number"
                />
                <TextField
                  control={form.control}
                  name="specialization"
                  label="Specialization"
                  placeholder="Enter specialization"
                />
              </div>
            </div>
          </>
        )}

        {/* Technician-specific fields */}
        {selectedRole === "technician" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Technician Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="certification_level"
                  label="Certification Level"
                  placeholder="Select certification level"
                  options={certificationLevelOptions}
                />
                {pharmacistOptions.length > 0 && (
                  <SelectField
                    control={form.control}
                    name="supervised_by"
                    label="Supervising Pharmacist"
                    placeholder="Select supervising pharmacist"
                    options={pharmacistOptions}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Manager-specific section (no additional fields) */}
        {selectedRole === "manager" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Manager Information</h3>
              <p className="text-sm text-muted-foreground">
                Branch managers have administrative privileges for their assigned branch.
              </p>
            </div>
          </>
        )}

        {/* Cashier-specific section (no additional fields) */}
        {selectedRole === "cashier" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Cashier Information</h3>
              <p className="text-sm text-muted-foreground">
                Cashiers handle sales transactions and customer payments.
              </p>
            </div>
          </>
        )}

        {/* Inventory Manager-specific section (no additional fields) */}
        {selectedRole === "inventory_manager" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Inventory Manager Information</h3>
              <p className="text-sm text-muted-foreground">
                Inventory managers have permissions to manage stock levels and inventory transfers.
              </p>
            </div>
          </>
        )}

        {/* Factory Pattern Toggle - Only show for create mode when available */}
        {isFactoryAvailable && onFactoryPatternChange && (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="staff-factory-toggle" className="text-sm font-medium text-gray-900">
                  Use Factory Pattern
                </Label>
                <p className="text-xs text-gray-500">
                  Create this {selectedRole} using the Factory Pattern with enhanced defaults and automatic setup
                </p>
              </div>
              <Switch
                id="staff-factory-toggle"
                checked={useFactoryPattern}
                onCheckedChange={onFactoryPatternChange}
              />
            </div>
            {useFactoryPattern && (
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                ✨ Factory Pattern enabled - Enhanced {selectedRole} creation with built-in optimizations
              </div>
            )}
          </div>
        )}

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
            {isEditing ? 'Update' : 'Create'} Staff Member
          </Button>
        </div>
      </form>
    </Form>
  )
}