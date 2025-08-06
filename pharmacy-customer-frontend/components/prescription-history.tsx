"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  Trash2,
  Loader2,
  FileImage,
  File
} from 'lucide-react'
import { usePrescription } from '@/contexts/PrescriptionContext'
import { PrescriptionUpload } from '@/lib/types'

export function PrescriptionHistory() {
  const { prescriptions, deletePrescription } = usePrescription()
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null)

  const getStatusColor = (status: PrescriptionUpload['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: PrescriptionUpload['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'under_review':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const groupedPrescriptions = {
    recent: prescriptions.filter(p => {
      const submittedDate = new Date(p.submittedAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return submittedDate > thirtyDaysAgo
    }),
    all: prescriptions
  }

  const PrescriptionCard = ({ prescription }: { prescription: PrescriptionUpload }) => {
    const isExpanded = selectedPrescription === prescription.id

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg">{prescription.patientName}</CardTitle>
                <Badge className={getStatusColor(prescription.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(prescription.status)}
                    {prescription.status.replace('_', ' ')}
                  </div>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Dr. {prescription.doctorName}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Issued: {new Date(prescription.issueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted: {formatDate(prescription.submittedAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPrescription(isExpanded ? null : prescription.id)}
              >
                <Eye className="h-4 w-4" />
                {isExpanded ? 'Hide' : 'View'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deletePrescription(prescription.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              {/* Patient Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Date of Birth:</strong> {new Date(prescription.dateOfBirth).toLocaleDateString()}</div>
                    <div><strong>Doctor:</strong> Dr. {prescription.doctorName}</div>
                    <div><strong>License:</strong> {prescription.doctorLicense}</div>
                    <div><strong>Issue Date:</strong> {new Date(prescription.issueDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Current Status:</strong> {prescription.status.replace('_', ' ')}</div>
                    <div><strong>Submitted:</strong> {formatDate(prescription.submittedAt)}</div>
                    {prescription.reviewedAt && (
                      <>
                        <div><strong>Reviewed:</strong> {formatDate(prescription.reviewedAt)}</div>
                        {prescription.reviewedBy && (
                          <div><strong>Reviewed by:</strong> {prescription.reviewedBy}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              {prescription.reviewNotes && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                  <div className={`p-3 rounded-lg text-sm ${
                    prescription.status === 'approved' ? 'bg-green-50 text-green-800' :
                    prescription.status === 'rejected' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {prescription.reviewNotes}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Uploaded Files ({prescription.files.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {prescription.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-shrink-0 text-gray-500">
                        {getFileIcon(file.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {file.status}
                          </Badge>
                        </div>
                      </div>

                      {/* File Preview for Images */}
                      {file.type.startsWith('image/') && (
                        <div className="flex-shrink-0">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = file.url
                            link.download = file.name
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No prescriptions uploaded yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first prescription to get started with online pharmacy services.
          </p>
          <Button onClick={() => window.location.href = '/prescription-upload'}>
            <FileText className="h-4 w-4 mr-2" />
            Upload Prescription
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Prescription History
        </h2>
        <Button onClick={() => window.location.href = '/prescription-upload'}>
          <FileText className="h-4 w-4 mr-2" />
          Upload New Prescription
        </Button>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">
            Recent (Last 30 days) - {groupedPrescriptions.recent.length}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Time - {groupedPrescriptions.all.length}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          {groupedPrescriptions.recent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No recent prescription uploads.</p>
              </CardContent>
            </Card>
          ) : (
            groupedPrescriptions.recent.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {groupedPrescriptions.all.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}