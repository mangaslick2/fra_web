'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { AssetListView, Asset } from './asset-list-view'
import { AssetMapView } from './asset-map-view'
import { AssetDetectionViewer } from './asset-detection-viewer'
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
  Building,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Zap
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

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
  
  // State management
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [villageFilter, setVillageFilter] = useState('all')
  const [confidenceRange, setConfidenceRange] = useState([0, 100])
  const [areaRange, setAreaRange] = useState([0, 10])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortBy, setSortBy] = useState('lastUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  // Synchronized selection state for map-list sync
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null)

  // Check for tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'map') {
      setActiveTab('map')
    }
  }, [searchParams])

  // Get unique filter options
  const uniqueDistricts = useMemo(() => 
    [...new Set(assets.map(a => a.district))].sort(), [assets]
  )
  
  const uniqueVillages = useMemo(() => 
    [...new Set(assets.filter(a => districtFilter === 'all' || a.district === districtFilter)
      .map(a => a.village))].sort(), [assets, districtFilter]
  )

  // Advanced filtering logic
  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      // Text search
      const searchMatch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.claimId.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const statusMatch = statusFilter === 'all' || asset.verificationStatus === statusFilter

      // Type filter
      const typeMatch = typeFilter === 'all' || asset.type === typeFilter

      // Location filters
      const districtMatch = districtFilter === 'all' || asset.district === districtFilter
      const villageMatch = villageFilter === 'all' || asset.village === villageFilter

      // Confidence range
      const confidenceMatch = asset.detectionConfidence >= confidenceRange[0] && 
        asset.detectionConfidence <= confidenceRange[1]

      // Area range
      const areaMatch = asset.area >= areaRange[0] && asset.area <= areaRange[1]

      // Date range filter
      const dateMatch = !dateRange?.from || !dateRange?.to || 
        (new Date(asset.lastUpdated) >= dateRange.from && new Date(asset.lastUpdated) <= dateRange.to)

      return searchMatch && statusMatch && typeMatch && districtMatch && 
             villageMatch && confidenceMatch && areaMatch && dateMatch
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'detectionConfidence':
          aValue = a.detectionConfidence
          bValue = b.detectionConfidence
          break
        case 'area':
          aValue = a.area
          bValue = b.area
          break
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated)
          bValue = new Date(b.lastUpdated)
          break
        default:
          aValue = a.lastUpdated
          bValue = b.lastUpdated
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [assets, searchTerm, statusFilter, typeFilter, districtFilter, villageFilter, 
      confidenceRange, areaRange, dateRange, sortBy, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAssets.slice(startIndex, endIndex)
  }, [filteredAssets, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, districtFilter, villageFilter, 
      confidenceRange, areaRange, dateRange])

  // Calculate statistics
  const stats = {
    total: filteredAssets.length,
    verified: filteredAssets.filter(a => a.verificationStatus === 'verified').length,
    pending: filteredAssets.filter(a => a.verificationStatus === 'pending').length,
    disputed: filteredAssets.filter(a => a.verificationStatus === 'disputed').length,
    changesDetected: filteredAssets.filter(a => a.changeDetected).length,
    avgConfidence: filteredAssets.length > 0 
      ? Math.round(filteredAssets.reduce((sum, a) => sum + a.detectionConfidence, 0) / filteredAssets.length)
      : 0
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
    const dataToExport = filteredAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      claimantName: asset.claimantName,
      village: asset.village,
      district: asset.district,
      area: asset.area,
      detectionConfidence: asset.detectionConfidence,
      verificationStatus: asset.verificationStatus,
      lastUpdated: asset.lastUpdated
    }))
    
    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setDistrictFilter('all')
    setVillageFilter('all')
    setConfidenceRange([0, 100])
    setAreaRange([0, 10])
    setDateRange(undefined)
  }

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssetId(assetId)
    setHighlightedAssetId(assetId)
  }

  const handleAssetHighlight = (assetId: string | null) => {
    setHighlightedAssetId(assetId)
  }

  // Map DetectedAsset type to Asset type
  const mapAssetType = (detectedType: string): Asset['type'] => {
    switch (detectedType) {
      case 'building':
        return 'homestead'
      case 'agricultural_land':
        return 'agricultural'
      case 'water_body':
        return 'pond'
      case 'forest_cover':
        return 'forest'
      default:
        return 'other'
    }
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
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        {/* Advanced Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Search and Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets, claims, or names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homestead">Homestead</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="pond">Water Body</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="grazing">Grazing Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="detectionConfidence">Confidence</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Location and Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistricts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={villageFilter} onValueChange={setVillageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Village" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Villages</SelectItem>
                  {uniqueVillages.map(village => (
                    <SelectItem key={village} value={village}>{village}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confidence: {confidenceRange[0]}% - {confidenceRange[1]}%</label>
                <div className="px-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={confidenceRange[0]}
                    onChange={(e) => setConfidenceRange([parseInt(e.target.value), confidenceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Area: {areaRange[0]} - {areaRange[1]} acres</label>
                <div className="px-2">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={areaRange[1]}
                    onChange={(e) => setAreaRange([areaRange[0], parseFloat(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Date Range and Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-2">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Detection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <AssetListView
              assets={paginatedAssets}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetHighlight={handleAssetHighlight}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <AssetMapView
              assets={filteredAssets}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              selectedAssetId={selectedAssetId}
              highlightedAssetId={highlightedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetHighlight={handleAssetHighlight}
            />
          </TabsContent>

          <TabsContent value="detection" className="space-y-6">
            <AssetDetectionViewer 
              claimId={selectedAssetId || 'default'}
              onAssetDetected={(detectedAssets) => {
                // Add newly detected assets to the main assets list
                const newAssets: Asset[] = detectedAssets.map(asset => ({
                  id: `detected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: `Detected ${asset.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
                  type: mapAssetType(asset.type),
                  claimId: selectedAssetId || 'default',
                  claimantName: 'Auto-Detected',
                  village: 'Detected via AI',
                  district: 'Various',
                  coordinates: [0, 0] as [number, number],
                  area: asset.area,
                  detectionConfidence: asset.confidence,
                  verificationStatus: asset.confidence > 85 ? 'verified' as const : 'pending' as const,
                  lastUpdated: new Date().toISOString().split('T')[0],
                  satelliteImageDate: new Date().toISOString().split('T')[0],
                  aiAnalysisScore: asset.confidence,
                  boundaryAccuracy: Math.round(asset.confidence * 0.9),
                  landUseType: asset.type.replace(/_/g, ' '),
                  vegetationIndex: asset.type.includes('forest') || asset.type.includes('agricultural') ? Math.random() * 0.8 + 0.2 : 0.1,
                  changeDetected: false
                }))
                
                setAssets(prev => [...prev, ...newAssets])
                console.log('New assets detected and added:', newAssets)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}