"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Satellite,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  XCircle,
  Building,
  TreePine,
  Droplets,
  Square,
  Download,
} from "lucide-react"
import Link from "next/link"

interface AssetDetectionViewerProps {
  claimId: string
}

interface DetectedAsset {
  id: string
  type: "building" | "agricultural_land" | "water_body" | "forest_cover"
  confidence: number
  area: number
  coordinates: { x: number; y: number; width: number; height: number }
  verified: boolean | null
}

export function AssetDetectionViewer({ claimId }: AssetDetectionViewerProps) {
  const [activeTab, setActiveTab] = useState("detection")
  const [showOverlays, setShowOverlays] = useState(true)
  const [opacity, setOpacity] = useState([70])
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  // Sample data - in real app, fetch from Supabase based on claimId
  const claimData = {
    claimNumber: "CG24-001",
    claimantName: "राम कुमार",
    detectionDate: "2024-01-18",
    satelliteImageDate: "2024-01-15",
    processingStatus: "completed",
    confidence: 0.91,
  }

  const detectedAssets: DetectedAsset[] = [
    {
      id: "1",
      type: "building",
      confidence: 0.94,
      area: 120,
      coordinates: { x: 30, y: 25, width: 15, height: 10 },
      verified: true,
    },
    {
      id: "2",
      type: "agricultural_land",
      confidence: 0.89,
      area: 2400,
      coordinates: { x: 10, y: 40, width: 60, height: 40 },
      verified: true,
    },
    {
      id: "3",
      type: "water_body",
      confidence: 0.76,
      area: 300,
      coordinates: { x: 75, y: 15, width: 20, height: 15 },
      verified: null,
    },
    {
      id: "4",
      type: "forest_cover",
      confidence: 0.92,
      area: 1800,
      coordinates: { x: 50, y: 10, width: 40, height: 25 },
      verified: null,
    },
  ]

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "building":
        return <Building className="h-4 w-4" />
      case "agricultural_land":
        return <Square className="h-4 w-4" />
      case "water_body":
        return <Droplets className="h-4 w-4" />
      case "forest_cover":
        return <TreePine className="h-4 w-4" />
      default:
        return <Satellite className="h-4 w-4" />
    }
  }

  const getAssetColor = (type: string) => {
    switch (type) {
      case "building":
        return { bg: "bg-red-500", border: "border-red-500", text: "text-red-800" }
      case "agricultural_land":
        return { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-800" }
      case "water_body":
        return { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-800" }
      case "forest_cover":
        return { bg: "bg-green-500", border: "border-green-500", text: "text-green-800" }
      default:
        return { bg: "bg-slate-500", border: "border-slate-500", text: "text-slate-800" }
    }
  }

  const verifyAsset = (assetId: string, verified: boolean) => {
    // In real app, update in Supabase
    console.log(`Asset ${assetId} ${verified ? "verified" : "rejected"}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/assets">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">Asset Detection Analysis</h1>
            <p className="text-slate-600">
              {claimData.claimNumber} - {claimData.claimantName}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Processing Complete
            </div>
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Detection Date: {new Date(claimData.detectionDate).toLocaleDateString()}</span>
          <span>Satellite Image: {new Date(claimData.satelliteImageDate).toLocaleDateString()}</span>
          <span>Overall Confidence: {Math.round(claimData.confidence * 100)}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="overlays" checked={showOverlays} onCheckedChange={setShowOverlays} />
              <Label htmlFor="overlays" className="text-sm">
                Show Overlays
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Opacity:</Label>
              <div className="w-20">
                <Slider value={opacity} onValueChange={setOpacity} max={100} min={10} step={10} className="w-full" />
              </div>
              <span className="text-xs text-slate-600 w-8">{opacity[0]}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 w-12 text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Viewer */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <div className="relative h-full bg-gradient-to-br from-green-50 to-blue-50 border border-slate-200 rounded-lg overflow-hidden">
                {/* Satellite Image Placeholder */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
                >
                  {/* Grid pattern to simulate satellite imagery */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="border border-slate-300"></div>
                      ))}
                    </div>
                  </div>

                  {/* Asset Overlays */}
                  {showOverlays &&
                    detectedAssets.map((asset) => {
                      const colors = getAssetColor(asset.type)
                      const isSelected = selectedAsset === asset.id

                      return (
                        <div
                          key={asset.id}
                          className={`absolute border-2 cursor-pointer transition-all ${
                            isSelected ? "border-slate-900 border-4" : colors.border
                          }`}
                          style={{
                            left: `${asset.coordinates.x}%`,
                            top: `${asset.coordinates.y}%`,
                            width: `${asset.coordinates.width}%`,
                            height: `${asset.coordinates.height}%`,
                            backgroundColor: colors.bg.replace("bg-", "").replace("-500", ""),
                            opacity: opacity[0] / 100,
                          }}
                          onClick={() => setSelectedAsset(isSelected ? null : asset.id)}
                        >
                          <div className="absolute -top-6 left-0 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium shadow-sm">
                            {asset.type.replace("_", " ")} ({Math.round(asset.confidence * 100)}%)
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Center indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-900 bg-white rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-slate-200 bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 m-4 mb-0">
              <TabsTrigger value="detection">Detection</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="detection" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Assets:</span>
                      <span className="font-medium">{detectedAssets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg Confidence:</span>
                      <span className="font-medium">
                        {Math.round(
                          (detectedAssets.reduce((acc, a) => acc + a.confidence, 0) / detectedAssets.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Area:</span>
                      <span className="font-medium">{detectedAssets.reduce((acc, a) => acc + a.area, 0)} sq m</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Detected Assets</h3>
                  {detectedAssets.map((asset) => {
                    const colors = getAssetColor(asset.type)
                    const isSelected = selectedAsset === asset.id

                    return (
                      <Card
                        key={asset.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "ring-2 ring-slate-900" : "hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedAsset(isSelected ? null : asset.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1 rounded ${colors.bg.replace("-500", "-100")} ${colors.text}`}>
                              {getAssetIcon(asset.type)}
                            </div>
                            <span className="font-medium text-slate-900 capitalize">
                              {asset.type.replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Confidence:</span>
                              <span className="font-medium">{Math.round(asset.confidence * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Area:</span>
                              <span className="font-medium">{asset.area} sq m</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium text-slate-900 mb-2">Asset Verification</h3>
                  <p className="text-sm text-slate-600">Review and verify detected assets</p>
                </div>

                <div className="space-y-3">
                  {detectedAssets.map((asset) => {
                    const colors = getAssetColor(asset.type)

                    return (
                      <Card key={asset.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1 rounded ${colors.bg.replace("-500", "-100")} ${colors.text}`}>
                              {getAssetIcon(asset.type)}
                            </div>
                            <span className="font-medium text-slate-900 capitalize flex-1">
                              {asset.type.replace("_", " ")}
                            </span>
                            {asset.verified !== null && (
                              <Badge
                                className={asset.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                              >
                                {asset.verified ? "Verified" : "Rejected"}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 mb-3">
                            Confidence: {Math.round(asset.confidence * 100)}% • Area: {asset.area} sq m
                          </div>

                          {asset.verified === null && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => verifyAsset(asset.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                onClick={() => verifyAsset(asset.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
