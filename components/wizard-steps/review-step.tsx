"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Download, Wifi, WifiOff, QrCode, Share } from "lucide-react"
import { useState } from "react"

interface ReviewStepProps {
  data: any
  updateData: (updates: any) => void
}

export function ReviewStep({ data, updateData }: ReviewStepProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [claimId, setClaimId] = useState("")

  const isComplete = data.claimType && data.claimantName && data.location && data.documents?.length > 0

  const requiredItems = [
    { label: "Claim Type Selected", completed: !!data.claimType },
    { label: "Documents Uploaded", completed: data.documents?.length > 0 },
    { label: "GPS Location Captured", completed: !!data.location },
    { label: "Personal Details", completed: !!data.claimantName },
    { label: "Gram Sabha Consent", completed: !!data.gramSabhaConsent || !!data.gramSabhaQR, optional: true },
  ]

  const submitClaim = async (saveOffline = false) => {
    setSubmitting(true)

    // Simulate submission process
    setTimeout(() => {
      const newClaimId = `FRA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
      setClaimId(newClaimId)
      setSubmitted(true)
      setSubmitting(false)
      setOfflineMode(saveOffline)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">दावा सफलतापूर्वक जमा किया गया!</h2>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Claim Successfully Submitted!</h3>
        </div>

        {/* Claim ID Card */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-lg text-green-900 mb-2">Your Claim ID</h3>
            <div className="text-3xl font-mono font-bold text-green-800 mb-4">{claimId}</div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QrCode className="h-24 w-24 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 mt-2">QR Code for sharing</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {offlineMode ? (
                <WifiOff className="h-5 w-5 text-orange-600" />
              ) : (
                <Wifi className="h-5 w-5 text-green-600" />
              )}
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {offlineMode ? (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-800 font-medium">Saved Offline</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your claim has been saved locally. It will be automatically submitted when you have internet
                  connection.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">Submitted Online</p>
                <p className="text-sm text-green-700 mt-1">
                  Your claim has been successfully submitted to the forest department for processing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">AI Processing (2-3 days)</p>
                <p className="text-sm text-slate-600">Documents will be processed and satellite imagery analyzed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">Official Review (7-14 days)</p>
                <p className="text-sm text-slate-600">Forest officials will verify your claim and documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">Final Decision (30-45 days)</p>
                <p className="text-sm text-slate-600">You will receive notification of approval or rejection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => (window.location.href = "/my-claims")}>
            View My Claims
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/claims/new")}>
            File Another Claim
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">समीक्षा और जमा करें</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Review & Submit</h3>
        <p className="text-slate-600">Please review all information before submitting</p>
      </div>

      {/* Completion Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Submission Checklist
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requiredItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
              )}
              <span
                className={`${item.completed ? "text-slate-900" : "text-slate-500"} ${item.optional ? "text-sm" : ""}`}
              >
                {item.label} {item.optional && "(Optional)"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claim Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Claim Type</p>
              <p className="text-slate-900">{data.claimType || "Not selected"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Claimant Name</p>
              <p className="text-slate-900">{data.claimantName || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Village</p>
              <p className="text-slate-900">{data.village || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">GPS Location</p>
              <p className="text-slate-900">
                {data.location ? `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}` : "Not captured"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Documents</p>
              <p className="text-slate-900">{data.documents?.length || 0} uploaded</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Audio Testimony</p>
              <p className="text-slate-900">{data.audioTestimony ? "Recorded" : "Not recorded"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => submitClaim(false)}
          disabled={!isComplete || submitting}
          className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
        >
          {submitting ? "Submitting..." : "Submit Claim Online"}
        </Button>

        <Button onClick={() => submitClaim(true)} disabled={submitting} variant="outline" className="w-full h-12">
          <Download className="h-4 w-4 mr-2" />
          Save Offline (Submit Later)
        </Button>
      </div>

      {!isComplete && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Complete Required Items</p>
                <p className="text-sm text-orange-800">
                  Please complete all required fields before submitting your claim.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
