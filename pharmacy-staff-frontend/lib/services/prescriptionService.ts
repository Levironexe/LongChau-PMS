import { api, createQueryParams } from '../api'

// API Response Types - matching actual backend structure
export interface PrescriptionItem {
  id: number
  medicine_name: string
  medicine_code: string
  remaining_quantity: number
  dosage: string
  frequency: string
  duration: string
  quantity_prescribed: number
  quantity_dispensed: number
  instructions?: string
  created_at: string
  prescription: number
  medicine: number
}

export interface Prescription {
  id: number
  items: PrescriptionItem[]
  submitted_by_name?: string
  validated_by_name?: string
  is_expired: boolean
  total_items: number
  prescription_number: string
  patient_name: string
  patient_dob: string
  doctor_name: string
  doctor_license: string
  issue_date: string
  expiry_date: string
  status: "submitted" | "validated" | "dispensed" | "cancelled"
  validation_date?: string
  validation_notes?: string
  created_at: string
  submitted_by: number
  validated_by?: number
}

export interface PrescriptionFilters {
  search?: string
  status?: Prescription['status']
  patient_name?: string
  doctor_name?: string
  prescription_number?: string
  issue_date_from?: string
  issue_date_to?: string
  page?: number
  page_size?: number
  ordering?: string
}

export interface CreatePrescriptionRequest {
  prescription_number: string
  patient_name: string
  patient_dob: string
  doctor_name: string
  doctor_license: string
  issue_date: string
  expiry_date: string
  submitted_by: number
  validation_notes?: string
}

export interface UpdatePrescriptionRequest {
  patient_name?: string
  patient_dob?: string
  doctor_name?: string
  doctor_license?: string
  issue_date?: string
  expiry_date?: string
  status?: Prescription['status']
  validation_notes?: string
}

export interface CreatePrescriptionItemRequest {
  prescription: number
  medicine: number
  dosage: string
  frequency: string
  duration: string
  quantity_prescribed: number
  instructions?: string
}

export interface UpdatePrescriptionItemRequest {
  dosage?: string
  frequency?: string
  duration?: string
  quantity_prescribed?: number
  quantity_dispensed?: number
  instructions?: string
}

export interface ValidatePrescriptionRequest {
  validation_notes?: string
}

// Service Parameter Types
export type GetPrescriptionsParams = PrescriptionFilters
export type CreatePrescriptionParams = CreatePrescriptionRequest
export type UpdatePrescriptionParams = { id: number } & UpdatePrescriptionRequest
export type CreatePrescriptionItemParams = CreatePrescriptionItemRequest
export type UpdatePrescriptionItemParams = { id: number } & UpdatePrescriptionItemRequest
export type ValidatePrescriptionParams = { id: number } & ValidatePrescriptionRequest

export const prescriptionService = {
  // GET operations
  getPrescriptions: async (filters?: PrescriptionFilters): Promise<Prescription[]> => {
    const params = createQueryParams(filters || {})
    const response = await api.get(`/prescriptions/${params}`)
    return response.data.results || response.data
  },

  getPrescription: async (id: number): Promise<Prescription> => {
    const response = await api.get(`/prescriptions/${id}/`)
    return response.data
  },

  // POST operations
  createPrescription: async (data: CreatePrescriptionRequest): Promise<Prescription> => {
    const response = await api.post('/prescriptions/', data)
    return response.data
  },

  // PUT/PATCH operations
  updatePrescription: async ({ id, ...data }: UpdatePrescriptionParams): Promise<Prescription> => {
    const response = await api.patch(`/prescriptions/${id}/`, data)
    return response.data
  },

  // Specialized operations
  validatePrescription: async ({ id, ...data }: ValidatePrescriptionParams): Promise<Prescription> => {
    const response = await api.post(`/prescriptions/${id}/validate/`, data)
    return response.data
  },

  // DELETE operations
  deletePrescription: async (id: number): Promise<void> => {
    await api.delete(`/prescriptions/${id}/`)
  },

  // Prescription Items operations
  getPrescriptionItems: async (prescriptionId?: number): Promise<PrescriptionItem[]> => {
    const params = prescriptionId ? createQueryParams({ prescription: prescriptionId }) : ''
    const response = await api.get(`/prescription-items/${params}`)
    return response.data.results || response.data
  },

  createPrescriptionItem: async (data: CreatePrescriptionItemRequest): Promise<PrescriptionItem> => {
    const response = await api.post('/prescription-items/', data)
    return response.data
  },

  updatePrescriptionItem: async ({ id, ...data }: UpdatePrescriptionItemParams): Promise<PrescriptionItem> => {
    const response = await api.patch(`/prescription-items/${id}/`, data)
    return response.data
  },

  deletePrescriptionItem: async (id: number): Promise<void> => {
    await api.delete(`/prescription-items/${id}/`)
  },

  // Convenience methods
  getPendingPrescriptions: async (): Promise<Prescription[]> => {
    return prescriptionService.getPrescriptions({ status: 'submitted' })
  },

  getValidatedPrescriptions: async (): Promise<Prescription[]> => {
    return prescriptionService.getPrescriptions({ status: 'validated' })
  },

  getDispensedPrescriptions: async (): Promise<Prescription[]> => {
    return prescriptionService.getPrescriptions({ status: 'dispensed' })
  },

  getPrescriptionsByPatient: async (patientName: string): Promise<Prescription[]> => {
    return prescriptionService.getPrescriptions({ patient_name: patientName })
  },

  getPrescriptionsByDoctor: async (doctorName: string): Promise<Prescription[]> => {
    return prescriptionService.getPrescriptions({ doctor_name: doctorName })
  },
}