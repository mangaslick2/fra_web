"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Satellite,
  MapPin,
  Calendar,
  Download,
  Filter,
  Eye,
  Edit,
} from "lucide-react"

interface DashboardStats {
  totalClaims: number
  pendingReview: number
  approved: number
  rejected: number
  totalUsers: number
  activeUsers: number
  assetsDetected: number
  avgProcessingTime: number
}

interface RecentClaim {
  id: string
  claimNumber: string
  claimantName: string
  district: string
  status: string
  submittedAt: string
  priority: "high" | "medium" | "low"
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")

  // Sample data - in real app, fetch from Supabase
  const stats: DashboardStats = {
    totalClaims: 1247,
    pendingReview: 89,
    approved: 892,
    rejected: 156,
    totalUsers: 2341,
    activeUsers: 1876,
    assetsDetected: 4521,
    avgProcessingTime: 12.5,
  }

  const recentClaims: RecentClaim[] = [
    {
      id: "1",
      claimNumber: "CG24-089",
      claimantName: "राम कुमार",
      district: "Bastar",
      status: "pending_documents",
      submittedAt: "2024-01-28",
      priority: "high",
    },
    {
      id: "2",
      claimNumber: "CG24-090",
      claimantName: "सीता देवी",
      district: "Dantewada",
      status: "under_review",
      submittedAt: "2024-01-27",
      priority: "medium",
    },
    {
      id: "3",
      claimNumber: "CG24-091",
      claimantName: "गोपाल सिंह",
      district: "Kanker",
      status: "submitted",
      submittedAt: "2024-01-26",
      priority: "low",
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
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">System Overview</h2>
            <p className="text-slate-600">Forest Rights Claims Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-slate-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Claims</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalClaims.toLocaleString()}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pending Review</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingReview}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">-8%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Users</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+5%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Avg Processing</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.avgProcessingTime}d</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">-2d</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claims Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-700">Approved</span>
                      </div>
                      <span className="text-sm font-medium">{stats.approved}</span>
                    </div>
                    <Progress value={(stats.approved / stats.totalClaims) * 100} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-slate-700">Under Review</span>
                      </div>
                      <span className="text-sm font-medium">{stats.pendingReview}</span>
                    </div>
                    <Progress value={(stats.pendingReview / stats.totalClaims) * 100} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-slate-700">Rejected</span>
                      </div>
                      <span className="text-sm font-medium">{stats.rejected}</span>
                    </div>
                    <Progress value={(stats.rejected / stats.totalClaims) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">{claim.claimNumber}</span>
                            <Badge className={`${getPriorityColor(claim.priority)} border text-xs`}>
                              {claim.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            {claim.claimantName} • {claim.district}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(claim.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(claim.status)} border text-xs`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(claim.status)}
                              {claim.status.replace("_", " ")}
                            </div>
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Claims Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">{claim.claimNumber}</span>
                          <Badge className={`${getStatusColor(claim.status)} border text-xs`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(claim.status)}
                              {claim.status.replace("_", " ")}
                            </div>
                          </Badge>
                          <Badge className={`${getPriorityColor(claim.priority)} border text-xs`}>
                            {claim.priority} priority
                          </Badge>
                        </div>
                        <p className="text-slate-700 font-medium">{claim.claimantName}</p>
                        <p className="text-sm text-slate-600">
                          {claim.district} • Submitted: {new Date(claim.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-sm text-slate-600">New This Month</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">User Types Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Tribal Members</span>
                      <span className="text-sm font-medium">1,892 (81%)</span>
                    </div>
                    <Progress value={81} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Government Officials</span>
                      <span className="text-sm font-medium">234 (10%)</span>
                    </div>
                    <Progress value={10} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Forest Officers</span>
                      <span className="text-sm font-medium">156 (7%)</span>
                    </div>
                    <Progress value={7} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Administrators</span>
                      <span className="text-sm font-medium">59 (2%)</span>
                    </div>
                    <Progress value={2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Asset Detection Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{stats.assetsDetected.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Assets Detected</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">3,421</p>
                    <p className="text-sm text-slate-600">Verified</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">892</p>
                    <p className="text-sm text-slate-600">Pending Review</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">92%</p>
                    <p className="text-sm text-slate-600">Avg Confidence</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Asset Types</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Agricultural Land</span>
                        <span className="text-sm font-medium">1,892</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Buildings</span>
                        <span className="text-sm font-medium">1,234</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Forest Cover</span>
                        <span className="text-sm font-medium">892</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Water Bodies</span>
                        <span className="text-sm font-medium">503</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Claims Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <Users className="h-6 w-6" />
                    <span>User Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <Satellite className="h-6 w-6" />
                    <span>Asset Detection Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <MapPin className="h-6 w-6" />
                    <span>Geographic Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
