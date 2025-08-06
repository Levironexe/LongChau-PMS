// Mock data for business rule validation scenarios
import { Product, Medicine, InventoryRecord, Order, User } from './types'

// 1. OUT-OF-STOCK PRODUCTS MOCK DATA
export const outOfStockProducts: Product[] = [
  {
    id: 101,
    name: "Paracetamol 500mg",
    product_code: "MED-PAR-500",
    product_type: "medicine",
    price: "15000",
    requires_prescription: false,
    created_at: "2024-01-15T00:00:00Z",
    stock: 0, // OUT OF STOCK
    description: "Pain relief medication",
    manufacturer: "Traphaco",
    batch_number: "PAR2024001",
    expiry_date: "2025-12-31"
  },
  {
    id: 102,
    name: "Amoxicillin 250mg Capsules",
    product_code: "MED-AMX-250",
    product_type: "medicine", 
    price: "45000",
    requires_prescription: true,
    created_at: "2024-01-15T00:00:00Z",
    stock: 0, // OUT OF STOCK
    description: "Antibiotic medication",
    manufacturer: "DHG Pharma",
    batch_number: "AMX2024002",
    expiry_date: "2025-08-15"
  },
  {
    id: 103,
    name: "Blood Pressure Monitor",
    product_code: "DEV-BPM-001",
    product_type: "medical_device",
    price: "1250000",
    requires_prescription: false,
    created_at: "2024-01-15T00:00:00Z",
    stock: 0, // OUT OF STOCK
    description: "Digital blood pressure monitor",
    manufacturer: "Omron",
    batch_number: "BPM2024001"
  }
]

// Inventory records showing zero stock
export const outOfStockInventory: InventoryRecord[] = [
  {
    id: 201,
    product: 101,
    product_name: "Paracetamol 500mg",
    product_code: "MED-PAR-500",
    branch: 1,
    branch_name: "Long Chau Central Branch",
    current_stock: 0, // ZERO STOCK
    minimum_stock: 20,
    reorder_point: 10,
    is_low_stock: true,
    stock_status: "out_of_stock",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-08-06T12:00:00Z",
    product_type: "medicine"
  },
  {
    id: 202,
    product: 102,
    product_name: "Amoxicillin 250mg Capsules",
    product_code: "MED-AMX-250",
    branch: 1,
    branch_name: "Long Chau Central Branch",
    current_stock: 0, // ZERO STOCK
    minimum_stock: 15,
    reorder_point: 8,
    is_low_stock: true,
    stock_status: "out_of_stock",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-08-06T12:00:00Z",
    product_type: "medicine"
  }
]

// 2. EXPIRED MEDICATIONS MOCK DATA
export const expiredMedications: Medicine[] = [
  {
    id: 201,
    name: "Ibuprofen 400mg",
    product_code: "MED-IBU-400",
    product_type: "medicine",
    price: "25000",
    requires_prescription: false,
    created_at: "2023-01-15T00:00:00Z",
    stock: 50,
    description: "Anti-inflammatory medication",
    manufacturer: "Traphaco",
    batch_number: "IBU2023001",
    expiry_date: "2024-06-30", // EXPIRED
    active_ingredient: "Ibuprofen",
    dosage_form: "tablet",
    strength: "400mg",
    therapeutic_class: "NSAID",
    is_prescription: false,
    drug_schedule: "OTC"
  },
  {
    id: 202,
    name: "Aspirin 100mg", 
    product_code: "MED-ASP-100",
    product_type: "medicine",
    price: "18000",
    requires_prescription: false,
    created_at: "2023-06-15T00:00:00Z",
    stock: 75,
    description: "Blood thinner medication",
    manufacturer: "DHG Pharma",
    batch_number: "ASP2023002",
    expiry_date: "2024-03-15", // EXPIRED
    active_ingredient: "Aspirin",
    dosage_form: "tablet",
    strength: "100mg",
    therapeutic_class: "Antiplatelet",
    is_prescription: false,
    drug_schedule: "OTC"
  },
  {
    id: 203,
    name: "Cough Syrup Pediatric",
    product_code: "MED-CSP-100",
    product_type: "medicine", 
    price: "65000",
    requires_prescription: true,
    created_at: "2023-03-10T00:00:00Z",
    stock: 25,
    description: "Pediatric cough syrup",
    manufacturer: "Imexpharm",
    batch_number: "CSP2023001",
    expiry_date: "2024-05-20", // EXPIRED
    active_ingredient: "Dextromethorphan",
    dosage_form: "syrup",
    strength: "15mg/5ml",
    therapeutic_class: "Cough suppressant",
    is_prescription: true,
    drug_schedule: "III"
  }
]

// Inventory records for expired medications
export const expiredMedicationInventory: InventoryRecord[] = [
  {
    id: 301,
    product: 201,
    product_name: "Ibuprofen 400mg",
    product_code: "MED-IBU-400",
    branch: 1,
    branch_name: "Long Chau Central Branch",
    current_stock: 50,
    minimum_stock: 30,
    is_low_stock: false,
    stock_status: "in_stock",
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2024-06-30T23:59:59Z",
    product_type: "medicine",
    expiry_date: "2024-06-30", // EXPIRED
    batch_number: "IBU2023001"
  },
  {
    id: 302,
    product: 202,
    product_name: "Aspirin 100mg",
    product_code: "MED-ASP-100", 
    branch: 1,
    branch_name: "Long Chau Central Branch",
    current_stock: 75,
    minimum_stock: 40,
    is_low_stock: false,
    stock_status: "in_stock",
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2024-03-15T23:59:59Z",
    product_type: "medicine",
    expiry_date: "2024-03-15", // EXPIRED
    batch_number: "ASP2023002"
  }
]

// 3. PRESCRIPTION WITHOUT VALID DOCTOR MOCK DATA
export const invalidDoctorPrescriptions = [
  {
    id: 401,
    customer: 10,
    customer_name: "Nguyen Van A",
    prescription_number: "RX-2024-001",
    doctor_name: "Dr. John Doe", // INVALID - Not in system
    doctor_license: "MD-INVALID-001",
    medications: [
      {
        product_id: 102,
        product_name: "Amoxicillin 250mg",
        dosage: "250mg",
        frequency: "3 times daily",
        duration: "7 days",
        quantity: 21
      }
    ],
    prescription_date: "2024-08-06",
    status: "pending",
    validation_required: true,
    validation_error: "Doctor license not found in system"
  },
  {
    id: 402,
    customer: 11,
    customer_name: "Tran Thi B",
    prescription_number: "RX-2024-002", 
    doctor_name: "Dr. Jane Smith", // INVALID - Not verified
    doctor_license: "MD-EXPIRED-002",
    medications: [
      {
        product_id: 203,
        product_name: "Cough Syrup Pediatric",
        dosage: "5ml",
        frequency: "2 times daily", 
        duration: "5 days",
        quantity: 1
      }
    ],
    prescription_date: "2024-08-06",
    status: "rejected",
    validation_required: true,
    validation_error: "Doctor license has expired"
  }
]

// Valid doctors for comparison
export const validDoctors: User[] = [
  {
    id: 501,
    first_name: "Dr. Nguyen",
    last_name: "Minh Duc",
    email: "dr.duc@hospital.vn",
    phone: "+84-90-123-4567",
    role: "pharmacist", // Using pharmacist role as doctor equivalent
    created_at: "2024-01-01T00:00:00Z",
    employee_id: "DOC-001",
    notes: "Licensed MD - Internal Medicine"
  },
  {
    id: 502,
    first_name: "Dr. Le",
    last_name: "Thi Mai",
    email: "dr.mai@hospital.vn", 
    phone: "+84-90-234-5678",
    role: "pharmacist",
    created_at: "2024-01-01T00:00:00Z",
    employee_id: "DOC-002",
    notes: "Licensed MD - Pediatrics"
  }
]

// Helper functions for validation
export const isProductOutOfStock = (productId: number): boolean => {
  return outOfStockProducts.some(p => p.id === productId && p.stock === 0)
}

export const isProductExpired = (productId: number): boolean => {
  const product = expiredMedications.find(p => p.id === productId)
  if (!product || !product.expiry_date) return false
  
  const expiryDate = new Date(product.expiry_date)
  const today = new Date()
  return expiryDate < today
}

export const isDoctorValid = (doctorName: string, license?: string): boolean => {
  // Check if doctor exists in valid doctors list
  const doctorExists = validDoctors.some(doc => 
    `${doc.first_name} ${doc.last_name}` === doctorName
  )
  
  // Check for invalid/expired licenses
  const hasInvalidLicense = license?.includes('INVALID') || license?.includes('EXPIRED')
  
  return doctorExists && !hasInvalidLicense
}

// Mock API responses for validation scenarios
export const mockOutOfStockError = {
  error: "Insufficient stock",
  message: "Cannot sell out-of-stock items",
  details: {
    products: outOfStockProducts.map(p => ({
      id: p.id,
      name: p.name,
      requested_quantity: 1,
      available_quantity: 0
    }))
  }
}

export const mockExpiredMedicationWarning = {
  warning: "Expired medication detected", 
  message: "These medications have expired and cannot be sold",
  details: {
    expired_products: expiredMedications.map(m => ({
      id: m.id,
      name: m.name,
      expiry_date: m.expiry_date,
      days_expired: Math.floor((new Date().getTime() - new Date(m.expiry_date!).getTime()) / (1000 * 60 * 60 * 24))
    }))
  }
}

export const mockInvalidDoctorError = {
  error: "Invalid prescription",
  message: "Prescription contains invalid doctor information", 
  details: {
    prescriptions: invalidDoctorPrescriptions.map(p => ({
      prescription_number: p.prescription_number,
      doctor_name: p.doctor_name,
      doctor_license: p.doctor_license,
      validation_error: p.validation_error
    }))
  }
}