"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from "lucide-react"

export default function PrescriptionUploadPage() {
  const [prescriptionData, setPrescriptionData] = useState({
    patient_name: "",
    patient_dob: "",
    doctor_name: "",
    doctor_license: "",
    issue_date: "",
    notes: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, upload file and create prescription record
    alert("Prescription uploaded successfully! Our pharmacist will review it within 24 hours.")
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Prescription</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <AlertCircle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Upload a clear photo or scan of your prescription</li>
            <li>• Prescription must be issued by a licensed doctor</li>
            <li>• Our pharmacist will review and validate your prescription</li>
            <li>{"• You'll be notified within 24 hours about approval status"}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient Name *</label>
                <Input
                  value={prescriptionData.patient_name}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, patient_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Patient Date of Birth *</label>
                <Input
                  type="date"
                  value={prescriptionData.patient_dob}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, patient_dob: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor Name *</label>
                <Input
                  value={prescriptionData.doctor_name}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, doctor_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Doctor License Number *</label>
                <Input
                  value={prescriptionData.doctor_license}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, doctor_license: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prescription Issue Date *</label>
              <Input
                type="date"
                value={prescriptionData.issue_date}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, issue_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload Prescription Image *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG or PDF up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Any additional information for the pharmacist..."
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Upload Prescription
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
