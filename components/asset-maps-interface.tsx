"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Layers, MapPin, Satellite, Droplets, Wheat, Trees, Home, Info } from "lucide-react"
import Link from "next/link"

interface Asset {
  id: string
  type: "pond" | "homestead" | "agricultural" | "forest"
  coordinates: [number, number]
  confidence: number
  area: number
  lastUpdated: string
  satelliteImage: string
}

interface DSS_Index {
  name: string
  value: number
  color: string
  description: string
}

export function AssetMapsInterface() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showDSSIndices, setShowDSSIndices] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])
  const [activeLayer, setActiveLayer] = useState<string>("all")

  const assets: Asset[] = [
    {
      id: "pond_001",
      type: "pond",
      coordinates: [77.209, 28.6139],
      confidence: 85,
      area: 0.5,
      lastUpdated: "2024-01-15",
      satelliteImage: "/satellite-view-of-pond.jpg",
    },
    {
      id: "home_001",
      type: "homestead",
      coordinates: [77.2095, 28.6142],
      confidence: 92,
      area: 0.2,
      lastUpdated: "2024-01-10",
      satelliteImage: "/satellite-view-of-homestead.jpg",
    },
    {
      id: "agri_001",
      type: "agricultural",
      coordinates: [77.2088, 28.6145],
      confidence: 78,
      area: 2.3,
      lastUpdated: "2024-01-12",
      satelliteImage: "/satellite-view-of-agricultural-field.jpg",
    },
  ]

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
      default:
        return <MapPin className="w-4 h-4" />
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredAssets = assets.filter(
    (asset) => asset.confidence >= confidenceThreshold[0] && (activeLayer === "all" || asset.type === activeLayer),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/map">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Asset Maps</h1>
            <p className="text-sm text-gray-600">AI-detected land features</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-64 bg-gray-100 border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Satellite className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Interactive Asset Map</p>
            <p className="text-sm text-gray-500">Tap assets to view details</p>
          </div>
        </div>

        {/* Asset Markers */}
        {filteredAssets.map((asset, index) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ${
              asset.type === "pond"
                ? "bg-blue-500"
                : asset.type === "homestead"
                  ? "bg-orange-500"
                  : asset.type === "agricultural"
                    ? "bg-green-500"
                    : "bg-emerald-500"
            }`}
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
            }}
          >
            {getAssetIcon(asset.type)}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-b border-gray-200">
        {/* Layer Toggle */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Asset Layers</h3>
          <div className="flex gap-2 flex-wrap">
            {["all", "pond", "homestead", "agricultural", "forest"].map((layer) => (
              <Button
                key={layer}
                variant={activeLayer === layer ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLayer(layer)}
                className="capitalize"
              >
                {layer === "all" ? <Layers className="w-4 h-4 mr-1" /> : getAssetIcon(layer)}
                {layer}
              </Button>
            ))}
          </div>
        </div>

        {/* DSS Indices Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">DSS Indices</h3>
            <Switch checked={showDSSIndices} onCheckedChange={setShowDSSIndices} />
          </div>
          {showDSSIndices && (
            <div className="space-y-2">
              {dssIndices.map((index) => (
                <div key={index.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${index.color}`}></div>
                  <span className="text-sm font-medium flex-1">{index.name}</span>
                  <span className="text-sm text-gray-600">
                    {index.value > 0 ? "+" : ""}
                    {index.value}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidence Threshold */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Confidence Threshold: {confidenceThreshold[0]}%</h3>
          <Slider
            value={confidenceThreshold}
            onValueChange={setConfidenceThreshold}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Asset List */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Detected Assets ({filteredAssets.length})</h3>
        {filteredAssets.map((asset) => (
          <Card
            key={asset.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedAsset(asset)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getAssetColor(asset.type)}`}>{getAssetIcon(asset.type)}</div>
                  <div>
                    <p className="font-medium capitalize">{asset.type}</p>
                    <p className="text-sm text-gray-600">{asset.area} hectares</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{asset.confidence}% confidence</Badge>
                  <p className="text-xs text-gray-500 mt-1">Updated {asset.lastUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <Card className="w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{selectedAsset.type} Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={selectedAsset.satelliteImage || "/placeholder.svg"}
                alt={`Satellite view of ${selectedAsset.type}`}
                className="w-full h-48 object-cover rounded-lg"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Confidence Score</p>
                  <p className="font-semibold">{selectedAsset.confidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-semibold">{selectedAsset.area} hectares</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold">{selectedAsset.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset ID</p>
                  <p className="font-semibold text-xs">{selectedAsset.id}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Info className="w-4 h-4 mr-2" />
                  View Full Analysis Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
