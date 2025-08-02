import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { prescriptionService } from '@/lib/services/prescriptionService'
import { queryKeys, getInvalidationKeys } from '@/lib/queryKeys'
import { ApiError } from '@/lib/api'
import type {
  Prescription,
  PrescriptionItem,
  PrescriptionFilters,
  CreatePrescriptionParams,
  UpdatePrescriptionParams,
  ValidatePrescriptionParams,
  CreatePrescriptionItemParams,
  UpdatePrescriptionItemParams,
} from '@/lib/services/prescriptionService'

// =============================================
// QUERY HOOKS (GET operations)
// =============================================

/**
 * Hook to fetch prescriptions with optional filtering
 */
export const usePrescriptions = (filters?: PrescriptionFilters) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.list(filters || {}),
    queryFn: () => prescriptionService.getPrescriptions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - prescriptions change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch a single prescription by ID
 */
export const usePrescription = (id: number) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.detail(id),
    queryFn: () => prescriptionService.getPrescription(id),
    enabled: !!id && id > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

/**
 * Hook to fetch prescription items for a specific prescription
 */
export const usePrescriptionItems = (prescriptionId?: number) => {
  return useQuery({
    queryKey: queryKeys.prescriptionItems.list(prescriptionId),
    queryFn: () => prescriptionService.getPrescriptionItems(prescriptionId),
    enabled: prescriptionId === undefined || (prescriptionId > 0),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

// =============================================
// STATUS-SPECIFIC QUERY HOOKS
// =============================================

/**
 * Hook to fetch pending prescriptions (submitted status)
 */
export const usePendingPrescriptions = () => {
  return useQuery({
    queryKey: queryKeys.prescriptions.pending(),
    queryFn: () => prescriptionService.getPendingPrescriptions(),
    staleTime: 1 * 60 * 1000, // 1 minute - pending prescriptions need frequent updates
    gcTime: 5 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Hook to fetch validated prescriptions
 */
export const useValidatedPrescriptions = () => {
  return useQuery({
    queryKey: queryKeys.prescriptions.validated(),
    queryFn: () => prescriptionService.getValidatedPrescriptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes - validated prescriptions are more stable
    gcTime: 10 * 60 * 1000,
    retry: 3,
  })
}

/**
 * Hook to fetch dispensed prescriptions
 */
export const useDispensedPrescriptions = () => {
  return useQuery({
    queryKey: queryKeys.prescriptions.dispensed(),
    queryFn: () => prescriptionService.getDispensedPrescriptions(),
    staleTime: 10 * 60 * 1000, // 10 minutes - dispensed prescriptions rarely change
    gcTime: 15 * 60 * 1000,
    retry: 3,
  })
}

// =============================================
// PATIENT/DOCTOR SPECIFIC QUERY HOOKS
// =============================================

/**
 * Hook to fetch prescriptions for a specific patient
 */
export const usePrescriptionsByPatient = (patientName: string) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.byPatient(patientName),
    queryFn: () => prescriptionService.getPrescriptionsByPatient(patientName),
    enabled: !!patientName && patientName.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * Hook to fetch prescriptions for a specific doctor
 */
export const usePrescriptionsByDoctor = (doctorName: string) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.byDoctor(doctorName),
    queryFn: () => prescriptionService.getPrescriptionsByDoctor(doctorName),
    enabled: !!doctorName && doctorName.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

// =============================================
// MUTATION HOOKS (CREATE, UPDATE, DELETE operations)
// =============================================

/**
 * Hook to create a new prescription
 */
export const useCreatePrescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePrescriptionParams) => prescriptionService.createPrescription(data),

    onMutate: async (newPrescription) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions.lists() })

      // Snapshot the previous value
      const previousPrescriptions = queryClient.getQueryData(queryKeys.prescriptions.lists()) as Prescription[]

      // Optimistically update to the new value
      const optimisticPrescription: Prescription = {
        ...newPrescription,
        id: Date.now(), // Temporary ID
        items: [],
        is_expired: false,
        total_items: 0,
        prescription_number: `RX-${Date.now()}`, // Temporary number
        status: 'submitted' as const,
        created_at: new Date().toISOString(),
        submitted_by: 1, // Will be updated by server
      }

      queryClient.setQueryData(
        queryKeys.prescriptions.lists(),
        (old: Prescription[] = []) => [optimisticPrescription, ...old]
      )

      // Return a context object with the snapshotted value
      return { previousPrescriptions }
    },

    onError: (err: ApiError, newPrescription, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPrescriptions) {
        queryClient.setQueryData(queryKeys.prescriptions.lists(), context.previousPrescriptions)
      }
    },

    onSettled: (data) => {
      // Always refetch after error or success to ensure consistency
      getInvalidationKeys.prescription(data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to update a prescription
 */
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePrescriptionParams) => prescriptionService.updatePrescription(data),

    onMutate: async (updatedData) => {
      const { id, ...updates } = updatedData
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions.detail(id) })

      // Snapshot the previous value
      const previousPrescription = queryClient.getQueryData(queryKeys.prescriptions.detail(id)) as Prescription

      // Optimistically update
      if (previousPrescription) {
        queryClient.setQueryData(queryKeys.prescriptions.detail(id), {
          ...previousPrescription,
          ...updates,
        })
      }

      return { previousPrescription }
    },

    onError: (err: ApiError, updatedData, context) => {
      if (context?.previousPrescription) {
        queryClient.setQueryData(queryKeys.prescriptions.detail(updatedData.id), context.previousPrescription)
      }
    },

    onSettled: (data, error, variables) => {
      getInvalidationKeys.prescription(variables.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to validate a prescription (pharmacist approval)
 */
export const useValidatePrescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ValidatePrescriptionParams) => prescriptionService.validatePrescription(data),

    onMutate: async (validationData) => {
      const { id } = validationData
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions.detail(id) })

      // Snapshot the previous value
      const previousPrescription = queryClient.getQueryData(queryKeys.prescriptions.detail(id)) as Prescription

      // Optimistically update status to validated
      if (previousPrescription) {
        queryClient.setQueryData(queryKeys.prescriptions.detail(id), {
          ...previousPrescription,
          status: 'validated' as const,
          validation_date: new Date().toISOString(),
          validation_notes: validationData.validation_notes || '',
        })
      }

      return { previousPrescription }
    },

    onError: (err: ApiError, validationData, context) => {
      if (context?.previousPrescription) {
        queryClient.setQueryData(queryKeys.prescriptions.detail(validationData.id), context.previousPrescription)
      }
    },

    onSettled: (data, error, variables) => {
      getInvalidationKeys.prescription(variables.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to delete a prescription
 */
export const useDeletePrescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => prescriptionService.deletePrescription(id),

    onMutate: async (prescriptionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions.lists() })

      // Snapshot the previous value
      const previousPrescriptions = queryClient.getQueryData(queryKeys.prescriptions.lists()) as Prescription[]

      // Optimistically remove from the list
      queryClient.setQueryData(
        queryKeys.prescriptions.lists(),
        (old: Prescription[] = []) => old.filter(prescription => prescription.id !== prescriptionId)
      )

      return { previousPrescriptions }
    },

    onError: (err: ApiError, prescriptionId, context) => {
      if (context?.previousPrescriptions) {
        queryClient.setQueryData(queryKeys.prescriptions.lists(), context.previousPrescriptions)
      }
    },

    onSettled: (data, error, prescriptionId) => {
      getInvalidationKeys.prescription(prescriptionId).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// =============================================
// PRESCRIPTION ITEMS MUTATION HOOKS
// =============================================

/**
 * Hook to create a new prescription item
 */
export const useCreatePrescriptionItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePrescriptionItemParams) => prescriptionService.createPrescriptionItem(data),

    onSettled: (data, error, variables) => {
      getInvalidationKeys.prescriptionItem(variables.prescription, data?.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to update a prescription item
 */
export const useUpdatePrescriptionItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePrescriptionItemParams) => prescriptionService.updatePrescriptionItem(data),

    onSettled: (data, error, variables) => {
      // We need to get the prescription ID from the updated item or context
      if (data) {
        getInvalidationKeys.prescriptionItem(data.prescription, variables.id).forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      } else {
        // Fallback: invalidate all prescription items
        queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionItems.lists() })
      }
    },
  })
}

/**
 * Hook to delete a prescription item
 */
export const useDeletePrescriptionItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => prescriptionService.deletePrescriptionItem(id),

    onSettled: (data, error, itemId) => {
      // Since we don't know the prescription ID after deletion, invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptionItems.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() })
    },
  })
}

// =============================================
// CUSTOM STATISTICS HOOKS
// =============================================

/**
 * Custom hook to get prescription statistics
 */
export const usePrescriptionStats = () => {
  const { data: prescriptions = [] } = usePrescriptions()

  return {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'submitted').length,
    validated: prescriptions.filter(p => p.status === 'validated').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
    cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
    expired: prescriptions.filter(p => p.is_expired).length,
    totalItems: prescriptions.reduce((sum, p) => sum + (p.total_items || 0), 0),
  }
}

/**
 * Custom hook to get prescription validation queue statistics
 */
export const usePrescriptionValidationStats = () => {
  const { data: pendingPrescriptions = [] } = usePendingPrescriptions()
  const { data: validatedPrescriptions = [] } = useValidatedPrescriptions()

  return {
    pendingValidation: pendingPrescriptions.length,
    awaitingDispensing: validatedPrescriptions.length,
    avgItemsPerPrescription: 
      pendingPrescriptions.length > 0 
        ? Math.round(pendingPrescriptions.reduce((sum, p) => sum + p.total_items, 0) / pendingPrescriptions.length * 10) / 10
        : 0,
  }
}