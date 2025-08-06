export interface Product {
  id: number
  name: string
  product_type: "medicine" | "supplement"
  price: string
  requires_prescription: boolean
  created_at: string
  stock?: number
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  customer_type: "regular" | "vip"
  created_at: string
}

export interface Order {
  id: number
  customer: number
  customer_name?: string
  total_amount: string
  status: "pending" | "completed"
  order_date: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order: number
  product: number
  product_name?: string
  quantity: number
  unit_price: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface PrescriptionUpload {
  id: string
  patientName: string
  dateOfBirth: string
  doctorName: string
  doctorLicense: string
  issueDate: string
  files: UploadedFile[]
  status: "pending" | "under_review" | "approved" | "rejected"
  submittedAt: string
  reviewNotes?: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  status: "uploading" | "uploaded" | "failed"
  progress?: number
  error?: string
}

export interface PrescriptionFormData {
  patientName: string
  dateOfBirth: string
  doctorName: string
  doctorLicense: string
  issueDate: string
  notes?: string
}
