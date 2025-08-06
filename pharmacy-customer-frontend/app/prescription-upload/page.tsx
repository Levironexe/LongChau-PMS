"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/ui/file-upload'
import { PrescriptionHistory } from '@/components/prescription-history'
import { useAuth } from '@/contexts/AuthContext'
import { usePrescription } from '@/contexts/PrescriptionContext'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  AlertCircle, 
  User,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  History
} from 'lucide-react'
import { PrescriptionFormData, UploadedFile } from '@/lib/types'

export default function PrescriptionUploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { submitPrescription, isLoading } = usePrescription()
  const { toast } = useToast()

  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientName: user?.name || '',
    dateOfBirth: '',
    doctorName: '',
    doctorLicense: '',
    issueDate: '',
    notes: '',
  })
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      }
    }

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required'
    }

    if (!formData.doctorLicense.trim()) {
      newErrors.doctorLicense = 'Doctor license number is required'
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required'
    } else {
      const issueDate = new Date(formData.issueDate)
      const today = new Date()
      if (issueDate > today) {
        newErrors.issueDate = 'Issue date cannot be in the future'
      }
    }

    const uploadedFiles = files.filter(f => f.status === 'uploaded')
    if (uploadedFiles.length === 0) {
      newErrors.files = 'At least one prescription file must be uploaded'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PrescriptionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload prescriptions.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    if (!validateForm()) {
      toast({
        title: "Please correct the errors",
        description: "Check the form for validation errors.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const prescriptionId = await submitPrescription(formData, files)
      
      // Reset form after successful submission
      setFormData({
        patientName: user.name || '',
        dateOfBirth: '',
        doctorName: '',
        doctorLicense: '',
        issueDate: '',
        notes: '',
      })
      setFiles([])
      setErrors({})

      // Optionally redirect to history tab or stay on upload tab
      // router.push(`/prescription-upload?tab=history&id=${prescriptionId}`)
      
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    
    // Clear files error when files are added
    if (errors.files && newFiles.some(f => f.status === 'uploaded')) {
      setErrors(prev => ({ ...prev, files: '' }))
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Card>
          <CardContent className="py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to upload and manage your prescriptions.
            </p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Prescription Management
        </h1>
        <p className="text-gray-600">
          Upload new prescriptions or view your submission history
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Prescription
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Upload History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          {/* Important Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Upload clear photos or scans of your prescription documents
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Prescription must be issued by a licensed healthcare provider
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Our licensed pharmacists will review and validate your prescription
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  You&apos;ll receive notifications about approval status within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Approved prescriptions can be filled and delivered to your address
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <Input
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                        placeholder="Enter patient's full name"
                        className={errors.patientName ? 'border-red-500' : ''}
                      />
                      {errors.patientName && (
                        <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Healthcare Provider Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Name *
                      </label>
                      <Input
                        value={formData.doctorName}
                        onChange={(e) => handleInputChange('doctorName', e.target.value)}
                        placeholder="Dr. John Smith"
                        className={errors.doctorName ? 'border-red-500' : ''}
                      />
                      {errors.doctorName && (
                        <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical License Number *
                      </label>
                      <Input
                        value={formData.doctorLicense}
                        onChange={(e) => handleInputChange('doctorLicense', e.target.value)}
                        placeholder="MD123456789"
                        className={errors.doctorLicense ? 'border-red-500' : ''}
                      />
                      {errors.doctorLicense && (
                        <p className="text-red-500 text-xs mt-1">{errors.doctorLicense}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prescription Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Prescription Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => handleInputChange('issueDate', e.target.value)}
                        className={errors.issueDate ? 'border-red-500' : ''}
                      />
                      {errors.issueDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <Input
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional information..."
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upload Prescription Files *
                  </h3>
                  
                  <FileUpload
                    files={files}
                    onFilesChange={handleFilesChange}
                    maxFiles={5}
                    maxSize={10}
                    disabled={isSubmitting}
                    className={errors.files ? 'border-red-500 rounded-lg' : ''}
                  />
                  
                  {errors.files && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.files}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting Prescription...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Submit Prescription for Review
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <PrescriptionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}