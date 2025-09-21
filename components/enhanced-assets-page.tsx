'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Satellite,
  Home,
  TreePine,
  Droplets,
  Mountain,
  Building,
  Zap,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Camera
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: 'homestead' | 'agricultural' | 'pond' | 'forest' | 'grazing' | 'other'
  claimId: string
  claimantName: string
  village: string
  district: string
  coordinates: [number, number]
  area: number
  detectionConfidence: number
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'rejected'
  lastUpdated: string
  satelliteImageDate: string
  aiAnalysisScore: number
  boundaryAccuracy: number
  landUseType: string
  vegetationIndex: number
  changeDetected: boolean
}

// Mock data for demonstration
const mockAssets: Asset[] = [
  {
    id: 'AST-2024-001',
    name: 'Homestead Plot',
    type: 'homestead',
    claimId: 'FRA-2024-001',
    claimantName: 'Ram Singh',
    village: 'Kansara',
    district: 'Udaipur',
    coordinates: [24.5854, 73.7125],
    area: 0.25,
    detectionConfidence: 94.5,
    verificationStatus: 'verified',
    lastUpdated: '2024-03-15',
    satelliteImageDate: '2024-03-10',
    aiAnalysisScore: 92.3,
    boundaryAccuracy: 96.8,
    landUseType: 'Residential',
    vegetationIndex: 0.35,
    changeDetected: false
  },
  {
    id: 'AST-2024-002',
    name: 'Agricultural Field',
    type: 'agricultural',
    claimId: 'FRA-2024-002',
    claimantName: 'Geeta Devi',
    village: 'Bhilwara',
    district: 'Bhilwara',
    coordinates: [25.3470, 74.6307],
    area: 2.8,
    detectionConfidence: 89.2,
    verificationStatus: 'pending',
    lastUpdated: '2024-03-12',
    satelliteImageDate: '2024-03-08',
    aiAnalysisScore: 87.6,
    boundaryAccuracy: 91.4,
    landUseType: 'Cultivated',
    vegetationIndex: 0.68,
    changeDetected: true
  },
  {
    id: 'AST-2024-003',
    name: 'Community Pond',
    type: 'pond',
    claimId: 'FRA-2024-003',
    claimantName: 'Lakhan Singh',
    village: 'Dungarpur',
    district: 'Dungarpur',
    coordinates: [23.8430, 73.7147],
    area: 0.15,
    detectionConfidence: 97.8,
    verificationStatus: 'verified',
    lastUpdated: '2024-03-14',
    satelliteImageDate: '2024-03-09',
    aiAnalysisScore: 95.2,
    boundaryAccuracy: 98.1,
    landUseType: 'Water Body',
    vegetationIndex: 0.12,
    changeDetected: false
  },
  {
    id: 'AST-2024-004',
    name: 'Grazing Land',
    type: 'grazing',
    claimId: 'FRA-2024-004',
    claimantName: 'Sita Devi',
    village: 'Chittorgarh',
    district: 'Chittorgarh',
    coordinates: [24.8887, 74.6269],
    area: 5.2,
    detectionConfidence: 82.4,
    verificationStatus: 'disputed',
    lastUpdated: '2024-03-11',
    satelliteImageDate: '2024-03-07',
    aiAnalysisScore: 79.8,
    boundaryAccuracy: 85.6,
    landUseType: 'Grassland',
    vegetationIndex: 0.54,
    changeDetected: true
  }
]

export default function EnhancedAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAIInsights, setShowAIInsights] = useState(true)

  useEffect(() => {
    loadAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [assets, searchQuery, typeFilter, statusFilter])

  const loadAssets = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAssets(mockAssets)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = [...assets]

    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.village.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.verificationStatus === statusFilter)
    }

    setFilteredAssets(filtered)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homestead': return <Home className="w-4 h-4 text-blue-600" />
      case 'agricultural': return <TreePine className="w-4 h-4 text-green-600" />
      case 'pond': return <Droplets className="w-4 h-4 text-cyan-600" />
      case 'forest': return <Mountain className="w-4 h-4 text-emerald-600" />
      case 'grazing': return <Building className="w-4 h-4 text-orange-600" />
      default: return <Layers className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'disputed':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />Disputed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatsData = () => {
    const total = assets.length
    const verified = assets.filter(a => a.verificationStatus === 'verified').length
    const pending = assets.filter(a => a.verificationStatus === 'pending').length
    const totalArea = assets.reduce((sum, a) => sum + a.area, 0)
    const avgConfidence = assets.reduce((sum, a) => sum + a.detectionConfidence, 0) / total

    return { total, verified, pending, totalArea, avgConfidence }
  }

  const stats = getStatsData()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">AI Asset Detection</h1>
          <p className="text-gray-600 mt-1">Satellite-based asset identification and verification</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showAIInsights} 
              onCheckedChange={setShowAIInsights}
              id="ai-insights"
            />
            <label htmlFor="ai-insights" className="text-sm font-medium">AI Insights</label>
          </div>
          <Button className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-2xl font-bold">{stats.totalArea.toFixed(1)} ha</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                  {stats.avgConfidence.toFixed(1)}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Satellite className="w-5 h-5" />
              AI Analysis Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>3 assets show improved vegetation index</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>2 assets require boundary verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>New satellite imagery available for 6 assets</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search assets, claims, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="homestead">Homestead</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="pond">Pond</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="grazing">Grazing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assets found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(asset.type)}
                    <div>
                      <h3 className="font-semibold text-lg">{asset.name}</h3>
                      <p className="text-sm text-gray-600">{asset.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(asset.verificationStatus)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Claimant:</span>
                    <span className="font-medium">{asset.claimantName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span>{asset.village}, {asset.district}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{asset.area} hectares</span>
                  </div>
                </div>

                {/* AI Analysis Metrics */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Detection Confidence</span>
                    <span className={`font-bold ${getConfidenceColor(asset.detectionConfidence)}`}>
                      {asset.detectionConfidence}%
                    </span>
                  </div>
                  <Progress value={asset.detectionConfidence} className="h-1" />
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-3">
                    <div>AI Score: <span className="font-medium">{asset.aiAnalysisScore}%</span></div>
                    <div>Accuracy: <span className="font-medium">{asset.boundaryAccuracy}%</span></div>
                    <div>Vegetation: <span className="font-medium">{asset.vegetationIndex}</span></div>
                    <div className={asset.changeDetected ? 'text-orange-600' : 'text-green-600'}>
                      {asset.changeDetected ? 'Change Detected' : 'Stable'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
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
