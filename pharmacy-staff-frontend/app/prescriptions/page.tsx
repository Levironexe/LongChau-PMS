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

interface PrescriptionItem {
  id: number
  product_id: number
  product_name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions?: string
}

interface Prescription {
  id: number
  prescription_number: string
  patient_name: string
  patient_phone: string
  patient_email?: string
  doctor_name: string
  doctor_license: string
  issue_date: string
  expiry_date: string
  status: "pending" | "dispensed" | "partially_dispensed" | "expired" | "cancelled"
  items: PrescriptionItem[]
  notes?: string
  total_amount: number
  dispensed_by?: string
  dispensed_date?: string
}

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
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    doctor_name: "",
    doctor_license: "",
    expiry_date: "",
    notes: ""
  })

  const queryClient = useQueryClient()

  // Mock prescriptions data
  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      return [
        {
          id: 1,
          prescription_number: "RX-2024-001",
          patient_name: "Nguyen Van An",
          patient_phone: "+84-901-234-567",
          patient_email: "nguyen.van.an@email.com",
          doctor_name: "Dr. Tran Thi Minh",
          doctor_license: "MD-12345",
          issue_date: "2024-01-20T09:00:00Z",
          expiry_date: "2024-02-20T09:00:00Z",
          status: "pending",
          total_amount: 85.50,
          notes: "Take with food. Monitor blood pressure.",
          items: [
            {
              id: 1,
              product_id: 2,
              product_name: "Amoxicillin 250mg",
              dosage: "250mg",
              frequency: "3 times daily",
              duration: "7 days",
              quantity: 21,
              instructions: "Take with meals"
            },
            {
              id: 2,
              product_id: 5,
              product_name: "Lisinopril 10mg",
              dosage: "10mg",
              frequency: "Once daily",
              duration: "30 days",
              quantity: 30,
              instructions: "Take in the morning"
            }
          ]
        },
        {
          id: 2,
          prescription_number: "RX-2024-002",
          patient_name: "Le Thi Hoa",
          patient_phone: "+84-902-345-678",
          patient_email: "le.thi.hoa@email.com",
          doctor_name: "Dr. Pham Van Duc",
          doctor_license: "MD-67890",
          issue_date: "2024-01-19T14:30:00Z",
          expiry_date: "2024-02-19T14:30:00Z",
          status: "dispensed",
          total_amount: 45.25,
          dispensed_by: "Pharmacist Nguyen",
          dispensed_date: "2024-01-19T15:00:00Z",
          items: [
            {
              id: 3,
              product_id: 6,
              product_name: "Metformin 500mg",
              dosage: "500mg",
              frequency: "Twice daily",
              duration: "30 days",
              quantity: 60,
              instructions: "Take with breakfast and dinner"
            }
          ]
        },
        {
          id: 3,
          prescription_number: "RX-2024-003",
          patient_name: "Tran Van Binh",
          patient_phone: "+84-903-456-789",
          doctor_name: "Dr. Hoang Thi Lan",
          doctor_license: "MD-11111",
          issue_date: "2024-01-18T11:15:00Z",
          expiry_date: "2024-02-18T11:15:00Z",
          status: "partially_dispensed",
          total_amount: 72.00,
          dispensed_by: "Pharmacist Tran",
          dispensed_date: "2024-01-18T12:00:00Z",
          notes: "Patient allergic to penicillin",
          items: [
            {
              id: 4,
              product_id: 7,
              product_name: "Atorvastatin 20mg",
              dosage: "20mg",
              frequency: "Once daily",
              duration: "30 days",
              quantity: 30,
              instructions: "Take at bedtime"
            },
            {
              id: 5,
              product_id: 8,
              product_name: "Aspirin 81mg",
              dosage: "81mg",
              frequency: "Once daily",
              duration: "30 days",
              quantity: 30,
              instructions: "Take with food"
            }
          ]
        }
      ] as Prescription[]
    },
  })

  // Mock doctors data
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      return [
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
      ] as Doctor[]
    },
  })

  // Mock prescription products
  const { data: prescriptionProducts = [] } = useQuery({
    queryKey: ["prescription-products"],
    queryFn: async () => {
      return [
        {
          id: 2,
          name: "Amoxicillin 250mg",
          price: "12.50",
          stock: 75,
          requires_prescription: true
        },
        {
          id: 5,
          name: "Lisinopril 10mg",
          price: "28.00",
          stock: 50,
          requires_prescription: true
        },
        {
          id: 6,
          name: "Metformin 500mg",
          price: "15.25",
          stock: 120,
          requires_prescription: true
        },
        {
          id: 7,
          name: "Atorvastatin 20mg",
          price: "35.00",
          stock: 80,
          requires_prescription: true
        },
        {
          id: 8,
          name: "Aspirin 81mg",
          price: "8.50",
          stock: 200,
          requires_prescription: true
        }
      ] as Product[]
    },
  })

  const createPrescription = useMutation({
    mutationFn: (data: typeof formData & { items: any[] }) => {
      const total = prescriptionItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
      return Promise.resolve({ 
        ...data, 
        id: Date.now(),
        prescription_number: `RX-2024-${String(prescriptions.length + 1).padStart(3, '0')}`,
        issue_date: new Date().toISOString(),
        status: "pending",
        total_amount: total,
        items: prescriptionItems.map((item, index) => ({
          id: Date.now() + index,
          product_id: item.product_id,
          product_name: item.product_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions
        }))
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      setShowDialog(false)
      resetForm()
    },
  })

  const updatePrescriptionStatus = useMutation({
    mutationFn: ({ id, status }: { id: number, status: Prescription["status"] }) => {
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
    },
  })

  const deletePrescription = useMutation({
    mutationFn: (id: number) => {
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
    },
  })

  const resetForm = () => {
    setFormData({
      patient_name: "",
      patient_phone: "",
      patient_email: "",
      doctor_name: "",
      doctor_license: "",
      expiry_date: "",
      notes: ""
    })
    setPrescriptionItems([])
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
    createPrescription.mutate({ ...formData, items: prescriptionItems })
  }

  const handleViewDetails = (prescription: Prescription) => {
    setViewingPrescription(prescription)
    setShowDetailsDialog(true)
  }

  const calculateTotal = () => {
    return prescriptionItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0).toFixed(2)
  }

  const filteredPrescriptions = prescriptions.filter((prescription: Prescription) => {
    const matchesSearch = prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingPrescriptions = prescriptions.filter(p => p.status === "pending")
  const dispensedPrescriptions = prescriptions.filter(p => p.status === "dispensed")
  const partiallyDispensedPrescriptions = prescriptions.filter(p => p.status === "partially_dispensed")
  const expiredPrescriptions = prescriptions.filter(p => p.status === "expired")

  const getStatusIcon = (status: Prescription["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-3 w-3" />
      case "dispensed": return <CheckCircle className="h-3 w-3" />
      case "partially_dispensed": return <AlertTriangle className="h-3 w-3" />
      case "expired": return <XCircle className="h-3 w-3" />
      case "cancelled": return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusVariant = (status: Prescription["status"]) => {
    switch (status) {
      case "pending": return "secondary"
      case "dispensed": return "default"
      case "partially_dispensed": return "default"
      case "expired": return "destructive"
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
        <Button onClick={() => { resetForm(); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingPrescriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dispensedPrescriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredPrescriptions.length}</div>
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispensed">Dispensed</SelectItem>
              <SelectItem value="partially_dispensed">Partially Dispensed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
                    <div className="text-sm text-muted-foreground">{prescription.patient_phone}</div>
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
                  <div className="font-medium">${prescription.total_amount.toFixed(2)}</div>
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
                    {prescription.status === "pending" && (
                      <Select
                        value={prescription.status}
                        onValueChange={(status: Prescription["status"]) => 
                          updatePrescriptionStatus.mutate({ id: prescription.id, status })
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="dispensed">Dispensed</SelectItem>
                          <SelectItem value="partially_dispensed">Partial</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deletePrescription.mutate(prescription.id)}
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="patient_phone">Patient Phone</Label>
                <Input
                  id="patient_phone"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_email">Patient Email (Optional)</Label>
              <Input
                id="patient_email"
                type="email"
                value={formData.patient_email}
                onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
              />
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
                        ${product.price} | Stock: {product.stock}
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
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special notes or warnings..."
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
                disabled={!formData.patient_name || !formData.doctor_name || prescriptionItems.length === 0 || createPrescription.isPending}
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
                  <div className="text-sm text-muted-foreground">{viewingPrescription.patient_phone}</div>
                  {viewingPrescription.patient_email && (
                    <div className="text-sm text-muted-foreground">{viewingPrescription.patient_email}</div>
                  )}
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
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
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

              {viewingPrescription.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                    {viewingPrescription.notes}
                  </div>
                </div>
              )}

              {viewingPrescription.dispensed_by && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Dispensed By</Label>
                    <div className="font-medium">{viewingPrescription.dispensed_by}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Dispensed Date</Label>
                    <div className="font-medium">
                      {viewingPrescription.dispensed_date && new Date(viewingPrescription.dispensed_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-muted rounded font-bold">
                <span>Total Amount</span>
                <span>${viewingPrescription.total_amount.toFixed(2)}</span>
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