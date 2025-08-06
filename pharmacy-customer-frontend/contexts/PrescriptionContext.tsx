"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PrescriptionUpload, PrescriptionFormData, UploadedFile } from '@/lib/types'
import { useAuth } from './AuthContext'
import { useToast } from '@/hooks/use-toast'

interface PrescriptionContextType {
  prescriptions: PrescriptionUpload[]
  isLoading: boolean
  submitPrescription: (formData: PrescriptionFormData, files: UploadedFile[]) => Promise<string>
  getPrescriptionById: (id: string) => PrescriptionUpload | undefined
  deletePrescription: (id: string) => void
  updatePrescriptionStatus: (id: string, status: PrescriptionUpload['status'], notes?: string) => void
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined)

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<PrescriptionUpload[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load prescriptions from localStorage on mount
  useEffect(() => {
    if (user) {
      loadPrescriptions()
    }
  }, [user])

  const getStorageKey = () => `prescriptions_${user?.id || 'anonymous'}`

  const loadPrescriptions = () => {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const parsedPrescriptions = JSON.parse(stored)
        setPrescriptions(parsedPrescriptions)
      }
    } catch (error) {
      console.error('Failed to load prescriptions from localStorage:', error)
    }
  }

  const savePrescriptions = (prescriptionList: PrescriptionUpload[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(prescriptionList))
    } catch (error) {
      console.error('Failed to save prescriptions to localStorage:', error)
    }
  }

  const submitPrescription = async (formData: PrescriptionFormData, files: UploadedFile[]): Promise<string> => {
    setIsLoading(true)

    try {
      // Validate that we have uploaded files
      const uploadedFiles = files.filter(f => f.status === 'uploaded')
      if (uploadedFiles.length === 0) {
        throw new Error('Please upload at least one prescription file before submitting.')
      }

      // Create new prescription record
      const newPrescription: PrescriptionUpload = {
        id: `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientName: formData.patientName,
        dateOfBirth: formData.dateOfBirth,
        doctorName: formData.doctorName,
        doctorLicense: formData.doctorLicense,
        issueDate: formData.issueDate,
        files: uploadedFiles,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }

      // Simulate API submission delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add to prescriptions list
      const updatedPrescriptions = [newPrescription, ...prescriptions]
      setPrescriptions(updatedPrescriptions)
      savePrescriptions(updatedPrescriptions)

      // Simulate automatic status progression for demo purposes
      setTimeout(() => {
        updatePrescriptionStatus(newPrescription.id, 'under_review')
      }, 3000)

      // Simulate review completion for demo
      setTimeout(() => {
        const shouldApprove = Math.random() > 0.2 // 80% approval rate
        updatePrescriptionStatus(
          newPrescription.id,
          shouldApprove ? 'approved' : 'rejected',
          shouldApprove 
            ? 'Prescription verified and approved for dispensing.'
            : 'Missing required information. Please resubmit with clearer images.'
        )
      }, 8000)

      toast({
        title: "Prescription submitted successfully! 🎉",
        description: "Your prescription has been submitted for review. You'll be notified once it's processed.",
        variant: "success",
      })

      return newPrescription.id
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit prescription'
      
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      })
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getPrescriptionById = (id: string): PrescriptionUpload | undefined => {
    return prescriptions.find(p => p.id === id)
  }

  const deletePrescription = (id: string) => {
    const prescription = prescriptions.find(p => p.id === id)
    if (!prescription) return

    // Clean up blob URLs to prevent memory leaks
    prescription.files.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    })

    const updatedPrescriptions = prescriptions.filter(p => p.id !== id)
    setPrescriptions(updatedPrescriptions)
    savePrescriptions(updatedPrescriptions)

    toast({
      title: "Prescription deleted",
      description: "The prescription has been removed from your records.",
    })
  }

  const updatePrescriptionStatus = (
    id: string, 
    status: PrescriptionUpload['status'], 
    notes?: string
  ) => {
    setPrescriptions(prevPrescriptions => {
      const updatedPrescriptions = prevPrescriptions.map(p => 
        p.id === id 
          ? { 
              ...p, 
              status,
              reviewNotes: notes || p.reviewNotes,
              reviewedAt: new Date().toISOString(),
              reviewedBy: status === 'pending' ? undefined : 'System Pharmacist'
            }
          : p
      )
      
      savePrescriptions(updatedPrescriptions)

      // Show toast notification for status changes
      const prescription = updatedPrescriptions.find(p => p.id === id)
      if (prescription && status !== 'pending') {
        const statusMessages = {
          under_review: 'Your prescription is now under review',
          approved: 'Your prescription has been approved! 🎉',
          rejected: 'Your prescription requires attention'
        }

        toast({
          title: `Prescription ${status.replace('_', ' ')}`,
          description: statusMessages[status] || `Status updated to ${status}`,
          variant: status === 'approved' ? 'success' : 
                  status === 'rejected' ? 'destructive' : 'default',
        })
      }
      
      return updatedPrescriptions
    })
  }

  // Mock function to generate sample prescription history for testing
  const generateSampleHistory = () => {
    if (prescriptions.length > 0) return // Don't generate if we already have data

    const samplePrescriptions: PrescriptionUpload[] = [
      {
        id: 'rx_sample_1',
        patientName: 'John Doe',
        dateOfBirth: '1990-05-15',
        doctorName: 'Dr. Smith',
        doctorLicense: 'MD123456',
        issueDate: '2024-01-15',
        files: [
          {
            id: 'file_1',
            name: 'prescription_jan_2024.pdf',
            size: 2048576,
            type: 'application/pdf',
            url: '/sample-prescription.pdf',
            uploadedAt: '2024-01-15T10:30:00Z',
            status: 'uploaded'
          }
        ],
        status: 'approved',
        submittedAt: '2024-01-15T10:30:00Z',
        reviewedAt: '2024-01-15T14:20:00Z',
        reviewedBy: 'Dr. Johnson',
        reviewNotes: 'Prescription verified and approved for dispensing.'
      },
      {
        id: 'rx_sample_2',
        patientName: 'Jane Doe',
        dateOfBirth: '1985-08-22',
        doctorName: 'Dr. Wilson',
        doctorLicense: 'MD789012',
        issueDate: '2024-01-10',
        files: [
          {
            id: 'file_2',
            name: 'prescription_image.jpg',
            size: 1536000,
            type: 'image/jpeg',
            url: '/sample-prescription-image.jpg',
            uploadedAt: '2024-01-10T09:15:00Z',
            status: 'uploaded'
          }
        ],
        status: 'under_review',
        submittedAt: '2024-01-10T09:15:00Z'
      }
    ]

    setPrescriptions(samplePrescriptions)
    savePrescriptions(samplePrescriptions)
  }

  // Auto-generate sample data for demo purposes
  useEffect(() => {
    if (user && prescriptions.length === 0) {
      // Delay to avoid showing sample data immediately
      const timer = setTimeout(() => {
        generateSampleHistory()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user, prescriptions.length])

  const value = {
    prescriptions,
    isLoading,
    submitPrescription,
    getPrescriptionById,
    deletePrescription,
    updatePrescriptionStatus,
  }

  return (
    <PrescriptionContext.Provider value={value}>
      {children}
    </PrescriptionContext.Provider>
  )
}

export function usePrescription() {
  const context = useContext(PrescriptionContext)
  if (context === undefined) {
    throw new Error('usePrescription must be used within a PrescriptionProvider')
  }
  return context
}