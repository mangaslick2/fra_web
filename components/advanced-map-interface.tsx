'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import L from 'leaflet'
import { 
  Map, 
  MapPin, 
  Layers, 
  Search, 
  Volume2,
  Download,
  Wifi,
  WifiOff,
  ZoomIn,
  ZoomOut,
  Locate
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'
import { offlineService } from '@/lib/offline-service'

// Fix Leaflet default markers issue
import 'leaflet/dist/leaflet.css'

// Configure Leaflet default icon
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
    <div className="text-center">
      <Map className="w-8 h-8 mx-auto mb-2 animate-pulse" />
      <p className="text-sm text-gray-500">Loading Map...</p>
    </div>
  </div>
})

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false })
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false })
const FeatureGroup = dynamic(() => import('react-leaflet').then(mod => mod.FeatureGroup), { ssr: false })

interface MapLayerConfig {
  id: string
  name: string
  nameHi: string
  url: string
  enabled: boolean
  opacity: number
  type: 'base' | 'overlay'
  icon: string
}

interface ClaimMarker {
  id: string
  position: [number, number]
  claimType: 'IFR' | 'CFR' | 'CR'
  status: 'pending' | 'approved' | 'rejected'
  claimantName: string
  pattaNumber?: string
  village: string
  submittedAt: string
  area?: number
  polygon?: [number, number][]
}

interface VillageInfo {
  name: string
  nameHi: string
  district: string
  state: string
  totalClaims: number
  approvedClaims: number
  pendingClaims: number
  rejectedClaims: number
  boundaries: [number, number][]
}

export function AdvancedMapInterface() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVillage, setSelectedVillage] = useState<VillageInfo | null>(null)
  const [claims, setClaims] = useState<ClaimMarker[]>([])
  const [mapLayers, setMapLayers] = useState<MapLayerConfig[]>([
    {
      id: 'satellite',
      name: 'Satellite',
      nameHi: 'उपग्रह',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      enabled: true,
      opacity: 1,
      type: 'base',
      icon: '🛰️'
    },
    {
      id: 'ifr',
      name: 'Individual Forest Rights',
      nameHi: 'व्यक्तिगत वन अधिकार',
      url: '',
      enabled: true,
      opacity: 0.7,
      type: 'overlay',
      icon: '🏠'
    },
    {
      id: 'cfr',
      name: 'Community Forest Rights',
      nameHi: 'सामुदायिक वन अधिकार',
      url: '',
      enabled: true,
      opacity: 0.7,
      type: 'overlay',
      icon: '🌳'
    },
    {
      id: 'villages',
      name: 'Village Boundaries',
      nameHi: 'गांव की सीमाएं',
      url: '',
      enabled: true,
      opacity: 0.5,
      type: 'overlay',
      icon: '🏘️'
    },
    {
      id: 'forest',
      name: 'Forest Cover',
      nameHi: 'वन आवरण',
      url: '',
      enabled: false,
      opacity: 0.6,
      type: 'overlay',
      icon: '🌲'
    },
    {
      id: 'water',
      name: 'Water Bodies',
      nameHi: 'जल निकाय',
      url: '',
      enabled: false,
      opacity: 0.8,
      type: 'overlay',
      icon: '💧'
    }
  ])
  const [timeSlider, setTimeSlider] = useState([2024])
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)

    // Get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.warn('Location access denied:', error)
          // Default to center of India
          setCurrentLocation([23.5937, 78.9629])
        }
      )
    }

    // Load offline data if available
    loadOfflineData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineData = async () => {
    try {
      const cachedClaims = await offlineService.getAllClaims()
      const claimMarkers: ClaimMarker[] = cachedClaims.map(claim => ({
        id: claim.id,
        position: [claim.location.latitude, claim.location.longitude],
        claimType: claim.claimType,
        status: claim.status === 'synced' ? 'approved' : 'pending',
        claimantName: claim.claimantDetails.name,
        village: 'Unknown', // Would come from geocoding
        submittedAt: claim.createdAt.toISOString(),
      }))
      setClaims(claimMarkers)
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }

  const handleLayerToggle = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, enabled: !layer.enabled }
        : layer
    ))
    
    if (voiceEnabled) {
      const layer = mapLayers.find(l => l.id === layerId)
      const enabled = !layer?.enabled
      audioService.speak(
        `${layer?.nameHi} ${enabled ? 'चालू' : 'बंद'} किया गया`,
        { language: 'hi' }
      )
    }
  }

  const handleLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity: opacity / 100 }
        : layer
    ))
  }

  const handleVoiceSearch = async () => {
    try {
      if (voiceEnabled) {
        await audioService.speak('गांव का नाम बोलें', { language: 'hi' })
        await audioService.startListening((text) => {
          setSearchQuery(text)
          handleSearch(text)
        })
      }
    } catch (error) {
      console.error('Voice search failed:', error)
    }
  }

  const handleSearch = async (query: string) => {
    // Implement search logic for villages, claims, etc.
    console.log('Searching for:', query)
    
    if (voiceEnabled) {
      await audioService.speak(`${query} खोजा जा रहा है`, { language: 'hi' })
    }
  }

  const handleClaimClick = (claim: ClaimMarker) => {
    // Zoom to claim and show details
    if (mapRef.current) {
      mapRef.current.flyTo(claim.position, 16)
    }
    
    if (voiceEnabled) {
      audioService.speak(
        `${claim.claimantName} का ${claim.claimType} दावा`,
        { language: 'hi' }
      )
    }
  }

  const handleVillageClick = (village: VillageInfo) => {
    setSelectedVillage(village)
    
    if (voiceEnabled) {
      audioService.speak(
        `${village.nameHi} गांव में ${village.totalClaims} दावे हैं`,
        { language: 'hi' }
      )
    }
  }

  const downloadOfflineMap = async () => {
    // Download map tiles for offline use
    if (currentLocation && mapRef.current) {
      const bounds = mapRef.current.getBounds()
      const zoom = mapRef.current.getZoom()
      
      // Cache current view
      await offlineService.cacheMapData('current_view', {
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        },
        zoom,
        layers: mapLayers.filter(l => l.enabled).map(l => l.id),
        vectorTiles: {},
        lastUpdated: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
      
      if (voiceEnabled) {
        await audioService.speak('नक्शा ऑफलाइन सेव हो गया', { language: 'hi' })
      }
    }
  }

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getClaimTypeIcon = (type: string) => {
    switch (type) {
      case 'IFR': return '🏠'
      case 'CFR': return '🌳'
      case 'CR': return '💧'
      default: return '📍'
    }
  }

  if (!currentLocation) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Map className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      {/* Network Status */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Search Bar */}
      <Card className="absolute top-4 left-4 z-[1000] w-80">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search village, patta number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <Button size="sm" onClick={() => handleSearch(searchQuery)}>
              <Search className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleVoiceSearch} variant="outline">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Layer Control */}
      <Card className="absolute top-20 left-4 z-[1000] w-80 max-h-96 overflow-y-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Map Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mapLayers.map((layer) => (
            <div key={layer.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{layer.icon}</span>
                  <span className="text-sm font-medium">{layer.name}</span>
                </div>
                <Switch
                  checked={layer.enabled}
                  onCheckedChange={() => handleLayerToggle(layer.id)}
                />
              </div>
              {layer.enabled && layer.type === 'overlay' && (
                <div className="ml-6 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Opacity</span>
                    <span>{Math.round(layer.opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[layer.opacity * 100]}
                    onValueChange={([value]) => handleLayerOpacity(layer.id, value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
          <Separator />
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <div className="flex items-center justify-between text-xs">
              <span>2020</span>
              <span>2024</span>
            </div>
            <Slider
              value={timeSlider}
              onValueChange={setTimeSlider}
              min={2020}
              max={2024}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm">{timeSlider[0]}</div>
          </div>
        </CardContent>
      </Card>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <Button size="sm" onClick={downloadOfflineMap} variant="outline">
          <Download className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)} variant="outline">
          <Volume2 className={voiceEnabled ? "w-4 h-4 text-blue-600" : "w-4 h-4"} />
        </Button>
        <Button size="sm" variant="outline">
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      {/* Village Info Panel */}
      {selectedVillage && (
        <Card className="absolute bottom-4 left-4 z-[1000] w-80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedVillage.name}</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedVillage(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">{selectedVillage.district}, {selectedVillage.state}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Claims</div>
                <div className="text-2xl font-bold">{selectedVillage.totalClaims}</div>
              </div>
              <div>
                <div className="font-medium">Approved</div>
                <div className="text-2xl font-bold text-green-600">{selectedVillage.approvedClaims}</div>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-yellow-600">Pending: {selectedVillage.pendingClaims}</span>
              <span className="text-red-600">Rejected: {selectedVillage.rejectedClaims}</span>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">File Claim</Button>
              <Button size="sm" variant="outline" className="flex-1">View Details</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Map */}
      <MapContainer
        ref={mapRef}
        center={currentLocation}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        {mapLayers
          .filter(layer => layer.enabled && layer.type === 'base')
          .map(layer => (
            <TileLayer
              key={layer.id}
              url={layer.url}
              opacity={layer.opacity}
            />
          ))}
        
        {/* Claims Markers */}
        {claims.map(claim => (
          <Marker
            key={claim.id}
            position={claim.position}
            eventHandlers={{
              click: () => handleClaimClick(claim),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getClaimTypeIcon(claim.claimType)}</span>
                  <div>
                    <div className="font-medium">{claim.claimantName}</div>
                    <div className="text-sm text-gray-600">{claim.village}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{claim.claimType}</Badge>
                  <Badge className={getClaimStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                </div>
                {claim.pattaNumber && (
                  <div className="text-sm">Patta: {claim.pattaNumber}</div>
                )}
                <Button size="sm" className="w-full">View Details</Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current Location */}
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
