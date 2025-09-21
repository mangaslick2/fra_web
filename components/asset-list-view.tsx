'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
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

export interface Asset {
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

interface AssetListViewProps {
  assets: Asset[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  selectedAssetId?: string | null
  onAssetSelect?: (assetId: string) => void
  onAssetHighlight?: (assetId: string | null) => void
}

export function AssetListView({
  assets,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  selectedAssetId,
  onAssetSelect,
  onAssetHighlight
}: AssetListViewProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default'
      case 'pending': return 'secondary'
      case 'disputed': return 'destructive'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homestead': return <Home className="w-4 h-4" />
      case 'agricultural': return <TreePine className="w-4 h-4" />
      case 'pond': return <Droplets className="w-4 h-4" />
      case 'forest': return <TreePine className="w-4 h-4" />
      case 'grazing': return <Mountain className="w-4 h-4" />
      default: return <Building className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || asset.verificationStatus === statusFilter
    const matchesType = typeFilter === 'all' || asset.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets by name, claimant, village, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="homestead">Homestead</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
              <SelectItem value="pond">Pond</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="grazing">Grazing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Card 
            key={asset.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedAssetId === asset.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onAssetSelect?.(asset.id)}
            onMouseEnter={() => onAssetHighlight?.(asset.id)}
            onMouseLeave={() => onAssetHighlight?.(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(asset.type)}
                  <div>
                    <Link href={`/assets/${asset.claimId}`} className="hover:text-blue-600 transition-colors">
                      <CardTitle className="text-lg cursor-pointer">{asset.name}</CardTitle>
                    </Link>
                    <p className="text-sm text-gray-600">{asset.claimantName}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(asset.verificationStatus)} className="capitalize">
                  {asset.verificationStatus}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Village</p>
                  <p className="font-medium">{asset.village}</p>
                </div>
                <div>
                  <p className="text-gray-600">Area</p>
                  <p className="font-medium">{asset.area} acres</p>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium capitalize">{asset.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Claim ID</p>
                  <p className="font-medium font-mono text-xs">{asset.claimId}</p>
                </div>
              </div>

              {/* Detection Confidence */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Detection Confidence</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(asset.detectionConfidence)}`}>
                    {asset.detectionConfidence}%
                  </span>
                </div>
                <Progress value={asset.detectionConfidence} className="h-2" />
              </div>

              {/* AI Analysis Score */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">AI Analysis Score</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(asset.aiAnalysisScore)}`}>
                    {asset.aiAnalysisScore}%
                  </span>
                </div>
                <Progress value={asset.aiAnalysisScore} className="h-2" />
              </div>

              {/* Change Detection */}
              {asset.changeDetected && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">Change detected</span>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {asset.lastUpdated}
                </div>
                <div className="flex items-center gap-1">
                  <Satellite className="w-3 h-3" />
                  {asset.satelliteImageDate}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/assets/${asset.claimId}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}