"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { TextField, SelectField } from "@/components/forms/FormField"
import { zodResolver } from "@/lib/forms"
import {
  warehouseInventoryCreateSchema,
  warehouseInventoryEditSchema,
  type WarehouseInventoryCreateData,
  type WarehouseInventoryEditData,
  type WarehouseInventory,
} from "@/lib/validations/warehouse-inventory"

interface WarehouseInventoryFormProps {
  warehouseInventory?: WarehouseInventory | null
  warehouseId?: number
  onSubmit: (data: WarehouseInventoryCreateData | WarehouseInventoryEditData) => void
  onCancel: () => void
  isSubmitting: boolean
  warehouses?: Array<{ id: number; name: string }>
  products?: Array<{ 
    id: number; 
    name: string; 
    product_code: string;
    product_type?: string;
    price?: string;
    requires_prescription?: boolean;
    manufacturer?: string;
    description?: string;
  }>
}

export function WarehouseInventoryForm({
  warehouseInventory,
  warehouseId,
  onSubmit,
  onCancel,
  isSubmitting,
  warehouses = [],
  products = [],
}: WarehouseInventoryFormProps) {
  const isEditing = Boolean(warehouseInventory)
  const schema = isEditing ? warehouseInventoryEditSchema : warehouseInventoryCreateSchema

  const form = useForm<WarehouseInventoryCreateData | WarehouseInventoryEditData>({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouse: warehouseInventory?.warehouse || warehouseId || 0,
      product: warehouseInventory?.product || 0,
      current_stock: warehouseInventory?.current_stock || 0,
      minimum_stock: warehouseInventory?.minimum_stock || 100,
      reorder_point: warehouseInventory?.reorder_point || 200,
      cost_price: warehouseInventory?.cost_price || "0.00",
      supplier: warehouseInventory?.supplier || "",
      ...(isEditing && warehouseInventory ? { id: warehouseInventory.id } : {}),
    },
  })

  const handleSubmit = (data: WarehouseInventoryCreateData | WarehouseInventoryEditData) => {
    onSubmit(data)
  }

  const selectedWarehouse = warehouses.find(w => w.id === form.watch("warehouse"))
  const selectedProduct = products.find(p => p.id === form.watch("product"))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Product Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product Assignment</h3>
          
          <SelectField
            control={form.control}
            name="warehouse"
            label="Warehouse"
            placeholder="Select warehouse"
            disabled={isEditing || Boolean(warehouseId)}
            options={warehouses.map(warehouse => ({
              value: warehouse.id.toString(),
              label: warehouse.name
            }))}
          />

          <SelectField
            control={form.control}
            name="product"
            label="Product"
            placeholder="Select product to add to warehouse"
            disabled={isEditing}
            options={products.map(product => ({
              value: product.id.toString(),
              label: `${product.name} (${product.product_code})`
            }))}
          />

          {selectedProduct && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-3">📦 Selected Product Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">
                    <strong>Product:</strong> {selectedProduct.name}
                  </p>
                  <p className="text-green-700">
                    <strong>Code:</strong> {selectedProduct.product_code}
                  </p>
                  <p className="text-green-700">
                    <strong>Type:</strong> {selectedProduct.product_type || 'Not specified'}
                  </p>
                  {selectedProduct.manufacturer && (
                    <p className="text-green-700">
                      <strong>Manufacturer:</strong> {selectedProduct.manufacturer}
                    </p>
                  )}
                </div>
                <div>
                  {selectedProduct.price && (
                    <p className="text-green-700">
                      <strong>Retail Price:</strong> ₫{parseFloat(selectedProduct.price).toLocaleString('vi-VN')}
                    </p>
                  )}
                  {selectedProduct.requires_prescription !== undefined && (
                    <p className="text-green-700">
                      <strong>Prescription:</strong> {selectedProduct.requires_prescription ? 'Required' : 'Not required'}
                    </p>
                  )}
                  {selectedWarehouse && (
                    <p className="text-green-700">
                      <strong>Warehouse:</strong> {selectedWarehouse.name}
                    </p>
                  )}
                </div>
              </div>
              {selectedProduct.description && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-green-700">
                    <strong>Description:</strong> {selectedProduct.description}
                  </p>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-green-600 text-xs font-medium">
                  ✅ All product information will be automatically linked to warehouse inventory
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stock Management - Only thing user needs to configure */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">📊 Stock Quantities (Required)</h3>
          <p className="text-sm text-gray-600">Product details are automatically inherited. Just set the stock levels:</p>
          
          <TextField
            control={form.control}
            name="current_stock"
            label="Current Stock"
            placeholder="Enter current stock quantity"
            type="number"
            description="Current quantity available in warehouse"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              control={form.control}
              name="minimum_stock"
              label="Minimum Stock"
              placeholder="Minimum stock level"
              type="number"
                description="Alert threshold for low stock"
            />

            <TextField
              control={form.control}
              name="reorder_point"
              label="Reorder Point"
              placeholder="Reorder trigger level"
              type="number"
                description="When to reorder more stock"
            />
          </div>
        </div>

        {/* Pricing & Supplier */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing & Supplier</h3>
          
          <TextField
            control={form.control}
            name="cost_price"
            label="Cost Price (VND)"
            placeholder="e.g., 12.50"
            description="Cost price per unit in Vietnamese Dong"
          />

          <TextField
            control={form.control}
            name="supplier"
            label="Supplier"
            placeholder="e.g., Traphaco Distribution Ltd"
            description="Supplier name (optional)"
          />
        </div>

        {/* Workflow Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🔄 Warehouse → Branch Workflow</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="font-medium">1. Add Product to Warehouse (this form)</div>
            <div className="ml-4 space-y-1">
              <div>• Product details inherited automatically from product database</div>
              <div>• Set initial stock quantity (e.g., 1000 units)</div>
              <div>• Configure minimum stock alerts and reorder points</div>
              <div>• Set cost price for profit calculations</div>
            </div>
            <div className="font-medium mt-2">2. Transfer to Branches (next step)</div>
            <div className="ml-4 space-y-1">
              <div>• Request transfer from warehouse to specific branch</div>
              <div>• Example: Transfer 500 units to Branch A</div>
              <div>• Stock updates: Warehouse = 500, Branch A = 500</div>
            </div>
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
              isEditing ? "Updating..." : "Adding..."
            ) : (
              isEditing ? "Update Stock" : "Add to Warehouse"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}