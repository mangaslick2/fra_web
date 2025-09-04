"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Plus, Layers, Search, Locate, Mic, Filter, Clock, Eye, EyeOff, X, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MapLayer {
  id: string
  name: string
  visible: boolean
  color: string
  icon: string
}

interface Claim {
  id: string
  claimantName: string
  area: number
  status: "draft" | "submitted" | "approved" | "rejected"
  coordinates: [number, number]
  type: "IFR" | "CFR" | "CR"
  submittedDate: string
}

interface VillageInfo {
  name: string
  district: string
  totalClaims: number
  approvedClaims: number
  pendingClaims: number
  rejectedClaims: number
}

export function MapInterface() {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["forest", "villages"])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [timeSlider, setTimeSlider] = useState([2024])
  const [selectedVillage, setSelectedVillage] = useState<VillageInfo | null>(null)
  const [isVoiceSearch, setIsVoiceSearch] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showClaimsList, setShowClaimsList] = useState(false)

  const mapLayers: MapLayer[] = [
    { id: "ifr", name: "Individual Forest Rights", visible: true, color: "bg-green-500", icon: "🏠" },
    { id: "cfr", name: "Community Forest Rights", visible: true, color: "bg-blue-500", icon: "🏘️" },
    { id: "villages", name: "Village Boundaries", visible: true, color: "bg-purple-500", icon: "🏛️" },
    { id: "forest", name: "Forest Cover", visible: false, color: "bg-emerald-500", icon: "🌲" },
    { id: "water", name: "Water Bodies", visible: false, color: "bg-cyan-500", icon: "💧" },
    { id: "assets", name: "Asset Heatmaps", visible: false, color: "bg-orange-500", icon: "📊" },
  ]

  const sampleClaims: Claim[] = [
    {
      id: "1",
      claimantName: "राम कुमार",
      area: 2.5,
      status: "approved",
      coordinates: [22.5726, 88.3639],
      type: "IFR",
      submittedDate: "2024-01-15",
    },
    {
      id: "2",
      claimantName: "सीता देवी",
      area: 1.8,
      status: "submitted",
      coordinates: [22.5826, 88.3739],
      type: "CFR",
      submittedDate: "2024-02-20",
    },
    {
      id: "3",
      claimantName: "गोपाल सिंह",
      area: 3.2,
      status: "draft",
      coordinates: [22.5626, 88.3539],
      type: "IFR",
      submittedDate: "2024-03-10",
    },
  ]

  const sampleVillage: VillageInfo = {
    name: "Ramgarh Village",
    district: "Jhargram",
    totalClaims: 45,
    approvedClaims: 32,
    pendingClaims: 8,
    rejectedClaims: 5,
  }

  const toggleLayer = (layerId: string) => {
    setSelectedLayers((prev) => (prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          console.log("[v0] Location obtained successfully")
        },
        (error) => {
          console.log("[v0] Geolocation error handled gracefully:", error.message)
          // Set a default location (e.g., center of India for FRA context)
          setUserLocation([20.5937, 78.9629]) // Center of India

          // Show user-friendly message instead of console error
          if (error.code === error.PERMISSION_DENIED) {
            console.log("[v0] User denied geolocation - using default location")
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.log("[v0] Location unavailable - using default location")
          } else if (error.code === error.TIMEOUT) {
            console.log("[v0] Location timeout - using default location")
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    } else {
      console.log("[v0] Geolocation not supported - using default location")
      setUserLocation([20.5937, 78.9629]) // Default to center of India
    }
  }

  const startVoiceSearch = () => {
    setIsVoiceSearch(true)
    // In real implementation, use Web Speech API
    setTimeout(() => {
      setIsVoiceSearch(false)
      setSearchQuery("Ramgarh Village")
    }, 2000)
  }

  const handleVillageClick = () => {
    setSelectedVillage(sampleVillage)
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const filteredClaims = sampleClaims.filter((claim) => filterStatus === "all" || claim.status === filterStatus)

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
        {/* Enhanced map visualization */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 md:grid-cols-12 grid-rows-8 md:grid-rows-12 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-slate-400 md:block hidden"></div>
              ))}
              {Array.from({ length: 80 }).map((_, i) => (
                <div key={i + 64} className="border border-slate-400 md:hidden"></div>
              ))}
            </div>
          </div>

          {/* Forest areas with colorblind-safe colors */}
          <div className="absolute top-1/4 left-1/4 w-20 h-16 md:w-32 md:h-24 bg-emerald-200 opacity-70 border-2 border-emerald-600 rounded-sm"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-12 md:w-28 md:h-20 bg-emerald-200 opacity-70 border-2 border-emerald-600 rounded-sm"></div>

          {/* Villages - clickable */}
          <button
            onClick={handleVillageClick}
            className="absolute top-1/3 left-1/2 w-8 h-8 md:w-6 md:h-6 bg-indigo-600 border-2 border-white shadow-lg hover:bg-indigo-700 transition-colors rounded-sm flex items-center justify-center"
          >
            <span className="text-white text-xs">🏛️</span>
          </button>
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 md:w-6 md:h-6 bg-indigo-600 border-2 border-white shadow-lg rounded-sm flex items-center justify-center">
            <span className="text-white text-xs">🏛️</span>
          </div>

          {/* Claims with different colors for types */}
          {filteredClaims.map((claim, index) => (
            <div
              key={claim.id}
              className={`absolute w-10 h-10 md:w-8 md:h-8 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform rounded-sm ${
                claim.type === "IFR" ? "bg-green-500" : claim.type === "CFR" ? "bg-blue-500" : "bg-purple-500"
              } ${
                claim.status === "approved"
                  ? "ring-2 ring-green-300"
                  : claim.status === "rejected"
                    ? "ring-2 ring-red-300"
                    : ""
              }`}
              style={{
                top: `${30 + index * 15}%`,
                left: `${25 + index * 20}%`,
              }}
            >
              <span className="text-white text-xs">
                {claim.type === "IFR" ? "🏠" : claim.type === "CFR" ? "🏘️" : "📋"}
              </span>
            </div>
          ))}

          {/* User location */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 w-6 h-6 md:w-4 md:h-4 bg-red-500 border-2 border-white shadow-lg animate-pulse rounded-full"></div>
          )}
        </div>
      </div>

      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search villages, patta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 bg-white border-slate-200 shadow-lg text-sm md:text-base h-12 md:h-10"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={startVoiceSearch}
              disabled={isVoiceSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 h-10 w-10 md:h-8 md:w-8"
            >
              <Mic className={`h-4 w-4 ${isVoiceSearch ? "text-red-500 animate-pulse" : "text-slate-400"}`} />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="bg-white border-slate-200 shadow-lg h-12 w-12 md:h-10 md:w-10 p-0"
          >
            <Locate className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="bg-white border-slate-200 shadow-lg h-12 w-12 md:h-10 md:w-10 p-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card
        className={`absolute top-20 right-4 p-4 w-72 md:w-56 z-20 shadow-lg transition-transform duration-300 ${
          showLayerPanel ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } md:block`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-900">Map Layers</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowLayerPanel(false)} className="md:hidden p-1 h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {mapLayers.map((layer) => (
            <div key={layer.id} className="flex items-center gap-3">
              <button
                onClick={() => toggleLayer(layer.id)}
                className={`w-6 h-6 border-2 flex items-center justify-center text-xs rounded-sm ${
                  selectedLayers.includes(layer.id)
                    ? `${layer.color} border-slate-400 text-white`
                    : "bg-white border-slate-300"
                }`}
              >
                {selectedLayers.includes(layer.id) ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3 text-slate-400" />
                )}
              </button>
              <span className="text-base">{layer.icon}</span>
              <span className="text-sm text-slate-700 flex-1">{layer.name}</span>
            </div>
          ))}
        </div>

        {/* Time Slider */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-900">Historical View</span>
          </div>
          <div className="space-y-3">
            <Slider
              value={timeSlider}
              onValueChange={setTimeSlider}
              max={2024}
              min={2010}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600">
              <span>2010</span>
              <span className="font-medium text-sm">{timeSlider[0]}</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="absolute top-20 left-4 right-4 z-10 md:right-auto md:w-auto">
        <div className="flex gap-2 flex-wrap">
          {["all", "approved", "submitted", "rejected", "draft"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="text-xs bg-white border-slate-200 shadow-lg h-8 px-3"
            >
              <Filter className="h-3 w-3 mr-1" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {selectedVillage && (
        <Card className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 p-6 z-30 shadow-xl border-t-4 border-indigo-500 rounded-t-lg md:rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl md:text-lg font-semibold text-slate-900">{selectedVillage.name}</h3>
              <p className="text-base md:text-sm text-slate-600">{selectedVillage.district} District</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedVillage(null)} className="p-2 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl md:text-xl font-bold text-slate-900">{selectedVillage.totalClaims}</p>
              <p className="text-sm text-slate-600">Total</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl md:text-xl font-bold text-green-600">{selectedVillage.approvedClaims}</p>
              <p className="text-sm text-slate-600">Approved</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl md:text-xl font-bold text-orange-600">{selectedVillage.pendingClaims}</p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl md:text-xl font-bold text-red-600">{selectedVillage.rejectedClaims}</p>
              <p className="text-sm text-slate-600">Rejected</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <Button size="lg" className="flex-1 h-12 md:h-10">
              View Claims
            </Button>
            <Button size="lg" variant="outline" className="flex-1 bg-transparent h-12 md:h-10">
              Village Profile
            </Button>
          </div>
        </Card>
      )}

      {!selectedVillage && (
        <>
          <Button
            onClick={() => setShowClaimsList(!showClaimsList)}
            className="fixed bottom-6 right-6 md:hidden z-20 h-14 w-14 rounded-full shadow-xl"
          >
            <Plus className="h-6 w-6" />
          </Button>

          <Card
            className={`absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 p-6 max-h-80 md:max-h-48 overflow-y-auto z-20 shadow-xl transition-transform duration-300 rounded-t-lg md:rounded-lg ${
              showClaimsList ? "translate-y-0" : "translate-y-full md:translate-y-0"
            } md:block`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-sm font-medium text-slate-900">Nearby Claims ({filteredClaims.length})</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`h-10 md:h-8 ${isDrawing ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isDrawing ? "Cancel" : "New Claim"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClaimsList(false)}
                  className="md:hidden p-2 h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredClaims.slice(0, 3).map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 md:w-8 md:h-8 ${
                        claim.type === "IFR" ? "bg-green-500" : claim.type === "CFR" ? "bg-blue-500" : "bg-purple-500"
                      } flex items-center justify-center text-white text-sm rounded-lg`}
                    >
                      {claim.type === "IFR" ? "🏠" : claim.type === "CFR" ? "🏘️" : "📋"}
                    </div>
                    <div className="flex-1">
                      <p className="text-base md:text-sm font-medium text-slate-900">{claim.claimantName}</p>
                      <p className="text-sm md:text-xs text-slate-600">
                        {claim.area} hectares • {claim.type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      claim.status === "approved"
                        ? "default"
                        : claim.status === "submitted"
                          ? "secondary"
                          : claim.status === "rejected"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-xs px-3 py-1"
                  >
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {isDrawing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <Card className="p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl md:text-lg font-semibold text-slate-900 mb-3">Draw Claim Boundary</h3>
            <p className="text-base md:text-sm text-slate-600 mb-6">
              Tap on the map to mark the corners of your land claim. Tap the first point again to complete the boundary.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <Button variant="outline" onClick={() => setIsDrawing(false)} className="flex-1 h-12 md:h-10">
                Cancel
              </Button>
              <Button className="flex-1 h-12 md:h-10">Save Boundary</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
