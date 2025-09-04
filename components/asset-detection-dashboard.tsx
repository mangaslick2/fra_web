"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Satellite,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  TreePine,
  Droplets,
  Square,
} from "lucide-react"
import Link from "next/link"

interface AssetDetection {
  id: string
  claimId: string
  claimNumber: string
  claimantName: string
  assetType: "building" | "agricultural_land" | "water_body" | "forest_cover" | "road" | "boundary_marker"
  confidence: number
  area: number
  status: "pending" | "verified" | "rejected"
  detectionDate: string
  satelliteImageDate: string
  coordinates: { lat: number; lng: number }
}

export function AssetDetectionDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assetTypeFilter, setAssetTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("recent")

  // Sample data - in real app, fetch from Supabase
  const sampleDetections: AssetDetection[] = [
    {
      id: "1",
      claimId: "1",
      claimNumber: "CG24-001",
      claimantName: "राम कुमार",
      assetType: "building",
      confidence: 0.94,
      area: 120,
      status: "verified",
      detectionDate: "2024-01-18",
      satelliteImageDate: "2024-01-15",
      coordinates: { lat: 19.0896, lng: 82.1472 },
    },
    {
      id: "2",
      claimId: "1",
      claimNumber: "CG24-001",
      claimantName: "राम कुमार",
      assetType: "agricultural_land",
      confidence: 0.89,
      area: 2400,
      status: "verified",
      detectionDate: "2024-01-18",
      satelliteImageDate: "2024-01-15",
      coordinates: { lat: 19.0906, lng: 82.1482 },
    },
    {
      id: "3",
      claimId: "2",
      claimNumber: "CG24-002",
      claimantName: "सीता देवी",
      assetType: "water_body",
      confidence: 0.76,
      area: 300,
      status: "pending",
      detectionDate: "2024-01-20",
      satelliteImageDate: "2024-01-18",
      coordinates: { lat: 19.0886, lng: 82.1492 },
    },
    {
      id: "4",
      claimId: "3",
      claimNumber: "DRAFT-003",
      claimantName: "गोपाल सिंह",
      assetType: "forest_cover",
      confidence: 0.92,
      area: 1800,
      status: "pending",
      detectionDate: "2024-01-22",
      satelliteImageDate: "2024-01-20",
      coordinates: { lat: 19.0876, lng: 82.1462 },
    },
  ]

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "building":
        return <Building className="h-4 w-4" />
      case "agricultural_land":
        return <Square className="h-4 w-4" />
      case "water_body":
        return <Droplets className="h-4 w-4" />
      case "forest_cover":
        return <TreePine className="h-4 w-4" />
      default:
        return <Satellite className="h-4 w-4" />
    }
  }

  const getAssetColor = (type: string) => {
    switch (type) {
      case "building":
        return "bg-red-100 text-red-800 border-red-200"
      case "agricultural_land":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "water_body":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "forest_cover":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200"
    }
  }

  const filteredDetections = sampleDetections.filter((detection) => {
    const matchesSearch =
      detection.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detection.claimNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || detection.status === statusFilter
    const matchesAssetType = assetTypeFilter === "all" || detection.assetType === assetTypeFilter

    return matchesSearch && matchesStatus && matchesAssetType
  })

  const getTabCounts = () => {
    const recent = sampleDetections.length
    const pending = sampleDetections.filter((d) => d.status === "pending").length
    const verified = sampleDetections.filter((d) => d.status === "verified").length
    return { recent, pending, verified }
  }

  const tabCounts = getTabCounts()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Asset Detection</h1>
            <p className="text-slate-600">AI-powered satellite imagery analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-slate-600" />
            <span className="text-sm text-slate-600">Last updated: 2 hours ago</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by claim or claimant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="building">Buildings</SelectItem>
              <SelectItem value="agricultural_land">Agricultural</SelectItem>
              <SelectItem value="water_body">Water Bodies</SelectItem>
              <SelectItem value="forest_cover">Forest Cover</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{sampleDetections.length}</p>
              <p className="text-sm text-slate-600">Total Detections</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{tabCounts.pending}</p>
              <p className="text-sm text-slate-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{tabCounts.verified}</p>
              <p className="text-sm text-slate-600">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(
                  (sampleDetections.reduce((acc, d) => acc + d.confidence, 0) / sampleDetections.length) * 100,
                )}
                %
              </p>
              <p className="text-sm text-slate-600">Avg Confidence</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="recent">Recent ({tabCounts.recent})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({tabCounts.verified})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Detections List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredDetections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Satellite className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No detections found</h3>
                <p className="text-slate-600">
                  {searchQuery || statusFilter !== "all" || assetTypeFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No asset detections available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDetections.map((detection) => (
              <Card key={detection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{detection.claimNumber}</h3>
                        <Badge className={`${getAssetColor(detection.assetType)} border text-xs`}>
                          <div className="flex items-center gap-1">
                            {getAssetIcon(detection.assetType)}
                            {detection.assetType.replace("_", " ")}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-slate-700 font-medium">{detection.claimantName}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span>Area: {detection.area} sq m</span>
                        <span className={`font-medium ${getConfidenceColor(detection.confidence)}`}>
                          Confidence: {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(detection.status)} border text-xs mb-2`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(detection.status)}
                          {detection.status}
                        </div>
                      </Badge>
                      <Link href={`/assets/${detection.claimId}`}>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                    <span>Detected: {new Date(detection.detectionDate).toLocaleDateString()}</span>
                    <span>Satellite: {new Date(detection.satelliteImageDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
