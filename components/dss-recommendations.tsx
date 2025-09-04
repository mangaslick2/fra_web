"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Target, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Users, 
  Star, 
  AlertCircle,
  TrendingUp,
  Droplets,
  TreePine,
  Sprout,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  Lightbulb,
  Volume2,
  Download,
  Filter,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { audioService } from '@/lib/audio-service'

interface Scheme {
  id: string
  name: string
  nameHi: string
  reason: string
  reasonHi: string
  priority: number
  confidence: number
  action: "apply" | "create_list"
  eligible: boolean
  category: string
  benefits: string
  benefitsHi: string
  requiredDocs: string[]
  timeline: string
  fundingSource: string
  potentialBeneficiaries: number
  estimatedBenefit: string
  actionSteps: string[]
  eligibilityChecklist: { item: string; status: "met" | "not_met" | "partial" }[]
  contactInfo: {
    department: string
    phone: string
    email: string
  }
}

interface Village {
  name: string
  nameHi: string
  pattaNumber: string
  households: number
  district: string
  state: string
  forestCoverPercent: number
  waterBodyCount: number
  fraClaims: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
}

interface DSSIndicator {
  id: string
  name: string
  nameHi: string
  value: number
  trend: 'up' | 'down' | 'stable'
  category: string
  description: string
  threshold: {
    good: number
    warning: number
    critical: number
  }
}

export function DSSRecommendations() {
  const [selectedVillage] = useState<Village>({
    name: "Jhiroli Village",
    pattaNumber: "JH-2024-001",
    households: 45,
  })

  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const schemes: Scheme[] = [
    {
      id: "pmay_001",
      name: "PM Awas Yojana",
      reason: "High number of kutcha houses detected via satellite imagery",
      priority: 92,
      action: "create_list",
      eligible: true,
      category: "Housing",
      benefits: "Up to ₹1.2 lakh for house construction/upgrade",
      requiredDocs: ["Aadhaar Card", "Income Certificate", "Land Documents", "Bank Account"],
      eligibilityChecklist: [
        { item: "Annual income below ₹3 lakh", status: "met" },
        { item: "No pucca house owned", status: "met" },
        { item: "Valid land documents", status: "partial" },
        { item: "Bank account linked to Aadhaar", status: "met" },
      ],
    },
    {
      id: "mgnrega_001",
      name: "MGNREGA Water Conservation",
      reason: "Low water index and drought vulnerability detected",
      priority: 88,
      action: "apply",
      eligible: true,
      category: "Water & Agriculture",
      benefits: "100 days guaranteed employment + water infrastructure",
      requiredDocs: ["Job Card", "Village Resolution", "Technical Estimate"],
      eligibilityChecklist: [
        { item: "Active MGNREGA job card", status: "met" },
        { item: "Gram Sabha approval", status: "not_met" },
        { item: "Technical feasibility", status: "met" },
      ],
    },
    {
      id: "pmkisan_001",
      name: "PM-KISAN",
      reason: "Agricultural land detected but low enrollment rate",
      priority: 75,
      action: "create_list",
      eligible: true,
      category: "Agriculture",
      benefits: "₹6,000 per year direct cash transfer",
      requiredDocs: ["Land Records", "Aadhaar Card", "Bank Account"],
      eligibilityChecklist: [
        { item: "Cultivable land ownership", status: "met" },
        { item: "Land size below 2 hectares", status: "met" },
        { item: "Valid land records", status: "partial" },
      ],
    },
    {
      id: "solar_001",
      name: "Solar Pump Scheme",
      reason: "Good solar potential and irrigation needs identified",
      priority: 68,
      action: "apply",
      eligible: false,
      category: "Energy",
      benefits: "90% subsidy on solar irrigation pumps",
      requiredDocs: ["Electricity Connection", "Land Documents", "Water Source Proof"],
      eligibilityChecklist: [
        { item: "Existing bore well/water source", status: "not_met" },
        { item: "Minimum 1 acre irrigated land", status: "met" },
        { item: "Electricity connection", status: "partial" },
      ],
    },
  ]

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return "bg-red-500"
    if (priority >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "not_met":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">DSS Recommendations</h1>
            <p className="text-sm text-gray-600">{selectedVillage.name}</p>
          </div>
        </div>
      </div>

      {/* Village Info */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">{selectedVillage.name}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Patta Number:</span>
            <p className="font-medium">{selectedVillage.pattaNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">Households:</span>
            <p className="font-medium">{selectedVillage.households}</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Recommended Interventions ({schemes.length})</h3>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {schemes.map((scheme) => (
          <Card
            key={scheme.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedScheme(scheme)
              setShowDetails(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{scheme.name}</h4>
                    {scheme.eligible ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Eligible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Not Eligible
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scheme.reason}</p>
                  <Badge variant="outline" className="text-xs">
                    {scheme.category}
                  </Badge>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{scheme.priority}</span>
                  </div>
                  <div className="w-16">
                    <Progress value={scheme.priority} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Action: <span className="font-medium capitalize">{scheme.action.replace("_", " ")}</span>
                </span>
                {scheme.action === "create_list" && (
                  <Button size="sm" variant="outline">
                    <Users className="w-4 h-4 mr-1" />
                    Create List
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheme Details Modal */}
      {showDetails && selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <Card className="w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedScheme.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <p className="text-sm text-gray-600">{selectedScheme.benefits}</p>
              </div>

              {/* Eligibility Checklist */}
              <div>
                <h4 className="font-semibold mb-3">Eligibility Checklist</h4>
                <div className="space-y-2">
                  {selectedScheme.eligibilityChecklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      {getStatusIcon(item.status)}
                      <span className="text-sm flex-1">{item.item}</span>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "met"
                            ? "bg-green-50 text-green-700"
                            : item.status === "not_met"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                        }
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="font-semibold mb-3">Required Documents</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedScheme.requiredDocs.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedScheme.eligible ? (
                  <>
                    <Button className="flex-1">Apply Now</Button>
                    {selectedScheme.action === "create_list" && (
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Users className="w-4 h-4 mr-2" />
                        Create Beneficiary List
                      </Button>
                    )}
                  </>
                ) : (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Not Currently Eligible
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
