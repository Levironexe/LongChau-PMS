"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react"
import { Product, CreateMedicineRequest, CreateSupplementRequest, CreateMedicalDeviceRequest } from "@/lib/types"
import { 
  useProducts, 
  useCreateMedicine, 
  useCreateSupplement, 
  useCreateMedicalDevice,
  useUpdateMedicine,
  useUpdateSupplement,
  useUpdateMedicalDevice,
  useDeleteMedicine,
  useDeleteSupplement,
  useDeleteMedicalDevice,
  useProductStats
} from "@/hooks/api/useProducts"
import {
  useCreateMedicineFactory,
  useCreateSupplementFactory,
  useCanCreateViaFactory,
  useProductFactories
} from "@/hooks/api/useProductFactory"

export default function ProductsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [useFactoryPattern, setUseFactoryPattern] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    product_type: "medicine",
    price: "",
    requires_prescription: false,
    description: "",
    manufacturer: "",
    batch_number: "",
    active_ingredient: "",
    dosage_form: "tablet" as const,
    strength: "",
    supplement_type: "vitamin" as const,
    ingredients: [] as string[],
    device_type: "diagnostic" as const,
    device_class: "I" as const,
  })

  // Real API data with filtering
  const productFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(categoryFilter !== "all" && { product_type: categoryFilter as "medicine" | "supplement" | "medical_device" }),
  }
  const { data: products = [], isLoading, error } = useProducts(productFilters)
  const productStats = useProductStats()

  // Real API mutations based on product type
  const createMedicine = useCreateMedicine()
  const createSupplement = useCreateSupplement()
  const createMedicalDevice = useCreateMedicalDevice()
  
  // Factory pattern hooks
  const createMedicineFactory = useCreateMedicineFactory()
  const createSupplementFactory = useCreateSupplementFactory()
  const { data: productFactories } = useProductFactories()
  const { canCreate: canCreateMedicineViaFactory } = useCanCreateViaFactory('medicine')
  const { canCreate: canCreateSupplementViaFactory } = useCanCreateViaFactory('supplement')
  
  const updateMedicine = useUpdateMedicine()
  const updateSupplement = useUpdateSupplement()
  const updateMedicalDevice = useUpdateMedicalDevice()
  
  const deleteMedicine = useDeleteMedicine()
  const deleteSupplement = useDeleteSupplement()
  const deleteMedicalDevice = useDeleteMedicalDevice()

  const resetForm = () => {
    setFormData({
      name: "",
      product_type: "medicine",
      price: "",
      requires_prescription: false,
      description: "",
      manufacturer: "",
      batch_number: "",
      active_ingredient: "",
      dosage_form: "tablet" as const,
      strength: "",
      supplement_type: "vitamin" as const,
      ingredients: [] as string[],
      device_type: "diagnostic" as const,
      device_class: "I" as const,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const baseData = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      manufacturer: formData.manufacturer,
      batch_number: formData.batch_number,
      requires_prescription: formData.requires_prescription,
    }
    
    if (editingProduct) {
      // Update existing product based on type
      if (editingProduct.product_type === 'medicine') {
        const medicineData = {
          id: editingProduct.id,
          ...baseData,
          active_ingredient: formData.active_ingredient,
          dosage_form: formData.dosage_form,
          strength: formData.strength,
          is_prescription: formData.requires_prescription,
        } as { id: number } & Partial<CreateMedicineRequest>
        updateMedicine.mutate(medicineData)
      } else if (editingProduct.product_type === 'supplement') {
        const supplementData = {
          id: editingProduct.id,
          ...baseData,
          supplement_type: formData.supplement_type,
          ingredients: formData.ingredients,
        } as { id: number } & Partial<CreateSupplementRequest>
        updateSupplement.mutate(supplementData)
      } else if (editingProduct.product_type === 'medical_device') {
        const deviceData = {
          id: editingProduct.id,
          ...baseData,
          device_type: formData.device_type,
          device_class: formData.device_class,
        } as { id: number } & Partial<CreateMedicalDeviceRequest>
        updateMedicalDevice.mutate(deviceData)
      }
    } else {
      // Create new product based on type and pattern preference
      if (formData.product_type === 'medicine') {
        const medicineData = {
          ...baseData,
          active_ingredient: formData.active_ingredient,
          dosage_form: formData.dosage_form,
          strength: formData.strength,
          is_prescription: formData.requires_prescription,
        } as CreateMedicineRequest
        
        // Use factory pattern if enabled and available
        if (useFactoryPattern && canCreateMedicineViaFactory) {
          createMedicineFactory.mutate(medicineData)
        } else {
          createMedicine.mutate(medicineData)
        }
      } else if (formData.product_type === 'supplement') {
        const supplementData = {
          ...baseData,
          supplement_type: formData.supplement_type,
          ingredients: formData.ingredients,
        } as CreateSupplementRequest
        
        // Use factory pattern if enabled and available
        if (useFactoryPattern && canCreateSupplementViaFactory) {
          createSupplementFactory.mutate(supplementData)
        } else {
          createSupplement.mutate(supplementData)
        }
      } else if (formData.product_type === 'medical_device') {
        const deviceData = {
          ...baseData,
          device_type: formData.device_type,
          device_class: formData.device_class,
        } as CreateMedicalDeviceRequest
        createMedicalDevice.mutate(deviceData)
      }
    }
  }
  
  // Check if any mutation is pending
  const isSubmitting = createMedicine.isPending || createSupplement.isPending || createMedicalDevice.isPending || 
                      updateMedicine.isPending || updateSupplement.isPending || updateMedicalDevice.isPending ||
                      createMedicineFactory.isPending || createSupplementFactory.isPending
  
  // Handle successful mutations
  const handleMutationSuccess = useCallback(() => {
    setShowDialog(false)
    setEditingProduct(null)
    resetForm()
  }, [])
  
  // Set up success handlers
  useEffect(() => {
    if (createMedicine.isSuccess || createSupplement.isSuccess || createMedicalDevice.isSuccess ||
        updateMedicine.isSuccess || updateSupplement.isSuccess || updateMedicalDevice.isSuccess) {
      handleMutationSuccess()
    }
  }, [createMedicine.isSuccess, createSupplement.isSuccess, createMedicalDevice.isSuccess,
      updateMedicine.isSuccess, updateSupplement.isSuccess, updateMedicalDevice.isSuccess, handleMutationSuccess])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      product_type: product.product_type,
      price: product.price,
      requires_prescription: product.requires_prescription,
      description: product.description || "",
      manufacturer: product.manufacturer || "",
      batch_number: product.batch_number || "",
      active_ingredient: (product as any).active_ingredient || "",
      dosage_form: (product as any).dosage_form || "tablet",
      strength: (product as any).strength || "",
      supplement_type: (product as any).supplement_type || "vitamin",
      ingredients: (product as any).ingredients || [],
      device_type: (product as any).device_type || "diagnostic",
      device_class: (product as any).device_class || "I",
    })
    setShowDialog(true)
  }

  const handleDelete = (product: Product) => {
    if (product.product_type === 'medicine') {
      deleteMedicine.mutate(product.id)
    } else if (product.product_type === 'supplement') {
      deleteSupplement.mutate(product.id)
    } else if (product.product_type === 'medical_device') {
      deleteMedicalDevice.mutate(product.id)
    }
  }
  
  // No need to filter here - filtering is done by the API
  const filteredProducts = products
  
  // Use product stats from the hook
  const prescriptionProducts = products.filter(p => p.requires_prescription)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy's product catalog
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {productStats.medicines} medicines, {productStats.supplements} supplements, {productStats.medicalDevices} devices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescription Required</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{productStats.prescriptionProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factory Patterns</CardTitle>
            <Grid3X3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productFactories?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available product factories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Catalog Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₫{productStats.totalValue.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Combined value of all products
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="supplement">Supplement</SelectItem>
              <SelectItem value="medical_device">Medical Device</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.product_type}
                    </Badge>
                    {product.manufacturer && (
                      <p className="text-xs text-muted-foreground mt-1">{product.manufacturer}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₫{parseFloat(product.price).toLocaleString('vi-VN')}</span>
                    <span className="text-sm text-muted-foreground">
                      {product.requires_prescription ? 'Prescription' : 'OTC'}
                    </span>
                  </div>
                  {product.requires_prescription && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Prescription Required
                    </Badge>
                  )}
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Prescription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.product_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">₫{parseFloat(product.price).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{product.manufacturer || '-'}</TableCell>
                  <TableCell>
                    {product.requires_prescription ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Not Required</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">Category</Label>
                <Select value={formData.product_type} onValueChange={(value) => setFormData({ ...formData, product_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="supplement">Health Supplement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Factory Pattern Toggle - Only show for create mode and supported product types */}
            {!editingProduct && (
              (formData.product_type === 'medicine' && canCreateMedicineViaFactory) ||
              (formData.product_type === 'supplement' && canCreateSupplementViaFactory)
            ) && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="factory-toggle" className="text-sm font-medium text-gray-900">
                      Use Factory Pattern
                    </Label>
                    <p className="text-xs text-gray-500">
                      Create this {formData.product_type} using the Factory Pattern with enhanced defaults and validation
                    </p>
                  </div>
                  <Switch
                    id="factory-toggle"
                    checked={useFactoryPattern}
                    onCheckedChange={setUseFactoryPattern}
                  />
                </div>
                {useFactoryPattern && (
                  <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    ✨ Factory Pattern enabled - Enhanced creation with built-in optimizations
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Price (₫)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requires_prescription"
                checked={formData.requires_prescription}
                onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="requires_prescription">Requires Prescription</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingProduct(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== "all" ? "Try adjusting your search terms" : "Get started by adding your first product"}
          </p>
          {!searchTerm && categoryFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
