"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/forms"
import { 
  medicineFormSchema, 
  supplementFormSchema, 
  medicalDeviceFormSchema,
  type MedicineFormInput,
  type SupplementFormInput,
  type MedicalDeviceFormInput,
  type ProductFormInput
} from "@/lib/validations/product"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TextField, TextAreaField, SelectField, ArrayField, CheckboxField } from "@/components/forms"
import { Product } from "@/lib/types"

// Auto-generate product codes
const generateProductCode = (productType: string) => {
  const prefix = productType.toUpperCase().substring(0, 3)
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

interface ProductFormProps {
  // Form data and state
  product?: Product | null // If editing existing product
  useFactoryPattern?: boolean
  onFactoryPatternChange?: (enabled: boolean) => void
  
  // Factory pattern availability
  canCreateMedicineViaFactory?: boolean
  canCreateSupplementViaFactory?: boolean
  
  // Form submission handlers
  onSubmit: (data: ProductFormInput) => void
  onCancel: () => void
  
  // Loading states
  isSubmitting?: boolean
}

export function ProductForm({
  product = null,
  useFactoryPattern = false,
  onFactoryPatternChange,
  canCreateMedicineViaFactory = false,
  canCreateSupplementViaFactory = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const isEditing = !!product
  
  // Determine the product type for the form
  const productType = product?.product_type || "medicine"
  
  // Get the appropriate schema based on product type
  const getSchema = () => {
    switch (productType) {
      case "medicine":
        return medicineFormSchema
      case "supplement":
        return supplementFormSchema
      case "medical_device":
        return medicalDeviceFormSchema
      default:
        return medicineFormSchema
    }
  }
  
  // Set up form with appropriate defaults - only API-valid fields
  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: isEditing ? {
      // Base product fields only
      name: product?.name || "",
      price: product?.price || "",
      description: product?.description || "",
      manufacturer: product?.manufacturer || "",
      product_code: (product as any)?.product_code || "",
      product_type: product?.product_type || "medicine",
      
      // Medicine-specific fields - API fields only
      ...(product?.product_type === "medicine" && {
        requires_prescription: product?.requires_prescription || false,
        active_ingredient: (product as any)?.active_ingredient || "",
        dosage_form: (product as any)?.dosage_form || "tablet",
        strength: (product as any)?.strength || "",
        therapeutic_class: (product as any)?.therapeutic_class || "",
      }),
      
      // Supplement-specific fields - API fields only
      ...(product?.product_type === "supplement" && {
        supplement_type: (product as any)?.supplement_type || "",
        ingredients: (product as any)?.ingredients || [],
        dosage_instructions: (product as any)?.dosage_instructions || "",
      }),
      
      // Medical Device-specific fields - API fields only
      ...(product?.product_type === "medical_device" && {
        device_category: (product as any)?.device_category || "",
        warranty_period_months: (product as any)?.warranty_period_months || undefined,
        requires_training: (product as any)?.requires_training || false,
      }),
    } : {
      // Create mode defaults - API fields only  
      name: "",
      price: "",
      description: "",
      manufacturer: "",
      product_code: generateProductCode("medicine"),
      product_type: "medicine" as const,
      
      // Medicine defaults
      requires_prescription: false,
      active_ingredient: "",
      dosage_form: "tablet" as const,
      strength: "",
      therapeutic_class: "",
      
      // Supplement defaults  
      supplement_type: "",
      ingredients: [],
      dosage_instructions: "",
      
      // Medical Device defaults
      device_category: "",
      warranty_period_months: undefined,
      requires_training: false,
    }
  })
  
  // Watch the product type field for conditional rendering
  const selectedProductType = form.watch("product_type")
  
  // Update product code when product type changes (only in create mode)
  React.useEffect(() => {
    if (!isEditing && selectedProductType) {
      form.setValue("product_code", generateProductCode(selectedProductType))
    }
  }, [selectedProductType, isEditing, form])
  
  // Determine if factory pattern is available for current type
  const isFactoryAvailable = !isEditing && (
    (selectedProductType === "medicine" && canCreateMedicineViaFactory) ||
    (selectedProductType === "supplement" && canCreateSupplementViaFactory)
  )
  
  const handleSubmit = (data: any) => {
    onSubmit(data)
  }
  
  // Option arrays for select fields
  const productTypeOptions = [
    { value: "medicine", label: "Medicine" },
    { value: "supplement", label: "Health Supplement" },
    { value: "medical_device", label: "Medical Device" },
  ]
  
  const dosageFormOptions = [
    { value: "tablet", label: "Tablet" },
    { value: "capsule", label: "Capsule" },
    { value: "syrup", label: "Syrup" },
    { value: "injection", label: "Injection" },
    { value: "cream", label: "Cream" },
    { value: "drops", label: "Drops" },
  ]
  
  const supplementTypeOptions = [
    { value: "vitamin", label: "Vitamin" },
    { value: "mineral", label: "Mineral" },
    { value: "herbal", label: "Herbal" },
    { value: "protein", label: "Protein" },
    { value: "probiotic", label: "Probiotic" },
    { value: "other", label: "Other" },
  ]
  
  const deviceTypeOptions = [
    { value: "diagnostic", label: "Diagnostic" },
    { value: "therapeutic", label: "Therapeutic" },
    { value: "surgical", label: "Surgical" },
    { value: "monitoring", label: "Monitoring" },
    { value: "mobility", label: "Mobility" },
    { value: "other", label: "Other" },
  ]
  
  const deviceClassOptions = [
    { value: "I", label: "Class I" },
    { value: "II", label: "Class II" },
    { value: "III", label: "Class III" },
  ]
  
  const drugScheduleOptions = [
    { value: "I", label: "Schedule I" },
    { value: "II", label: "Schedule II" },
    { value: "III", label: "Schedule III" },
    { value: "IV", label: "Schedule IV" },
    { value: "V", label: "Schedule V" },
    { value: "OTC", label: "Over-the-Counter" },
  ]
  
  const ageGroupOptions = [
    { value: "adult", label: "Adult" },
    { value: "child", label: "Child" },
    { value: "senior", label: "Senior" },
    { value: "all", label: "All Ages" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Basic Product Information */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="name"
            label="Product Name"
            placeholder="Enter product name"
          />
          {!isEditing && (
            <SelectField
              control={form.control}
              name="product_type"
              label="Product Type"
              placeholder="Select product type"
              options={productTypeOptions}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="price"
            label="Price (₫)"
            type="number"
            placeholder="Enter price"
          />
          <TextField
            control={form.control}
            name="manufacturer"
            label="Manufacturer"
            placeholder="Enter manufacturer"
          />
        </div>


        <div className="grid grid-cols-1 gap-4">
          <TextAreaField
            control={form.control}
            name="description"
            label="Description"
            placeholder="Enter product description"
          />
        </div>

        {/* Medicine-specific fields - API fields only */}
        {selectedProductType === "medicine" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Medicine Information</h3>
              
              <CheckboxField
                control={form.control}
                name="requires_prescription"
                label="Requires Prescription"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="active_ingredient"
                  label="Active Ingredient"
                  placeholder="Enter active ingredient"
                />
                <TextField
                  control={form.control}
                  name="strength"
                  label="Strength"
                  placeholder="e.g., 500mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="dosage_form"
                  label="Dosage Form"
                  placeholder="Select dosage form"
                  options={dosageFormOptions}
                />
                <TextField
                  control={form.control}
                  name="therapeutic_class"
                  label="Therapeutic Class"
                  placeholder="Enter therapeutic class"
                />
              </div>
            </div>
          </>
        )}

        {/* Supplement-specific fields - API fields only */}
        {selectedProductType === "supplement" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Supplement Information</h3>
              
              <TextField
                control={form.control}
                name="supplement_type"
                label="Supplement Type"
                placeholder="Enter supplement type"
              />

              <ArrayField
                control={form.control}
                name="ingredients"
                label="Ingredients"
                itemPlaceholder="Enter ingredient"
                maxItems={20}
                description="Add up to 20 ingredients"
              />

              <TextAreaField
                control={form.control}
                name="dosage_instructions"
                label="Dosage Instructions (Optional)"
                placeholder="Enter dosage instructions"
                rows={2}
              />
            </div>
          </>
        )}

        {/* Medical Device-specific fields - API fields only */}
        {selectedProductType === "medical_device" && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Medical Device Information</h3>
              
              <TextField
                control={form.control}
                name="device_category"
                label="Device Category"
                placeholder="Enter device category"
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="warranty_period_months"
                  label="Warranty Period (Months)"
                  type="number"
                  placeholder="Enter warranty period in months"
                />
                <CheckboxField
                  control={form.control}
                  name="requires_training"
                  label="Requires Training"
                />
              </div>
            </div>
          </>
        )}

        {/* Factory Pattern Toggle - Only show for create mode when available */}
        {isFactoryAvailable && onFactoryPatternChange && (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="product-factory-toggle" className="text-sm font-medium text-gray-900">
                  Use Factory Pattern
                </Label>
                <p className="text-xs text-gray-500">
                  Create this {selectedProductType} using the Factory Pattern with enhanced defaults and validation
                </p>
              </div>
              <Switch
                id="product-factory-toggle"
                checked={useFactoryPattern}
                onCheckedChange={onFactoryPatternChange}
              />
            </div>
            {useFactoryPattern && (
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                ✨ Factory Pattern enabled - Enhanced creation with built-in optimizations
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
            {isEditing ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </Form>
  )
}