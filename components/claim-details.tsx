"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Satellite,
} from "lucide-react"
import Link from "next/link"

interface ClaimDetailsProps {
  claimId: string
}

export function ClaimDetails({ claimId }: ClaimDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Sample data - in real app, fetch from Supabase based on claimId
  const claim = {
    id: claimId,
    claimNumber: "CG24-001",
    claimType: "individual",
    claimantName: "राम कुमार",
    fatherName: "श्याम कुमार",
    phone: "+91 9876543210",
    address: "Village Kumhrawand, Post Jagdalpur",
    district: "Bastar",
    block: "Jagdalpur",
    village: "Kumhrawand",
    surveyNumber: "123/4",
    areaClaimed: 2.5,
    landType: "agricultural",
    status: "under_review",
    submittedAt: "2024-01-15",
    updatedAt: "2024-01-20",
    aiProcessingStatus: "completed",
    boundaries: [
      { lat: 19.0896, lng: 82.1472 },
      { lat: 19.0906, lng: 82.1482 },
      { lat: 19.0886, lng: 82.1492 },
      { lat: 19.0876, lng: 82.1462 },
    ],
    documents: [
      { id: "1", type: "identity_proof", name: "Aadhaar Card", status: "processed", confidence: 0.95 },
      { id: "2", type: "residence_proof", name: "Ration Card", status: "processed", confidence: 0.88 },
      { id: "3", type: "land_records", name: "Revenue Record", status: "processing", confidence: null },
    ],
    timeline: [
      { date: "2024-01-15", event: "Claim submitted", status: "completed" },
      { date: "2024-01-16", event: "Documents uploaded", status: "completed" },
      { date: "2024-01-17", event: "AI processing started", status: "completed" },
      { date: "2024-01-18", event: "Asset detection completed", status: "completed" },
      { date: "2024-01-20", event: "Under official review", status: "current" },
      { date: "TBD", event: "Field verification", status: "pending" },
      { date: "TBD", event: "Final decision", status: "pending" },
    ],
    aiResults: {
      assetsDetected: 3,
      confidence: 0.92,
      recommendations: [
        "Agricultural land use confirmed",
        "No encroachment detected",
        "Boundaries match survey records",
      ],
    },
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "pending_documents":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-slate-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending_documents":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "submitted":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const currentStep = claim.timeline.findIndex((t) => t.status === "current")
  const progress = currentStep >= 0 ? ((currentStep + 1) / claim.timeline.length) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/claims">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{claim.claimNumber}</h1>
            <p className="text-slate-600">{claim.claimantName}</p>
          </div>
          <Badge className={`${getStatusColor(claim.status)} border`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(claim.status)}
              {claim.status.replace("_", " ")}
            </div>
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900 font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="ai-results">AI Results</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Claim Type</p>
                    <p className="text-slate-900 capitalize">{claim.claimType} Forest Rights</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Area Claimed</p>
                    <p className="text-slate-900">{claim.areaClaimed} hectares</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Land Type</p>
                    <p className="text-slate-900 capitalize">{claim.landType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Survey Number</p>
                    <p className="text-slate-900">{claim.surveyNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Claimant Name</p>
                    <p className="text-slate-900">{claim.claimantName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Father's Name</p>
                    <p className="text-slate-900">{claim.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Phone</p>
                    <p className="text-slate-900">{claim.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Location</p>
                    <p className="text-slate-900">
                      {claim.village}, {claim.block}, {claim.district}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Land Boundaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-green-50 to-blue-50 border border-slate-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 font-medium">Claim Boundaries</p>
                      <p className="text-sm text-slate-500">{claim.boundaries.length} boundary points marked</p>
                    </div>
                  </div>
                  {/* Boundary visualization would go here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {claim.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-600 capitalize">{doc.type.replace("_", " ")}</p>
                        {doc.confidence && (
                          <p className="text-xs text-green-600">OCR Confidence: {Math.round(doc.confidence * 100)}%</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          doc.status === "processed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : event.status === "current"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {event.status === "completed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : event.status === "current" ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${event.status === "current" ? "text-blue-900" : "text-slate-900"}`}>
                          {event.event}
                        </p>
                        <p className="text-sm text-slate-600">
                          {event.date === "TBD" ? "To be determined" : new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{claim.aiResults.assetsDetected}</p>
                    <p className="text-sm text-slate-600">Assets Detected</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{Math.round(claim.aiResults.confidence * 100)}%</p>
                    <p className="text-sm text-slate-600">Confidence Score</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">✓</p>
                    <p className="text-sm text-slate-600">Processing Complete</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {claim.aiResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 flex-1 bg-transparent">
            <MessageSquare className="h-4 w-4" />
            Contact Official
          </Button>
          <Button variant="outline" className="flex items-center gap-2 flex-1 bg-transparent">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}
