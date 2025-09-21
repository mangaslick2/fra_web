'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Layers, 
  MapPin, 
  Satellite, 
  Droplets, 
  Wheat, 
  Trees, 
  Home, 
  Info,
  Mountain,
  Building,
  Eye,
  Filter
} from 'lucide-react'
import { Asset } from './asset-list-view'

interface AssetMapViewProps {
  assets: Asset[]
  searchTerm: string
  statusFilter: string
  typeFilter: string
  selectedAssetId?: string | null
  highlightedAssetId?: string | null
  onAssetSelect?: (assetId: string) => void
  onAssetHighlight?: (assetId: string | null) => void
}

interface DSS_Index {
  name: string
  value: number
  color: string
  description: string
}

export function AssetMapView({ 
  assets, 
  searchTerm, 
  statusFilter, 
  typeFilter,
  selectedAssetId,
  highlightedAssetId,
  onAssetSelect,
  onAssetHighlight 
}: AssetMapViewProps) {
  const [showDSSIndices, setShowDSSIndices] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])
  const [activeLayer, setActiveLayer] = useState<string>("all")
  
  // Find selected asset from props
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId) || null

  const dssIndices: DSS_Index[] = [
    { name: "Water Index", value: 65, color: "bg-blue-500", description: "Water availability and quality" },
    { name: "Cropping Intensity", value: 78, color: "bg-green-500", description: "Agricultural productivity measure" },
    { name: "Forest Cover Change", value: -12, color: "bg-red-500", description: "Forest cover change over time" },
  ]

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "pond":
        return <Droplets className="w-4 h-4" />
      case "homestead":
        return <Home className="w-4 h-4" />
      case "agricultural":
        return <Wheat className="w-4 h-4" />
      case "forest":
        return <Trees className="w-4 h-4" />
      case "grazing":
        return <Mountain className="w-4 h-4" />
      default:
        return <Building className="w-4 h-4" />
    }
  }

  const getAssetColor = (type: string) => {
    switch (type) {
      case "pond":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "homestead":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "agricultural":
        return "bg-green-100 text-green-800 border-green-200"
      case "forest":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "grazing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "pond":
        return "bg-blue-500"
      case "homestead":
        return "bg-orange-500"
      case "agricultural":
        return "bg-green-500"
      case "forest":
        return "bg-emerald-500"
      case "grazing":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  // Filter assets based on all criteria
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || asset.verificationStatus === statusFilter
    const matchesType = typeFilter === 'all' || asset.type === typeFilter
    const matchesConfidence = asset.detectionConfidence >= confidenceThreshold[0]
    const matchesLayer = activeLayer === "all" || asset.type === activeLayer
    
    return matchesSearch && matchesStatus && matchesType && matchesConfidence && matchesLayer
  })

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Area */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Assets Map View
                </CardTitle>
                <Badge variant="outline">{filteredAssets.length} assets</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Interactive Map Placeholder */}
              <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Satellite className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Interactive Asset Map</p>
                    <p className="text-sm text-gray-500">Click on markers to view asset details</p>
                  </div>
                </div>

                {/* Asset Markers */}
                {filteredAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    onClick={() => onAssetSelect?.(asset.id)}
                    onMouseEnter={() => onAssetHighlight?.(asset.id)}
                    onMouseLeave={() => onAssetHighlight?.(null)}
                    className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer ${
                      getMarkerColor(asset.type)
                    } ${
                      selectedAssetId === asset.id ? 'scale-125 ring-2 ring-blue-400' : ''
                    } ${
                      highlightedAssetId === asset.id ? 'animate-pulse' : ''
                    }`}
                    style={{
                      left: `${15 + (index % 8) * 10}%`,
                      top: `${20 + Math.floor(index / 8) * 12}%`,
                      transform: selectedAssetId === asset.id ? 'scale(1.2)' : 'scale(1)',
                    }}
                    title={`${asset.name} - ${asset.claimantName}`}
                  >
                    {getAssetIcon(asset.type)}
                  </div>
                ))}

                {/* Asset Details Popup */}
                {selectedAsset && (
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <Card className="shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getAssetIcon(selectedAsset.type)}
                            <div>
                              <Link href={`/assets/${selectedAsset.claimId}`} className="hover:text-blue-600 transition-colors">
                                <h3 className="font-semibold cursor-pointer">{selectedAsset.name}</h3>
                              </Link>
                              <p className="text-sm text-gray-600">{selectedAsset.claimantName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getAssetColor(selectedAsset.type)}>
                            {selectedAsset.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-600">Village</p>
                            <p className="font-medium">{selectedAsset.village}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Area</p>
                            <p className="font-medium">{selectedAsset.area} acres</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Confidence</p>
                            <p className="font-medium">{selectedAsset.detectionConfidence}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            <Badge variant="outline" className="text-xs">
                              {selectedAsset.verificationStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/assets/${selectedAsset.claimId}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Info className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Controls Panel */}
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layer Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Asset Type Layer</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'homestead', 'agricultural', 'pond', 'forest'].map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setActiveLayer(layer)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        activeLayer === layer
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {layer === 'all' ? 'All Types' : layer.charAt(0).toUpperCase() + layer.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Confidence Threshold</label>
                  <span className="text-sm text-gray-600">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* DSS Indices Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">DSS Indices Overlay</label>
                  <Switch
                    checked={showDSSIndices}
                    onCheckedChange={setShowDSSIndices}
                  />
                </div>
                
                {showDSSIndices && (
                  <div className="space-y-3">
                    {dssIndices.map((index) => (
                      <div key={index.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{index.name}</span>
                          <span className={`text-sm font-medium ${index.value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {index.value > 0 ? '+' : ''}{index.value}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{index.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${index.color}`}
                            style={{ width: `${Math.abs(index.value)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div>
                <label className="text-sm font-medium mb-2 block">Legend</label>
                <div className="space-y-2">
                  {[
                    { type: 'homestead', label: 'Homestead', color: 'bg-orange-500' },
                    { type: 'agricultural', label: 'Agricultural', color: 'bg-green-500' },
                    { type: 'pond', label: 'Water Body', color: 'bg-blue-500' },
                    { type: 'forest', label: 'Forest', color: 'bg-emerald-500' },
                    { type: 'grazing', label: 'Grazing', color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {assets.filter(a => a.type === item.type).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}