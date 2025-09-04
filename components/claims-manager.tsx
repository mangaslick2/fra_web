"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useProtectedAction } from "@/components/protected-action"
import { useRouter } from "next/navigation"

interface Claim {
  id: string
  claimNumber: string
  claimType: string
  claimantName: string
  district: string
  block: string
  village: string
  areaClaimed: number
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "pending_documents"
  submittedAt: string
  updatedAt: string
  aiProcessingStatus: "pending" | "processing" | "completed" | "failed"
}

export function ClaimsManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const { protectAction, isAuthenticated } = useProtectedAction()
  const router = useRouter()

  const handleNewClaim = protectAction(() => {
    router.push('/claims/new')
  })

  // Sample data - in real app, fetch from Supabase
  const sampleClaims: Claim[] = [
    {
      id: "1",
      claimNumber: "CG24-001",
      claimType: "individual",
      claimantName: "राम कुमार",
      district: "Bastar",
      block: "Jagdalpur",
      village: "Kumhrawand",
      areaClaimed: 2.5,
      status: "under_review",
      submittedAt: "2024-01-15",
      updatedAt: "2024-01-20",
      aiProcessingStatus: "completed",
    },
    {
      id: "2",
      claimNumber: "CG24-002",
      claimType: "community",
      claimantName: "सीता देवी",
      district: "Dantewada",
      block: "Dantewada",
      village: "Barsoor",
      areaClaimed: 1.8,
      status: "approved",
      submittedAt: "2024-01-10",
      updatedAt: "2024-01-25",
      aiProcessingStatus: "completed",
    },
    {
      id: "3",
      claimNumber: "DRAFT-003",
      claimType: "individual",
      claimantName: "गोपाल सिंह",
      district: "Kanker",
      block: "Kanker",
      village: "Malanjkhand",
      areaClaimed: 3.2,
      status: "draft",
      submittedAt: "",
      updatedAt: "2024-01-28",
      aiProcessingStatus: "pending",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "under_review":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "pending_documents":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-slate-600" />
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

  const filteredClaims = sampleClaims.filter((claim) => {
    const matchesSearch =
      claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.village.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || claim.status === statusFilter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && !["approved", "rejected"].includes(claim.status)) ||
      (activeTab === "completed" && ["approved", "rejected"].includes(claim.status))

    return matchesSearch && matchesStatus && matchesTab
  })

  const getTabCounts = () => {
    const all = sampleClaims.length
    const active = sampleClaims.filter((c) => !["approved", "rejected"].includes(c.status)).length
    const completed = sampleClaims.filter((c) => ["approved", "rejected"].includes(c.status)).length
    return { all, active, completed }
  }

  const tabCounts = getTabCounts()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-900">My Claims</h1>
          <Button onClick={handleNewClaim} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Claim
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active ({tabCounts.active})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed ({tabCounts.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No claims found</h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't filed any forest rights claims yet."}
                </p>
                <Button onClick={handleNewClaim}>File Your First Claim</Button>
              </CardContent>
            </Card>
          ) : (
            filteredClaims.map((claim) => (
              <Link key={claim.id} href={`/claims/${claim.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{claim.claimNumber}</h3>
                          <Badge variant="outline" className="text-xs">
                            {claim.claimType}
                          </Badge>
                        </div>
                        <p className="text-slate-700 font-medium">{claim.claimantName}</p>
                        <p className="text-sm text-slate-600">
                          {claim.village}, {claim.block}, {claim.district}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(claim.status)} border text-xs mb-2`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(claim.status)}
                            {claim.status.replace("_", " ")}
                          </div>
                        </Badge>
                        <p className="text-sm text-slate-600">{claim.areaClaimed} hectares</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {claim.submittedAt
                          ? `Submitted: ${new Date(claim.submittedAt).toLocaleDateString()}`
                          : "Draft - Not submitted"}
                      </span>
                      <span>Updated: {new Date(claim.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* AI Processing Status */}
                    {claim.aiProcessingStatus !== "pending" && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600">AI Processing:</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              claim.aiProcessingStatus === "completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : claim.aiProcessingStatus === "processing"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {claim.aiProcessingStatus}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
