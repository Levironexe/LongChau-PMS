"use client"

import React, { useState } from "react"
import { CustomerForm } from "./CustomerForm"
import { CreateCustomerInput, UpdateCustomerInput, CreateCustomerFactoryInput } from "@/lib/validations/customer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Test component to isolate and test the CustomerForm
export function CustomerFormTest() {
  const [useFactoryPattern, setUseFactoryPattern] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<any>(null)

  const handleSubmit = async (data: CreateCustomerInput | UpdateCustomerInput | CreateCustomerFactoryInput) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log("Form submitted with data:", data)
    setLastSubmission(data)
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    console.log("Form cancelled")
    setLastSubmission(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customer Form Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Form</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm
              useFactoryPattern={useFactoryPattern}
              onFactoryPatternChange={setUseFactoryPattern}
              canCreateCustomerViaFactory={true}
              canCreateVipCustomerViaFactory={true}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Submission Results */}
        <Card>
          <CardHeader>
            <CardTitle>Last Submission</CardTitle>
          </CardHeader>
          <CardContent>
            {lastSubmission ? (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(lastSubmission, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">No submissions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}