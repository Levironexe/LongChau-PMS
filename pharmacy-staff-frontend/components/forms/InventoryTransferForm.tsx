"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { TextField, TextAreaField, SelectField } from "@/components/forms/FormField"
import { zodResolver } from "@/lib/forms"
import {
  transferRequestCreateSchema,
  type TransferRequestCreateData,
  type TransferRequestFormData,
} from "@/lib/validations/inventory-transfer"

interface InventoryTransferFormProps {
  onSubmit: (data: TransferRequestCreateData) => void
  onCancel: () => void
  isSubmitting: boolean
  warehouses?: Array<{ id: number; name: string }>
  branches?: Array<{ id: number; name: string }>
  products?: Array<{ id: number; name: string; product_code: string }>
  users?: Array<{ id: number; display_name?: string; role: string }>
  preSelectedWarehouse?: number
  preSelectedProduct?: number
}

export function InventoryTransferForm({
  onSubmit,
  onCancel,
  isSubmitting,
  warehouses = [],
  branches = [],
  products = [],
  users = [],
  preSelectedWarehouse,
  preSelectedProduct,
}: InventoryTransferFormProps) {
  const form = useForm<TransferRequestFormData>({
    resolver: zodResolver(transferRequestCreateSchema),
    defaultValues: {
      source_warehouse: preSelectedWarehouse || "",
      destination_branch: "",
      product: preSelectedProduct || "",
      quantity: "",
      requested_by: "",
      notes: "",
      transfer_number: `TRF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    },
  })

  const handleSubmit = async (data: TransferRequestFormData) => {
    // Validate and transform the data
    const validatedData = transferRequestCreateSchema.parse(data)
    onSubmit(validatedData)
  }

  const selectedWarehouse = warehouses.find(w => w.id === form.watch("source_warehouse"))
  const selectedBranch = branches.find(b => b.id === form.watch("destination_branch"))
  const selectedProduct = products.find(p => p.id === form.watch("product"))
  const selectedRequester = users.find(u => u.id === form.watch("requested_by"))

  // Filter staff users for requesters
  const staffUsers = users.filter(user => 
    ['pharmacist', 'manager', 'inventory_manager'].includes(user.role)
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Transfer Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Transfer Request</h3>
          
          <SelectField
            control={form.control}
            name="source_warehouse"
            label="Source Warehouse"
            placeholder="Select warehouse to transfer from"
            disabled={Boolean(preSelectedWarehouse)}
            options={warehouses.map(warehouse => ({
              value: warehouse.id.toString(),
              label: warehouse.name
            }))}
          />

          <SelectField
            control={form.control}
            name="destination_branch"
            label="Destination Branch"
            placeholder="Select branch to transfer to"
            options={branches.map(branch => ({
              value: branch.id.toString(),
              label: branch.name
            }))}
          />

          <SelectField
            control={form.control}
            name="product"
            label="Product"
            placeholder="Select product to transfer"
            disabled={Boolean(preSelectedProduct)}
            options={products.map(product => ({
              value: product.id.toString(),
              label: `${product.name} (${product.product_code})`
            }))}
          />

          <TextField
            control={form.control}
            name="quantity"
            label="Quantity"
            placeholder="Enter quantity to transfer"
            type="number"
            description="Number of units to transfer from warehouse to branch"
          />
        </div>

        {/* Request Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Request Details</h3>
          
          <SelectField
            control={form.control}
            name="requested_by"
            label="Requested By"
            placeholder="Select staff member making request"
            options={staffUsers.map(user => ({
              value: user.id.toString(),
              label: `${user.display_name || 'User'} (${user.role})`
            }))}
          />

          <TextAreaField
            control={form.control}
            name="notes"
            label="Transfer Notes"
            placeholder="e.g., Monthly restock, Emergency order, etc."
            rows={3}
            description="Optional notes explaining the transfer reason"
          />
        </div>

        {/* Transfer Summary */}
        {selectedWarehouse && selectedBranch && selectedProduct && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">📋 Transfer Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>From:</strong> {selectedWarehouse.name}</div>
              <div><strong>To:</strong> {selectedBranch.name}</div>
              <div><strong>Product:</strong> {selectedProduct.name} ({selectedProduct.product_code})</div>
              <div><strong>Quantity:</strong> {form.watch("quantity")} units</div>
              {selectedRequester && (
                <div><strong>Requested by:</strong> {selectedRequester.display_name || 'User'}</div>
              )}
            </div>
          </div>
        )}

        {/* Transfer Process */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🚚 Transfer Process</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Step 1:</strong> Request created with status "REQUESTED"</div>
            <div><strong>Step 2:</strong> Manager approves transfer (status → "APPROVED")</div>
            <div><strong>Step 3:</strong> Items shipped from warehouse (status → "IN_TRANSIT")</div>
            <div><strong>Step 4:</strong> Branch receives items (status → "COMPLETED")</div>
            <div><strong>Stock Update:</strong> Warehouse stock decreases, branch stock increases</div>
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
            {isSubmitting ? "Creating Request..." : "Create Transfer Request"}
          </Button>
        </div>
      </form>
    </Form>
  )
}