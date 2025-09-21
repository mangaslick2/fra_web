'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssetListView, Asset } from '@/components/asset-list-view'
import { AssetMapView } from '@/components/asset-map-view'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Map,
  List,
  Download,
  RefreshCw,
  Building
} from 'lucide-react'

// Mock data for demonstration - in a real app this would come from an API
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
    name: 'Water Tank',
    type: 'pond',
    claimId: 'FRA-2024-003',
    claimantName: 'Mahesh Kumar',
    village: 'Kansara',
    district: 'Udaipur',
    coordinates: [24.5860, 73.7130],
    area: 0.15,
    detectionConfidence: 96.8,
    verificationStatus: 'verified',
    lastUpdated: '2024-03-14',
    satelliteImageDate: '2024-03-09',
    aiAnalysisScore: 94.1,
    boundaryAccuracy: 98.2,
    landUseType: 'Water Body',
    vegetationIndex: 0.12,
    changeDetected: false
  },
  {
    id: 'AST-2024-004',
    name: 'Forest Patch',
    type: 'forest',
    claimId: 'FRA-2024-004',
    claimantName: 'Sunita Sharma',
    village: 'Deogaon',
    district: 'Udaipur',
    coordinates: [24.5890, 73.7180],
    area: 4.2,
    detectionConfidence: 78.3,
    verificationStatus: 'disputed',
    lastUpdated: '2024-03-11',
    satelliteImageDate: '2024-03-05',
    aiAnalysisScore: 76.9,
    boundaryAccuracy: 82.1,
    landUseType: 'Forest',
    vegetationIndex: 0.89,
    changeDetected: true
  },
  {
    id: 'AST-2024-005',
    name: 'Grazing Land',
    type: 'grazing',
    claimId: 'FRA-2024-005',
    claimantName: 'Ravi Meena',
    village: 'Bhilwara',
    district: 'Bhilwara',
    coordinates: [25.3500, 74.6350],
    area: 1.5,
    detectionConfidence: 83.7,
    verificationStatus: 'pending',
    lastUpdated: '2024-03-13',
    satelliteImageDate: '2024-03-07',
    aiAnalysisScore: 81.4,
    boundaryAccuracy: 85.6,
    landUseType: 'Grassland',
    vegetationIndex: 0.54,
    changeDetected: false
  }
]

export default function UnifiedAssetsPage() {
  const searchParams = useSearchParams()
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  // Check for tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'map') {
      setActiveTab('map')
    }
  }, [searchParams])

  // Calculate statistics
  const stats = {
    total: assets.length,
    verified: assets.filter(a => a.verificationStatus === 'verified').length,
    pending: assets.filter(a => a.verificationStatus === 'pending').length,
    disputed: assets.filter(a => a.verificationStatus === 'disputed').length,
    changesDetected: assets.filter(a => a.changeDetected).length,
    avgConfidence: Math.round(assets.reduce((sum, a) => sum + a.detectionConfidence, 0) / assets.length)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting assets data...')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                संपत्ति प्रबंधन / Asset Management
              </h1>
              <p className="text-slate-600">
                AI-detected land assets with satellite verification
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600">Total Assets</p>
                    <p className="text-lg font-semibold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-600">Verified</p>
                    <p className="text-lg font-semibold">{stats.verified}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-slate-600">Pending</p>
                    <p className="text-lg font-semibold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-xs text-slate-600">Disputed</p>
                    <p className="text-lg font-semibold">{stats.disputed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-slate-600">Changes</p>
                    <p className="text-lg font-semibold">{stats.changesDetected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-600">Avg. Confidence</p>
                    <p className="text-lg font-semibold">{stats.avgConfidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <AssetListView
              assets={assets}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <AssetMapView
              assets={assets}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}