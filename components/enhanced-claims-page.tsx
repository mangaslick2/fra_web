'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Layers,
  Home,
  TreePine,
  Droplets
} from 'lucide-react'
import { offlineService } from '@/lib/offline-service'

interface Claim {
  id: string
  claimType: 'IFR' | 'CFR' | 'CR'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'verification_pending'
  claimantName: string
  village: string
  district: string
  state: string
  submittedAt: string
  updatedAt: string
  area?: number
  pattaNumber?: string
  surveyNumber?: string
  progressPercentage: number
  nextAction?: string
  officer?: string
}

// Mock data for demonstration
const mockClaims: Claim[] = [
  {
    id: 'FRA-2024-001',
    claimType: 'IFR',
    status: 'approved',
    claimantName: 'Ram Singh',
    village: 'Kansara',
    district: 'Udaipur',
    state: 'Rajasthan',
    submittedAt: '2024-01-15',
    updatedAt: '2024-02-20',
    area: 2.5,
    pattaNumber: 'IFR/2024/001',
    surveyNumber: '245/1',
    progressPercentage: 100,
    officer: 'Mohan Lal'
  },
  {
    id: 'FRA-2024-002',
    claimType: 'CFR',
    status: 'under_review',
    claimantName: 'Geeta Devi',
    village: 'Bhilwara',
    district: 'Bhilwara',
    state: 'Rajasthan',
    submittedAt: '2024-02-10',
    updatedAt: '2024-03-01',
    area: 15.0,
    surveyNumber: '167/2',
    progressPercentage: 65,
    nextAction: 'Field verification pending',
    officer: 'Priya Sharma'
  },
  {
    id: 'FRA-2024-003',
    claimType: 'CR',
    status: 'verification_pending',
    claimantName: 'Lakhan Singh',
    village: 'Dungarpur',
    district: 'Dungarpur',
    state: 'Rajasthan',
    submittedAt: '2024-03-05',
    updatedAt: '2024-03-10',
    area: 0.8,
    surveyNumber: '89/3',
    progressPercentage: 45,
    nextAction: 'GPS survey required',
    officer: 'Amit Kumar'
  },
  {
    id: 'FRA-2024-004',
    claimType: 'IFR',
    status: 'rejected',
    claimantName: 'Sita Devi',
    village: 'Chittorgarh',
    district: 'Chittorgarh',
    state: 'Rajasthan',
    submittedAt: '2024-01-20',
    updatedAt: '2024-02-15',
    area: 1.2,
    surveyNumber: '123/4',
    progressPercentage: 100,
    nextAction: 'Appeal can be filed',
    officer: 'Rajesh Gupta'
  }
]

export default function EnhancedClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClaims()
  }, [])

  useEffect(() => {
    filterClaims()
  }, [claims, searchQuery, statusFilter, typeFilter])

  const loadClaims = async () => {
    try {
      setIsLoading(true)
      // In a real app, this would load from API/database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
      setClaims(mockClaims)
    } catch (error) {
      console.error('Failed to load claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClaims = () => {
    let filtered = [...claims]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(claim =>
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(claim => claim.claimType === typeFilter)
    }

    setFilteredClaims(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'verification_pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Verification Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'submitted':
        return <Badge className="bg-purple-100 text-purple-800"><FileText className="w-3 h-3 mr-1" />Submitted</Badge>
      case 'draft':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IFR': return <Home className="w-4 h-4 text-blue-600" />
      case 'CFR': return <TreePine className="w-4 h-4 text-green-600" />
      case 'CR': return <Droplets className="w-4 h-4 text-cyan-600" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IFR': return 'Individual Forest Rights'
      case 'CFR': return 'Community Forest Rights'
      case 'CR': return 'Community Rights'
      default: return type
    }
  }

  const getStatsData = () => {
    const total = claims.length
    const approved = claims.filter(c => c.status === 'approved').length
    const pending = claims.filter(c => c.status === 'under_review' || c.status === 'verification_pending').length
    const rejected = claims.filter(c => c.status === 'rejected').length
    
    return { total, approved, pending, rejected }
  }

  const stats = getStatsData()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forest Rights Claims</h1>
          <p className="text-gray-600 mt-1">Manage and track your forest rights applications</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Claim
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, name, village, or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="verification_pending">Verification Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IFR">Individual Forest Rights</SelectItem>
                <SelectItem value="CFR">Community Forest Rights</SelectItem>
                <SelectItem value="CR">Community Rights</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No claims found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left Section - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeIcon(claim.claimType)}
                      <div>
                        <h3 className="font-semibold text-lg">{claim.id}</h3>
                        <p className="text-sm text-gray-600">{getTypeLabel(claim.claimType)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{claim.claimantName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{claim.village}, {claim.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{new Date(claim.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {claim.area && (
                      <p className="text-sm text-gray-600 mb-2">
                        Area: <span className="font-medium">{claim.area} hectares</span>
                        {claim.surveyNumber && ` • Survey No: ${claim.surveyNumber}`}
                      </p>
                    )}
                  </div>

                  {/* Right Section - Status and Actions */}
                  <div className="lg:text-right space-y-3">
                    {getStatusBadge(claim.status)}
                    
                    <div className="w-full lg:w-48">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{claim.progressPercentage}%</span>
                      </div>
                      <Progress value={claim.progressPercentage} className="h-2" />
                    </div>

                    {claim.nextAction && (
                      <p className="text-xs text-blue-600 font-medium">{claim.nextAction}</p>
                    )}

                    {claim.officer && (
                      <p className="text-xs text-gray-500">Officer: {claim.officer}</p>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
