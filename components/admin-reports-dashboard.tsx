"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react"

export function AdminReportsDashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [dateRange, setDateRange] = useState("30d")

  const kpiData = [
    { title: "Claims Submitted", value: "2,847", change: "+12%", icon: FileText, color: "blue" },
    { title: "Claims Approved", value: "1,523", change: "+8%", icon: CheckCircle, color: "green" },
    { title: "Claims Rejected", value: "324", change: '-5%", icon: XCircle, color: red' },
    { title: "Pending Appeals", value: "89", change: "+15%", icon: Clock, color: "orange" },
    { title: "Disputed Claims", value: "156", change: "+3%", icon: AlertTriangle, color: "red" },
    { title: "Active Users", value: "4,521", change: "+18%", icon: Users, color: "purple" },
  ]

  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30",
      actor: "Forest Officer Sharma",
      role: "District Officer",
      action: "Approved claim FRA-2024-001234",
      location: "Bastar District",
    },
    {
      id: 2,
      timestamp: "2024-01-15 13:45",
      actor: "Enumerator Patel",
      role: "Field Officer",
      action: "Uploaded verification documents",
      location: "Dantewada Block",
    },
    {
      id: 3,
      timestamp: "2024-01-15 12:20",
      actor: "System Admin",
      role: "Administrator",
      action: "Bulk uploaded 50 boundary shapefiles",
      location: "State Level",
    },
    {
      id: 4,
      timestamp: "2024-01-15 11:15",
      actor: "Tribal Leader Kumar",
      role: "Gram Sabha Secretary",
      action: "Submitted community claim",
      location: "Village Kumhali",
    },
    {
      id: 5,
      timestamp: "2024-01-15 10:30",
      actor: "AI System",
      role: "Automated",
      action: "Completed asset detection for 25 claims",
      location: "Multiple Villages",
    },
  ]

  const verificationQueue = [
    {
      id: "FRA-2024-001456",
      claimant: "Ramesh Gond",
      type: "Individual",
      submitted: "2024-01-10",
      priority: "High",
      documents: 8,
    },
    {
      id: "FRA-2024-001457",
      claimant: "Sunita Devi",
      type: "Community",
      submitted: "2024-01-12",
      priority: "Medium",
      documents: 12,
    },
    {
      id: "FRA-2024-001458",
      claimant: "Mohan Tribal",
      type: "CFR",
      submitted: "2024-01-13",
      priority: "Low",
      documents: 6,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">District and state-level insights for FRA claims management</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              <SelectItem value="bastar">Bastar</SelectItem>
              <SelectItem value="dantewada">Dantewada</SelectItem>
              <SelectItem value="kanker">Kanker</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                  <p className={`text-sm ${kpi.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change} from last period
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="export">Export & Bulk</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Claims Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Claims trend chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Hotspot Districts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bastar District</span>
                    <Badge variant="destructive">High Disputes</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Dantewada District</span>
                    <Badge variant="secondary">Medium Activity</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Kanker District</span>
                    <Badge variant="default">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data to export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claims">All Claims Data</SelectItem>
                      <SelectItem value="approved">Approved Claims Only</SelectItem>
                      <SelectItem value="pending">Pending Claims Only</SelectItem>
                      <SelectItem value="shapefiles">Boundary Shapefiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="shapefile">Shapefile</SelectItem>
                      <SelectItem value="geojson">GeoJSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Drop shapefile or CSV here</p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Browse Files
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Bulk Update Status
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Bulk Assign Officer
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Generate Beneficiary Lists
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Evidence Verification Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.id}</p>
                      <p className="text-sm text-slate-600">
                        {item.claimant} • {item.type}
                      </p>
                      <p className="text-xs text-slate-500">Submitted: {item.submitted}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          item.priority === "High"
                            ? "destructive"
                            : item.priority === "Medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-sm text-slate-600">{item.documents} docs</span>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search logs..." className="flex-1" />
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-slate-600">
                          {log.actor} ({log.role}) • {log.location}
                        </p>
                        <p className="text-xs text-slate-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
