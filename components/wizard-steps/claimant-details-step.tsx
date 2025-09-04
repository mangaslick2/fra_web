"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Scan } from "lucide-react"
import { useState } from "react"

interface ClaimantDetailsStepProps {
  data: any
  updateData: (updates: any) => void
}

export function ClaimantDetailsStep({ data, updateData }: ClaimantDetailsStepProps) {
  const [recording, setRecording] = useState(false)
  const [ocrProcessing, setOcrProcessing] = useState(false)

  const triggerOCR = () => {
    setOcrProcessing(true)
    // Simulate OCR processing
    setTimeout(() => {
      updateData({
        claimantName: "राम कुमार - Ram Kumar",
        fatherName: "श्याम लाल - Shyam Lal",
        village: "सरायकेला - Saraykela",
      })
      setOcrProcessing(false)
    }, 2000)
  }

  const toggleRecording = () => {
    setRecording(!recording)
    if (!recording) {
      // Start recording
      setTimeout(() => {
        setRecording(false)
        // Simulate transcription
        updateData({
          claimantName: data.claimantName || "राम कुमार - Ram Kumar (from audio)",
        })
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">आपकी जानकारी</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Your Details</h3>
        <p className="text-slate-600">Enter your personal information</p>
      </div>

      {/* OCR Helper */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Auto-fill from documents</p>
              <p className="text-sm text-blue-700">Scan your ID card or documents</p>
            </div>
            <Button onClick={triggerOCR} disabled={ocrProcessing} variant="outline" className="bg-white">
              <Scan className="h-4 w-4 mr-2" />
              {ocrProcessing ? "Scanning..." : "Scan ID"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Recording */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-900">Voice Input</p>
              <p className="text-sm text-orange-700">Record your details in your language</p>
            </div>
            <Button
              onClick={toggleRecording}
              variant={recording ? "destructive" : "outline"}
              className={recording ? "" : "bg-white"}
            >
              {recording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {recording ? "Stop Recording" : "Record Audio"}
            </Button>
          </div>
          {recording && (
            <div className="mt-2 text-sm text-orange-700">
              🔴 Recording... Speak clearly in Hindi or your local language
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="claimantName" className="text-base font-medium">
            नाम / Name *
          </Label>
          <Input
            id="claimantName"
            value={data.claimantName}
            onChange={(e) => updateData({ claimantName: e.target.value })}
            placeholder="अपना पूरा नाम लिखें / Enter your full name"
            className="h-12 text-lg"
          />
        </div>

        <div>
          <Label htmlFor="fatherName" className="text-base font-medium">
            पिता का नाम / Father's Name *
          </Label>
          <Input
            id="fatherName"
            value={data.fatherName}
            onChange={(e) => updateData({ fatherName: e.target.value })}
            placeholder="पिता का पूरा नाम / Father's full name"
            className="h-12 text-lg"
          />
        </div>

        <div>
          <Label htmlFor="village" className="text-base font-medium">
            गांव / Village *
          </Label>
          <Input
            id="village"
            value={data.village}
            onChange={(e) => updateData({ village: e.target.value })}
            placeholder="गांव का नाम / Village name"
            className="h-12 text-lg"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-base font-medium">
            मोबाइल नंबर / Mobile Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="10 digit mobile number"
            className="h-12 text-lg"
          />
        </div>
      </div>
    </div>
  )
}
