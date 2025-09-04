"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, QrCode, FileText, CheckCircle } from "lucide-react"
import { useState } from "react"

interface GramSabhaStepProps {
  data: any
  updateData: (updates: any) => void
}

export function GramSabhaStep({ data, updateData }: GramSabhaStepProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [scanningQR, setScanningQR] = useState(false)

  const handlePhotoUpload = () => {
    setUploadingPhoto(true)
    // Simulate photo upload
    setTimeout(() => {
      updateData({ gramSabhaConsent: new File([], "gram-sabha-minutes.jpg") })
      setUploadingPhoto(false)
    }, 2000)
  }

  const handleQRScan = () => {
    setScanningQR(true)
    // Simulate QR scan
    setTimeout(() => {
      updateData({ gramSabhaQR: "GS-2024-001-VERIFIED" })
      setScanningQR(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">ग्राम सभा की सहमति</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Gram Sabha Confirmation</h3>
        <p className="text-slate-600">Upload meeting minutes or scan QR code</p>
      </div>

      {/* Meeting Minutes Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Meeting Minutes Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.gramSabhaConsent ? (
            <Button
              onClick={handlePhotoUpload}
              disabled={uploadingPhoto}
              className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-6 w-6 mr-2" />
              {uploadingPhoto ? "Uploading..." : "Take Photo of Minutes"}
            </Button>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">Meeting minutes uploaded!</p>
              </div>
              <Button variant="outline" size="sm" onClick={handlePhotoUpload} className="mt-2 bg-transparent">
                Upload Different Photo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-purple-600" />
            QR Code Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.gramSabhaQR ? (
            <Button
              onClick={handleQRScan}
              disabled={scanningQR}
              variant="outline"
              className="w-full h-16 text-lg bg-transparent"
            >
              <QrCode className="h-6 w-6 mr-2" />
              {scanningQR ? "Scanning QR Code..." : "Scan Gram Sabha QR"}
            </Button>
          ) : (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <p className="text-purple-800 font-medium">QR Code verified!</p>
              </div>
              <p className="text-sm text-purple-600 mt-1">Code: {data.gramSabhaQR}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Option */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-sm">Alternative: Mark for Later Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="gramSabhaNote" className="text-sm">
              Note about Gram Sabha consent (optional)
            </Label>
            <Input id="gramSabhaNote" placeholder="e.g., Meeting scheduled for next week" className="h-10" />
            <p className="text-xs text-slate-500">
              You can submit without Gram Sabha consent and add it later during verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
