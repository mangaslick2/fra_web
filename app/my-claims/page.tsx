"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Map, Plus, Apple as Appeal } from "lucide-react"

// Mock data for claims
const mockClaims = [
  {
    id: "FRA-2024-001",
    type: "Individual Forest Rights",
    status: "under_review",
    submittedDate: "2024-01-15",
    village: "Saraykela",
    area: "2.5 acres",
    progress: 60,
    canAppeal: false,
  },
  {
    id: "FRA-2024-002",
    type: "Community Forest Rights",
    status: "approved",
    submittedDate: "2023-12-10",
    village: "Saraykela",
    area: "15 acres",
    progress: 100,
    canAppeal: false,
  },
  {
    id: "FRA-2023-089",
    type: "Individual Forest Rights",
    status: "rejected",
    submittedDate: "2023-11-20",
    village: "Saraykela",
    area: "1.8 acres",
    progress: 100,
    canAppeal: true,
    rejectionReason: "Insufficient documentation - missing Gram Sabha consent",
  },
]

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: FileText },
  under_review: { label: "Under Review", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Approved", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
}

export default function MyClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredClaims = mockClaims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.village.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || claim.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">मेरे दावे / My Claims</h1>
          <p className="text-slate-600">Track your forest rights applications</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by claim ID or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(selectedStatus === status ? "all" : status)}
                  >
                    {config.label}
                  </Button>
                ))}
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                >
                  All
                </Button>
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {filteredClaims.map((claim) => {
                const StatusIcon = statusConfig[claim.status as keyof typeof statusConfig].icon
                return (
                  <Card key={claim.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{claim.id}</h3>
                          <p className="text-slate-600">{claim.type}</p>
                        </div>
                        <Badge
                          className={`${statusConfig[claim.status as keyof typeof statusConfig].color} text-white`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[claim.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-500">Village</p>
                          <p className="font-medium">{claim.village}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Area</p>
                          <p className="font-medium">{claim.area}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Submitted</p>
                          <p className="font-medium">{claim.submittedDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Progress</p>
                          <p className="font-medium">{claim.progress}%</p>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <span>Submitted</span>
                          <span>Verified</span>
                          <span>Committee</span>
                          <span>Decision</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              claim.status === "approved"
                                ? "bg-green-500"
                                : claim.status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                            style={{ width: `${claim.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {claim.status === "rejected" && claim.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                              <p className="text-sm text-red-700">{claim.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          View Details
                        </Button>
                        {claim.canAppeal && (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Appeal className="h-4 w-4 mr-1" />
                            File Appeal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* New Claim Button */}
            <Card className="border-dashed border-2 border-slate-300 hover:border-slate-400 transition-colors">
              <CardContent className="p-8 text-center">
                <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">File New Claim</h3>
                <p className="text-slate-600 mb-4">Start a new forest rights application</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Claim
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            {/* Map Mini-View */}
            <Card>
              <CardHeader>
                <CardTitle>Claims Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 h-96 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Interactive Claims Map</p>
                    <p className="text-sm text-slate-500">View all your claims on the map</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
