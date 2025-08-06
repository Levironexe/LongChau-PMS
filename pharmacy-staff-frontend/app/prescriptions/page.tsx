"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText,
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  Stethoscope,
  Pill,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from "lucide-react"
import { api } from "@/lib/api"
import { 
  invalidDoctorPrescriptions, 
  validDoctors,
  isDoctorValid,
  mockInvalidDoctorError 
} from "@/lib/mock-data"
import {
  usePrescriptions,
  usePrescription,
  useCreatePrescription,
  useUpdatePrescription,
  useValidatePrescription,
  useDeletePrescription,
  usePrescriptionStats,
} from "@/hooks/api/usePrescriptions"
import { useMedicines } from "@/hooks/api/useProducts"
import type {
  Prescription,
  PrescriptionItem,
  PrescriptionFilters,
} from "@/lib/services/prescriptionService"

// API types are imported from the service
// Remove local interfaces as they're now defined in the service layer

interface Doctor {
  id: number
  name: string
  license: string
  specialty: string
  hospital: string
}

interface Product {
  id: number
  name: string
  price: string
  stock: number
  requires_prescription: boolean
}

export default function PrescriptionsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([])
  const [doctorValidationError, setDoctorValidationError] = useState<string | null>(null)
  const [showInvalidDoctorDemo, setShowInvalidDoctorDemo] = useState(false)
  const [formData, setFormData] = useState({
    prescription_number: "",
    patient_name: "",
    patient_dob: "",
    doctor_name: "",
    doctor_license: "",
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: "",
    submitted_by: 1, // Default to user ID 1, should be from auth context in real app
    validation_notes: ""
  })

  const queryClient = useQueryClient()

  // Real API integration
  const filters: PrescriptionFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter as Prescription['status'] }),
  }
  
  const { data: prescriptions = [], isLoading, error } = usePrescriptions(filters)
  const prescriptionStats = usePrescriptionStats()

  // Mock doctors data - includes valid and invalid doctors for validation demo
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const validDoctorsList: Doctor[] = [
        {
          id: 1,
          name: "Dr. Tran Thi Minh",
          license: "MD-12345",
          specialty: "Internal Medicine",
          hospital: "Cho Ray Hospital"
        },
        {
          id: 2,
          name: "Dr. Pham Van Duc", 
          license: "MD-67890",
          specialty: "Cardiology",
          hospital: "University Medical Center"
        },
        {
          id: 3,
          name: "Dr. Hoang Thi Lan",
          license: "MD-11111",
          specialty: "Endocrinology",
          hospital: "Bach Mai Hospital"
        }
      ]
      
      // Add invalid doctors for validation demo
      if (showInvalidDoctorDemo) {
        const invalidDoctors: Doctor[] = [
          {
            id: 999,
            name: "Dr. John Doe",
            license: "MD-INVALID-001", 
            specialty: "General Practice",
            hospital: "Unknown Clinic"
          },
          {
            id: 998,
            name: "Dr. Jane Smith", 
            license: "MD-EXPIRED-002",
            specialty: "Pediatrics",
            hospital: "Expired License Clinic"
          }
        ]
        return [...validDoctorsList, ...invalidDoctors]
      }
      
      return validDoctorsList
    },
  })

  // Real medicines API integration - only prescription medicines are relevant
  const { data: medicines = [] } = useMedicines({ is_prescription: true })
  
  // Transform medicines to Product interface for compatibility
  const prescriptionProducts: Product[] = medicines.map(medicine => ({
    id: medicine.id,
    name: medicine.name,
    price: medicine.price,
    stock: 100, // Default stock - could be improved with inventory integration
    requires_prescription: medicine.requires_prescription,
  }))

  // Real API mutations
  const createPrescriptionMutation = useCreatePrescription()
  const updatePrescriptionMutation = useUpdatePrescription()
  const validatePrescriptionMutation = useValidatePrescription()
  const deletePrescriptionMutation = useDeletePrescription()
  
  const handleCreatePrescription = async () => {
    try {
      // BUSINESS RULE VALIDATION: Check if doctor is valid
      if (!isDoctorValid(formData.doctor_name, formData.doctor_license)) {
        setDoctorValidationError(
          `Invalid doctor: "${formData.doctor_name}" with license "${formData.doctor_license}" is not registered in our system or has an invalid/expired license.`
        )
        return
      }

      // Clear validation errors
      setDoctorValidationError(null)

      // Generate prescription number if not provided
      const prescriptionNumber = formData.prescription_number || `RX-${Date.now()}`
      
      const prescriptionData = {
        prescription_number: prescriptionNumber,
        patient_name: formData.patient_name,
        patient_dob: formData.patient_dob,
        doctor_name: formData.doctor_name,
        doctor_license: formData.doctor_license,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        submitted_by: formData.submitted_by,
        validation_notes: formData.validation_notes,
      }
      
      await createPrescriptionMutation.mutateAsync(prescriptionData)
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error creating prescription:', error)
      // Check for doctor validation errors in API response
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message
        if (errorMessage.includes('doctor') || errorMessage.includes('license')) {
          setDoctorValidationError(`Prescription creation failed: ${errorMessage}`)
        }
      }
    }
  }

  const handleUpdatePrescriptionStatus = async (id: number, status: Prescription["status"]) => {
    try {
      if (status === 'validated') {
        await validatePrescriptionMutation.mutateAsync({ id, validation_notes: 'Validated by pharmacist' })
      } else {
        await updatePrescriptionMutation.mutateAsync({ id, status })
      }
    } catch (error) {
      console.error('Error updating prescription status:', error)
    }
  }

  const handleDeletePrescription = async (id: number) => {
    try {
      await deletePrescriptionMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting prescription:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      prescription_number: "",
      patient_name: "",
      patient_dob: "",
      doctor_name: "",
      doctor_license: "",
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: "",
      submitted_by: 1,
      validation_notes: ""
    })
    setPrescriptionItems([])
    setDoctorValidationError(null)
  }

  const addPrescriptionItem = (product: Product) => {
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 1,
      instructions: ""
    }
    setPrescriptionItems([...prescriptionItems, newItem])
  }

  const updatePrescriptionItem = (index: number, field: string, value: any) => {
    const updated = prescriptionItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setPrescriptionItems(updated)
  }

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreatePrescription()
  }

  const handleViewDetails = (prescription: Prescription) => {
    setViewingPrescription(prescription)
    setShowDetailsDialog(true)
  }

  const calculateTotal = () => {
    return prescriptionItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0).toFixed(2)
  }

  // Since filtering is now handled by the API, prescriptions are already filtered
  const filteredPrescriptions = prescriptions
  
  // Statistics are now provided by the custom hook
  const {
    total: totalPrescriptions,
    pending: pendingCount,
    validated: validatedCount,
    dispensed: dispensedCount,
    cancelled: cancelledCount,
    expired: expiredCount,
  } = prescriptionStats


  const getStatusIcon = (status: Prescription["status"]) => {
    switch (status) {
      case "submitted": return <Clock className="h-3 w-3" />
      case "validated": return <CheckCircle className="h-3 w-3" />
      case "dispensed": return <CheckCircle className="h-3 w-3" />
      case "cancelled": return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status: Prescription["status"]) => {
    switch (status) {
      case "submitted": return "secondary"
      case "validated": return "default"
      case "dispensed": return "default"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage prescription medications and patient orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showInvalidDoctorDemo ? "destructive" : "outline"}
            onClick={() => setShowInvalidDoctorDemo(!showInvalidDoctorDemo)}
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {showInvalidDoctorDemo ? 'Hide' : 'Show'} Invalid Doctors
          </Button>
          <Button onClick={() => { resetForm(); setShowDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrescriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dispensedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{validatedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="dispensed">Dispensed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prescription #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>
                  <div className="font-medium">{prescription.prescription_number}</div>
                  <div className="text-sm text-muted-foreground">
                    {prescription.items.length} item{prescription.items.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{prescription.patient_name}</div>
                    <div className="text-sm text-muted-foreground">DOB: {new Date(prescription.patient_dob).toLocaleDateString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{prescription.doctor_name}</div>
                    <div className="text-sm text-muted-foreground">{prescription.doctor_license}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(prescription.issue_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(prescription.expiry_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(prescription.status)}>
                    {getStatusIcon(prescription.status)}
                    <span className="ml-1">
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1).replace('_', ' ')}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{prescription.total_items} items</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetails(prescription)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {prescription.status === "submitted" && (
                      <Select
                        value={prescription.status}
                        onValueChange={(status: Prescription["status"]) => 
                          handleUpdatePrescriptionStatus(prescription.id, status)
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="validated">Validate</SelectItem>
                          <SelectItem value="dispensed">Dispense</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeletePrescription(prescription.id)}
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

      {/* Create Prescription Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
          </DialogHeader>
          
          {/* Doctor Validation Error */}
          {doctorValidationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                Invalid Doctor Detected
              </AlertDescription>
              <AlertDescription>
                {doctorValidationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Invalid Doctor Demo Warning */}
          {showInvalidDoctorDemo && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> Invalid doctors are now visible in the doctor dropdown for validation testing.
                Select "Dr. John Doe" or "Dr. Jane Smith" to trigger validation errors.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prescription_number">Prescription Number (Optional - will auto-generate if empty)</Label>
              <Input
                id="prescription_number"
                value={formData.prescription_number}
                onChange={(e) => setFormData({ ...formData, prescription_number: e.target.value })}
                placeholder="RX-2025-001 (leave empty to auto-generate)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_dob">Patient Date of Birth</Label>
                <Input
                  id="patient_dob"
                  type="date"
                  value={formData.patient_dob}
                  onChange={(e) => setFormData({ ...formData, patient_dob: e.target.value })}
                  required
                />
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Doctor Name</Label>
                <Select 
                  value={formData.doctor_name} 
                  onValueChange={(value) => {
                    const doctor = doctors.find(d => d.name === value)
                    setFormData({ 
                      ...formData, 
                      doctor_name: value,
                      doctor_license: doctor?.license || ""
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_license">Doctor License</Label>
                <Input
                  id="doctor_license"
                  value={formData.doctor_license}
                  onChange={(e) => setFormData({ ...formData, doctor_license: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Prescription Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Add Prescription Medications</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {prescriptionProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ₫{parseFloat(product.price).toLocaleString('vi-VN')} | Stock: {product.stock}
                      </div>
                    </div>
                    <Button 
                      type="button"
                      size="sm" 
                      onClick={() => addPrescriptionItem(product)}
                      disabled={product.stock === 0}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {prescriptionItems.length > 0 && (
              <div className="space-y-2">
                <Label>Prescription Items</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="p-3 bg-muted rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.product_name}</span>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removePrescriptionItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Dosage</Label>
                          <Input
                            value={item.dosage}
                            onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                            placeholder="e.g., 250mg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <Input
                            value={item.frequency}
                            onChange={(e) => updatePrescriptionItem(index, 'frequency', e.target.value)}
                            placeholder="e.g., 3 times daily"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration</Label>
                          <Input
                            value={item.duration}
                            onChange={(e) => updatePrescriptionItem(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Subtotal</Label>
                          <div className="text-sm font-medium py-1">
                            ₫{(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Instructions</Label>
                        <Input
                          value={item.instructions}
                          onChange={(e) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                          placeholder="Special instructions..."
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-bold text-lg border-t pt-2">
                    Total: ${calculateTotal()}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="validation_notes">Validation Notes (Optional)</Label>
              <Textarea
                id="validation_notes"
                value={formData.validation_notes}
                onChange={(e) => setFormData({ ...formData, validation_notes: e.target.value })}
                rows={3}
                placeholder="Optional notes for pharmacist validation..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.patient_name || !formData.doctor_name || !formData.patient_dob || !formData.expiry_date || createPrescriptionMutation.isPending}
              >
                Create Prescription
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Prescription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prescription Details - {viewingPrescription?.prescription_number}</DialogTitle>
          </DialogHeader>
          {viewingPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                  <div className="font-medium">{viewingPrescription.patient_name}</div>
                  <div className="text-sm text-muted-foreground">DOB: {new Date(viewingPrescription.patient_dob).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Doctor</Label>
                  <div className="font-medium">{viewingPrescription.doctor_name}</div>
                  <div className="text-sm text-muted-foreground">{viewingPrescription.doctor_license}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Issue Date</Label>
                  <div className="font-medium">
                    {new Date(viewingPrescription.issue_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                  <div className="font-medium">
                    {new Date(viewingPrescription.expiry_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={getStatusVariant(viewingPrescription.status)} className="mt-1">
                    {getStatusIcon(viewingPrescription.status)}
                    <span className="ml-1">
                      {viewingPrescription.status.charAt(0).toUpperCase() + viewingPrescription.status.slice(1).replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Prescribed Medications</Label>
                <div className="mt-2 space-y-2">
                  {viewingPrescription.items.map((item) => (
                    <div key={item.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{item.medicine_name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity_prescribed}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span> {item.dosage}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span> {item.frequency}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span> {item.duration}
                        </div>
                      </div>
                      {item.instructions && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Instructions:</span> {item.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {viewingPrescription.validation_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Validation Notes</Label>
                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                    {viewingPrescription.validation_notes}
                  </div>
                </div>
              )}

              {viewingPrescription.validated_by_name && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Validated By</Label>
                    <div className="font-medium">{viewingPrescription.validated_by_name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Validation Date</Label>
                    <div className="font-medium">
                      {viewingPrescription.validation_date && new Date(viewingPrescription.validation_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-muted rounded font-bold">
                <span>Total Amount</span>
                <span>{viewingPrescription.total_items} items</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Get started by creating your first prescription"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => { resetForm(); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          )}
        </div>
      )}
    </div>
  )
}