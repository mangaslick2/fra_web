"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, FileText, User, Camera, CheckCircle, X } from "lucide-react"
import { ClaimTypeStep } from "@/components/wizard-steps/claim-type-step"
import { DocumentsStep } from "@/components/wizard-steps/documents-step"
import { LocationStep } from "@/components/wizard-steps/location-step"
import { ClaimantDetailsStep } from "@/components/wizard-steps/claimant-details-step"
import { GramSabhaStep } from "@/components/wizard-steps/gram-sabha-step"
import { ReviewStep } from "@/components/wizard-steps/review-step"
import { offlineService, OfflineClaim } from "@/lib/offline-service"
import { useToast } from "@/hooks/use-toast"

interface ClaimData {
  claimType: string
  documents: File[]
  location: { lat: number; lng: number } | null
  boundaries: any[]
  claimantName: string
  fatherName: string
  address: string
  district: string
  block: string
  village: string
  phone: string
  gramSabhaConsent: File | null
  gramSabhaQR: string
  audioTestimony: File | null
}

const steps = [
  { id: "type", title: "Claim Type", icon: FileText, description: "Choose IFR, CFR, or CR", shortDesc: "Type" },
  { id: "documents", title: "Documents", icon: Camera, description: "Scan & upload documents", shortDesc: "Docs" },
  { id: "location", title: "Location", icon: MapPin, description: "Mark GPS & boundaries", shortDesc: "GPS" },
  { id: "details", title: "Your Details", icon: User, description: "Claimant information", shortDesc: "Details" },
  {
    id: "gram-sabha",
    title: "Gram Sabha",
    icon: CheckCircle,
    description: "Community confirmation",
    shortDesc: "Sabha",
  },
  { id: "review", title: "Review", icon: FileText, description: "Submit your claim", shortDesc: "Review" },
]

export function ClaimWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [claimData, setClaimData] = useState<ClaimData>({
    claimType: "",
    documents: [],
    location: null,
    boundaries: [],
    claimantName: "",
    fatherName: "",
    address: "",
    district: "",
    block: "",
    village: "",
    phone: "",
    gramSabhaConsent: null,
    gramSabhaQR: "",
    audioTestimony: null,
  })

  const updateClaimData = (updates: Partial<ClaimData>) => {
    setClaimData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // 1. Convert ClaimData to OfflineClaim format
      const documentsForOffline = await Promise.all(
        claimData.documents.map(async (file) => ({
          id: `doc_${Date.now()}_${file.name}`,
          type: file.type,
          filename: file.name,
          blob: file,
          checksum: await generateChecksum(file), // You'll need a checksum function
        }))
      )

      const audioRecordingsForOffline = claimData.audioTestimony
        ? [
            {
              id: `audio_${Date.now()}`,
              type: "testimony" as const,
              blob: claimData.audioTestimony,
              duration: 0, // You might need to calculate this
            },
          ]
        : []

      const offlineClaim: Partial<OfflineClaim> = {
        claimType: claimData.claimType as OfflineClaim['claimType'],
        claimantDetails: {
          name: claimData.claimantName,
          fatherName: claimData.fatherName,
          address: claimData.address,
          phone: claimData.phone,
        },
        documents: documentsForOffline,
        location: {
          latitude: claimData.location?.lat ?? 0,
          longitude: claimData.location?.lng ?? 0,
          polygon: claimData.boundaries,
        },
        audioRecordings: audioRecordingsForOffline,
        gramSabhaConsent: {
          minutesPhoto: claimData.gramSabhaConsent ?? undefined,
          qrCode: claimData.gramSabhaQR,
        },
        status: 'ready', // Ready to be synced
      }

      // 2. Save to offline service
      const savedId = await offlineService.saveClaim(offlineClaim)

      // 3. Give user feedback
      toast({
        title: "Claim Saved Offline",
        description: `Your claim (ID: ${savedId}) has been saved. It will be uploaded automatically when you're online.`,
      })

      // 4. Reset or redirect
      // For now, let's just go back to the first step
      setCurrentStep(0)
      setClaimData({
        claimType: "",
        documents: [],
        location: null,
        boundaries: [],
        claimantName: "",
        fatherName: "",
        address: "",
        district: "",
        block: "",
        village: "",
        phone: "",
        gramSabhaConsent: null,
        gramSabhaQR: "",
        audioTestimony: null,
      })
    } catch (error) {
      console.error("Failed to save claim offline", error)
      toast({
        title: "Error Saving Claim",
        description: "Could not save your claim locally. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isClaimDataValid = () => {
    // Add more comprehensive validation as needed
    return !!(claimData.claimType && claimData.claimantName && claimData.location);
  }

  // Helper to generate a checksum (example)
  const generateChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "type":
        return <ClaimTypeStep data={claimData} updateData={updateClaimData} />
      case "documents":
        return <DocumentsStep data={claimData} updateData={updateClaimData} />
      case "location":
        return <LocationStep data={claimData} updateData={updateClaimData} />
      case "details":
        return <ClaimantDetailsStep data={claimData} updateData={updateClaimData} />
      case "gram-sabha":
        return <GramSabhaStep data={claimData} updateData={updateClaimData} />
      case "review":
        return <ReviewStep data={claimData} updateData={updateClaimData} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8 md:hidden">
                <X className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-slate-900">New Forest Rights Claim</h1>
                <p className="text-sm text-slate-600 md:hidden">नया वन अधिकार दावा</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>

          <div className="mb-4">
            <Progress value={progress} className="h-3 md:h-2 bg-slate-200" />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Started</span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
              <span>Submit</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 md:w-6 md:h-6 bg-green-100 rounded-lg flex items-center justify-center">
              {React.createElement(steps[currentStep].icon, { className: "h-4 w-4 md:h-3 md:w-3 text-green-600" })}
            </div>
            <div className="flex-1">
              <span className="font-medium text-slate-900 block">{steps[currentStep].title}</span>
              <span className="text-slate-600 text-xs hidden md:block">{steps[currentStep].description}</span>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  index === currentStep
                    ? "bg-green-600 text-white"
                    : index < currentStep
                      ? "bg-green-100 text-green-600"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24 md:pb-6">{renderStep()}</div>
      </div>

      <div className="bg-white border-t border-slate-200 p-4 shadow-lg sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto">
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent h-10"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? "bg-slate-900" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
              disabled={isSubmitting || (currentStep === steps.length - 1 && !isClaimDataValid())}
              className="flex items-center gap-2 h-10"
            >
              {isSubmitting ? (
                "Saving..."
              ) : currentStep === steps.length - 1 ? (
                "Save Claim Offline"
              ) : (
                "Next"
              )}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 h-12 text-base bg-transparent"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                disabled={isSubmitting || (currentStep === steps.length - 1 && !isClaimDataValid())}
                className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : currentStep === steps.length - 1 ? (
                  "Save Offline"
                ) : (
                  "Continue"
                )}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Mobile step indicator */}
            <div className="flex justify-center gap-1">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    index <= currentStep ? "bg-green-600" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
