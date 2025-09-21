'use client'

import React, { useEffect, useState, useRef, useMemo, useCallback, useReducer } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import {
  MapPin, Layers3, Search, Volume2, Download, Wifi, WifiOff, X, Filter, Locate, Calendar,
  Trees, User, Users, ChevronsRight, Info, Minus, Plus, Sun, Moon, AlertCircle, RefreshCw, Loader2,
  Mountain, Droplets, Waypoints, BrainCircuit, Lightbulb
} from 'lucide-react'

// Import Leaflet CSS at the top
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-draw/dist/leaflet.draw.css'

// UI Components from shadcn/ui (assumed to be in the project)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster, toast } from 'sonner' // Using sonner for cleaner notifications
import { offlineService } from '@/lib/offline-service'

const DrawControl = dynamic(() => import('@/components/draw-control'), { ssr: false })

// --- ENHANCED SERVICES WITH ERROR HANDLING ---
const audioService = {
  speak: async (text: string, options: { language: string }) => {
    try {
      console.log(`[AUDIO]: Speaking "${text}" in ${options.language}`)
      // In a real app, this would use window.speechSynthesis
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported')
      }
      // Simulate async speech
      return new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('[AUDIO ERROR]:', error)
      toast.error('Voice feature unavailable')
      throw error
    }
  },
  startListening: (callback: (text: string) => void) => {
    try {
      console.log('[AUDIO]: Listening...')
      // In a real app, this would use window.SpeechRecognition
      const sampleVoiceInput = "रामपुर"
      setTimeout(() => callback(sampleVoiceInput), 2000)
    } catch (error) {
      console.error('[AUDIO LISTEN ERROR]:', error)
      toast.error('Voice recognition unavailable')
    }
  }
}

// Fix for Leaflet's default icon path in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Custom DivIcon for better performance and styling
const createCustomIcon = (type: string, status: string) => {
  const statusColors: { [key: string]: string } = {
    approved: 'bg-green-500',
    pending: 'bg-yellow-500',
    rejected: 'bg-red-500',
  }
  const typeIcons: { [key: string]: string } = {
    IFR: '👤', // User icon
    CFR: '🌳', // Tree icon
    CR: '💧', // Water drop
  }
  
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg">
             <div class="text-lg">${typeIcons[type] || '📍'}</div>
             <div class="absolute bottom-0 right-0 w-3 h-3 ${statusColors[status] || 'bg-gray-400'} rounded-full border-2 border-white"></div>
           </div>`,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};


// --- DYNAMIC IMPORTS FOR LEAFLET COMPONENTS ---
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false })
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false })
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), { ssr: false })


// --- TYPE DEFINITIONS ---
interface MapLayer {
  id: string
  name: string
  url: string
  attribution: string
  enabled: boolean
  opacity: number
  type: 'base' | 'overlay'
  icon?: React.ReactNode
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
  area: number
  polygon?: [number, number][]
}

interface FilterState {
  claimTypes: string[]
  statuses: string[]
  dateRange: { from: string; to: string }
  area: { min: number; max: number }
}

type FilterAction =
  | { type: 'SET_CLAIM_TYPES'; payload: string[] }
  | { type: 'SET_STATUSES'; payload: string[] }
  | { type: 'SET_DATE_RANGE'; payload: { from: string; to: string } }
  | { type: 'SET_AREA_RANGE'; payload: { min: number; max: number } }
  | { type: 'RESET_FILTERS' }

// --- REDUCER FOR FILTER STATE MANAGEMENT ---
const initialFilterState: FilterState = {
  claimTypes: ['IFR', 'CFR', 'CR'],
  statuses: ['pending', 'approved', 'rejected'],
  dateRange: { from: '2020-01-01', to: new Date().toISOString().split('T')[0] },
  area: { min: 0, max: 100 },
}

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_CLAIM_TYPES': return { ...state, claimTypes: action.payload }
    case 'SET_STATUSES': return { ...state, statuses: action.payload }
    case 'SET_DATE_RANGE': return { ...state, dateRange: action.payload }
    case 'SET_AREA_RANGE': return { ...state, area: action.payload }
    case 'RESET_FILTERS': return initialFilterState
    default: return state
  }
}


const initialMapLayers: MapLayer[] = [
  { id: 'street', name: 'Street', type: 'base', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap', enabled: true, opacity: 1, icon: <MapPin className="w-5 h-5" /> },
  { id: 'satellite', name: 'Satellite', type: 'base', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri', enabled: false, opacity: 1, icon: <Trees className="w-5 h-5" /> },
  { id: 'topo', name: 'Topographic', type: 'base', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '© OpenTopoMap', enabled: false, opacity: 1, icon: <Mountain className="w-5 h-5" /> },
  
  { id: 'forestCover', name: 'Forest Cover', type: 'overlay', url: 'https://tiles.globalforestwatch.org/umd_as_it_happens/v1.10/tcd_30/2020/{z}/{x}/{y}.png', attribution: '© GFW', enabled: false, opacity: 0.7, icon: <Trees className="w-5 h-5 text-green-600" /> },
  { id: 'waterBodies', name: 'Water Bodies', type: 'overlay', url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', attribution: '© Stadia Maps', enabled: false, opacity: 0.7, icon: <Droplets className="w-5 h-5 text-blue-600" /> },
  { id: 'gatiShakti', name: 'PM Gati Shakti', type: 'overlay', url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', attribution: '© OpenStreetMap HOT', enabled: false, opacity: 0.7, icon: <Waypoints className="w-5 h-5 text-orange-600" /> },
]

// Reducer for managing map layers state
type LayerAction = 
  | { type: 'TOGGLE_LAYER'; id: string }
  | { type: 'SET_BASE_LAYER'; id: string }
  | { type: 'SET_OPACITY'; id: string; opacity: number }
  | { type: 'RESET_LAYERS' }

function layerReducer(state: MapLayer[], action: LayerAction): MapLayer[] {
  switch (action.type) {
    case 'TOGGLE_LAYER':
      return state.map(layer => 
        layer.id === action.id ? { ...layer, enabled: !layer.enabled } : layer
      )
    case 'SET_BASE_LAYER':
      return state.map(layer => 
        layer.type === 'base' 
          ? { ...layer, enabled: layer.id === action.id }
          : layer
      )
    case 'SET_OPACITY':
      return state.map(layer => 
        layer.id === action.id ? { ...layer, opacity: action.opacity } : layer
      )
    case 'RESET_LAYERS':
      return initialMapLayers
    default:
      return state
  }
}

interface DssRecommendation {
  id: string
  title: string
  description: string
  type: 'info' | 'warning' | 'action'
  relatedTo: 'claim' | 'village' | 'region'
  relatedId: string
}

// --- MOCK DSS SERVICE ---
const dssService = {
  getRecommendationsForClaim: async (claimId: string): Promise<DssRecommendation[]> => {
    console.log(`[DSS] Fetching recommendations for claim ${claimId}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const recommendations: DssRecommendation[] = [
      { id: 'dss1', title: 'Potential Overlap', description: 'This claim area may overlap with a known wildlife corridor. Further verification is recommended.', type: 'warning', relatedTo: 'claim', relatedId: claimId },
      { id: 'dss2', title: 'Incomplete Documentation', description: 'The submitted documents do not include proof of residence for the required period. Please upload additional evidence.', type: 'action', relatedTo: 'claim', relatedId: claimId },
    ]
    
    // Return recommendations based on some logic
    return Math.random() > 0.5 ? recommendations : recommendations.slice(0, 1)
  },
  getRecommendationsForVillage: async (villageName: string): Promise<DssRecommendation[]> => {
    console.log(`[DSS] Fetching recommendations for village ${villageName}`)
    await new Promise(resolve => setTimeout(resolve, 700))
    
    return [
      { id: 'dss3', title: 'High Claim Density', description: `Village '${villageName}' has a high number of pending claims. Consider prioritizing verification here.`, type: 'info', relatedTo: 'village', relatedId: villageName },
    ]
  }
}

// --- THE MAIN COMPONENT ---
export function AdvancedMapInterface() {
  const mapRef = useRef<L.Map | null>(null)
  
  // --- STATE MANAGEMENT ---
  const [isOnline, setIsOnline] = useState(true)
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [claims, setClaims] = useState<ClaimMarker[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([23.5937, 78.9629]) // Default to India center
  const [activeTheme, setActiveTheme] = useState('light')
  
  // Enhanced loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [isCachingOfflineData, setIsCachingOfflineData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState)
  const [mapLayers, dispatchLayerAction] = useReducer(layerReducer, initialMapLayers)
  const [drawnItems, setDrawnItems] = useState<any[]>([])

  const [activeDssRecommendations, setActiveDssRecommendations] = useState<DssRecommendation[]>([])
  const [isDssLoading, setIsDssLoading] = useState(false)
  const [selectedClaimForDss, setSelectedClaimForDss] = useState<ClaimMarker | null>(null)

  // --- DRAW CONTROL HANDLERS ---
  const handleDrawCreated = (e: any) => {
    const { layerType, layer } = e
    const geoJSON = layer.toGeoJSON()
    setDrawnItems(prev => [...prev, geoJSON])
    toast.success(`New ${layerType} added. Save it as part of a claim.`)
    // Here you would typically open a form to associate this geometry with a new or existing claim
  }

  const handleDrawEdited = (e: any) => {
    const layers = e.layers
    layers.eachLayer((layer: any) => {
      const geoJSON = layer.toGeoJSON()
      // Find and update the corresponding item in your state
      setDrawnItems(prev => prev.map(item => 
        item.id === geoJSON.id ? geoJSON : item
      ))
    })
    toast.info('Boundary updated.')
  }

  const handleDrawDeleted = (e: any) => {
    const layers = e.layers
    layers.eachLayer((layer: any) => {
      const geoJSON = layer.toGeoJSON()
      // Remove the item from your state
      setDrawnItems(prev => prev.filter(item => item.id !== geoJSON.id))
    })
    toast.error('Boundary removed.')
  }

  // --- DATA FETCHING & INITIALIZATION ---
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Network status
        const updateOnlineStatus = () => setIsOnline(navigator.onLine)
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        updateOnlineStatus()

        // Geolocation with better error handling
        setIsLocationLoading(true)
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false,
              maximumAge: 300000 // 5 minutes
            })
          })
          setCurrentLocation([position.coords.latitude, position.coords.longitude])
          setLocationError(null)
          toast.success("Location detected successfully")
        } catch (geoError) {
          const errorMessage = getGeolocationErrorMessage(geoError)
          setLocationError(errorMessage)
          toast.warning(errorMessage)
        } finally {
          setIsLocationLoading(false)
        }
        
        // Load sample data with error handling
        await loadSampleData()
        
        // Try to load offline data if available
        try {
          if (!isOnline && typeof offlineService !== 'undefined') {
            const offlineData = await offlineService.getAllClaims()
            if (offlineData.length > 0) {
              // Convert OfflineClaim to ClaimMarker format
              const convertedClaims: ClaimMarker[] = offlineData.map(claim => {
                // Map offline status to UI status
                let uiStatus: 'pending' | 'approved' | 'rejected' = 'pending'
                if (claim.status === 'synced') uiStatus = 'approved'
                else if (claim.status === 'failed') uiStatus = 'rejected'
                
                return {
                  id: claim.id,
                  position: [claim.location.latitude, claim.location.longitude] as [number, number],
                  claimType: claim.claimType,
                  claimantName: claim.claimantDetails.name,
                  village: claim.claimantDetails.address,
                  status: uiStatus,
                  submittedAt: claim.createdAt.toDateString(),
                  area: Math.floor(Math.random() * 10) + 1, // Mock area as it's not in OfflineClaim
                  pattaNumber: `OFF-${claim.id.slice(-6)}` // Mock patta number
                }
              })
              setClaims(prev => [...prev, ...convertedClaims])
              toast.info(`${offlineData.length} offline claims loaded`)
            }
          }
        } catch (offlineError) {
          console.warn('Failed to load offline data:', offlineError)
          // Don't show error toast for offline data as it's optional
        }
        
      } catch (error) {
        console.error('Map initialization error:', error)
        setError('Failed to initialize map. Please refresh the page.')
        toast.error('Failed to initialize map')
      } finally {
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      window.removeEventListener('online', () => setIsOnline(navigator.onLine))
      window.removeEventListener('offline', () => setIsOnline(navigator.onLine))
    }
  }, [])

  const getGeolocationErrorMessage = (error: any): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied. Using default location."
      case error.POSITION_UNAVAILABLE:
        return "Location information unavailable. Using default location."
      case error.TIMEOUT:
        return "Location request timed out. Using default location."
      default:
        return "Could not access your location. Showing default area."
    }
  }

  const loadSampleData = async (): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate potential API failure
      if (Math.random() > 0.95) { // 5% chance of failure for testing
        throw new Error('API service temporarily unavailable')
      }
      
      // Extended sample data for better clustering demo
      const sampleClaims: ClaimMarker[] = Array.from({ length: 150 }, (_, i) => ({
          id: (i + 1).toString(),
          position: [23.5937 + (Math.random() - 0.5) * 0.2, 78.9629 + (Math.random() - 0.5) * 0.2],
          claimType: ['IFR', 'CFR', 'CR'][i % 3] as 'IFR' | 'CFR' | 'CR',
          status: ['pending', 'approved', 'rejected'][i % 3] as 'pending' | 'approved' | 'rejected',
          claimantName: `Claimant ${i + 1}`,
          village: ['रामपुर', 'श्यामपुर', 'हरिपुर'][i % 3],
          submittedAt: `202${i % 5}-0${(i % 12) + 1}-0${(i % 28) + 1}`,
          area: parseFloat((Math.random() * 10).toFixed(2)),
          pattaNumber: `PATTA/${2020 + (i%5)}/${i+1}`
      }));
      setClaims(sampleClaims);
    } catch (error) {
      console.error('Failed to load claims data:', error)
      setError('Failed to load claims data')
      toast.error('Failed to load claims data. Please try refreshing.')
      throw error
    }
  }

  // --- MEMOIZED FILTERING LOGIC ---
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const submittedDate = new Date(claim.submittedAt);
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);

      return filters.claimTypes.includes(claim.claimType) &&
             filters.statuses.includes(claim.status) &&
             (claim.area >= filters.area.min && claim.area <= filters.area.max) &&
             (submittedDate >= fromDate && submittedDate <= toDate) &&
             (searchQuery === '' ||
              claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              claim.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
              claim.pattaNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [claims, filters, searchQuery]);

  // --- EVENT HANDLERS (with useCallback for optimization) ---
  const handleLayerToggle = useCallback((id: string) => {
    dispatchLayerAction({ type: 'TOGGLE_LAYER', id })
  }, [])

  const handleBaseLayerChange = useCallback((id: string) => {
    dispatchLayerAction({ type: 'SET_BASE_LAYER', id })
    setActiveTheme(id.includes('dark') ? 'dark' : 'light');
  }, [])

  const handleLayerOpacity = useCallback((id: string, opacity: number) => {
    dispatchLayerAction({ type: 'SET_OPACITY', id, opacity: opacity / 100 })
  }, [])

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const flyToCurrentLocation = useCallback(async () => {
    setIsLocationLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        })
      })
      const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
      setCurrentLocation(newLoc);
      mapRef.current?.flyTo(newLoc, 15);
      toast.success("Moved to your current location!");
      setLocationError(null)
    } catch (error) {
      const errorMessage = getGeolocationErrorMessage(error)
      setLocationError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLocationLoading(false)
    }
  }, []);

  // Simple offline ready check
  const isOfflineServiceReady = () => {
    return typeof offlineService !== 'undefined' && 'serviceWorker' in navigator
  }

  const handleDssAnalysis = useCallback(async (claim: ClaimMarker) => {
    setIsDssLoading(true)
    setSelectedClaimForDss(claim)
    setActiveDssRecommendations([])
    try {
      const recommendations = await dssService.getRecommendationsForClaim(claim.id)
      setActiveDssRecommendations(recommendations)
      if (recommendations.length > 0) {
        setSidebarOpen(true) // Open sidebar to show results
        toast.success(`DSS analysis complete. Found ${recommendations.length} recommendations.`)
      } else {
        toast.info('DSS analysis complete. No specific recommendations found.')
      }
    } catch (error) {
      toast.error('DSS analysis failed.')
    } finally {
      setIsDssLoading(false)
    }
  }, [])

  const downloadOfflineMap = useCallback(async () => {
    if (!mapRef.current) {
      toast.error("Map not ready for offline download")
      return
    }
    
    setIsCachingOfflineData(true)
    try {
      const map = mapRef.current
      const bounds = map.getBounds()
      const zoom = map.getZoom()
      const center = map.getCenter()
      
      toast.info('Preparing map data for offline use...')
      
      // Save map data using the enhanced offline service
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
      
      // Cache current claims data
      for (const claim of filteredClaims) {
        try {
          await offlineService.saveClaim({
            id: claim.id,
            claimType: claim.claimType,
            claimantDetails: {
              name: claim.claimantName,
              address: claim.village || 'Unknown'
            },
            documents: [],
            location: {
              latitude: claim.position[0],
              longitude: claim.position[1]
            },
            status: 'synced',
            createdAt: new Date(claim.submittedAt || Date.now()),
            lastModified: new Date(),
            syncAttempts: 0
          })
        } catch (claimError) {
          console.warn(`Failed to cache claim ${claim.id}:`, claimError)
        }
      }
      
      const stats = await offlineService.getStorageStats()
      toast.success(`Map area cached! ${stats.claimsCount} claims saved (${(stats.totalSize / 1024 / 1024).toFixed(1)} MB)`)
      
    } catch (error) {
      console.error('Offline download failed:', error)
      toast.error('Failed to save map for offline use. Please try again.')
    } finally {
      setIsCachingOfflineData(false)
    }
  }, [filteredClaims, mapLayers]);

  // Retry mechanism for failed operations
  const retryOperation = useCallback(async (operation: () => Promise<void>, operationName: string) => {
    try {
      setError(null)
      await operation()
      toast.success(`${operationName} completed successfully`)
    } catch (error) {
      console.error(`${operationName} failed:`, error)
      toast.error(`${operationName} failed. Please try again.`)
    }
  }, [])

  // --- HELPER FUNCTIONS ---
  const getClaimStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  // --- RENDER ---
  return (
    <TooltipProvider>
      <div className={`relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex ${activeTheme}`}>
        <Toaster position="top-center" richColors />
        
        {/* === LOADING STATE === */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[500] flex items-center justify-center">
            <Card className="p-8">
              <CardContent className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Loading FRA Atlas</h3>
                  <p className="text-gray-600">Initializing map interface...</p>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* === ERROR STATE === */}
        {error && !isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[500] flex items-center justify-center">
            <Card className="p-8 max-w-md">
              <CardContent className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Map Error</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => retryOperation(loadSampleData, 'Data loading')}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* === BACKDROP === */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-[350]" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* === SIDEBAR: Layers & Filters === */}
        <div className={`
          fixed top-16 left-0 bg-white dark:bg-gray-800 z-[400]
          transition-transform duration-300 ease-in-out shadow-xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-full max-w-sm
          bottom-20 md:bottom-0
        `}>
          <Card className="h-full w-full rounded-none border-none shadow-xl">
            <CardHeader className="flex-row items-center justify-between p-4 border-b">
              <CardTitle className="text-xl font-bold dark:text-white">Map Controls</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <Tabs defaultValue="layers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="layers"><Layers3 className="w-4 h-4 mr-1" /> Layers</TabsTrigger>
                <TabsTrigger value="filters"><Filter className="w-4 h-4 mr-1" /> Filters</TabsTrigger>
                <TabsTrigger value="dss"><BrainCircuit className="w-4 h-4 mr-1" /> DSS</TabsTrigger>
              </TabsList>
              <div className="p-4 overflow-y-auto h-[calc(100%-3rem)]">
                <TabsContent value="layers" className="space-y-6">
                  {/* Base Layers */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">BASEMAP</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {mapLayers.filter(l => l.type === 'base').map(layer => (
                        <button key={layer.id} onClick={() => handleBaseLayerChange(layer.id)}
                          className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 ${layer.enabled ? 'border-blue-500 ring-2 ring-blue-500' : 'dark:border-gray-600'}`}>
                          {layer.icon}
                          <span className="text-xs">{layer.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Overlay Layers */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">OVERLAYS</h3>
                    <div className="space-y-4">
                      {mapLayers.filter(l => l.type === 'overlay').map(layer => (
                        <div key={layer.id}>
                          <div className="flex items-center justify-between">
                            <label htmlFor={`switch-${layer.id}`} className="flex items-center gap-2 cursor-pointer">
                              {layer.icon} <span className="font-medium">{layer.name}</span>
                            </label>
                            <Switch id={`switch-${layer.id}`} checked={layer.enabled} onCheckedChange={() => handleLayerToggle(layer.id)} />
                          </div>
                          {layer.enabled && (
                            <div className="mt-2 ml-8">
                               <Slider value={[layer.opacity * 100]} onValueChange={([v]) => handleLayerOpacity(layer.id, v)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="filters" className="space-y-6">
                  {/* Claim Type Filter */}
                  <div>
                    <label className="text-sm font-medium">Claim Types</label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {initialFilterState.claimTypes.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox id={type} checked={filters.claimTypes.includes(type)} onCheckedChange={checked => {
                            const newTypes = checked ? [...filters.claimTypes, type] : filters.claimTypes.filter(t => t !== type);
                            dispatch({ type: 'SET_CLAIM_TYPES', payload: newTypes });
                          }} />
                          <label htmlFor={type} className="text-sm cursor-pointer">{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium">Claim Status</label>
                     <div className="grid grid-cols-1 gap-2 mt-2">
                       {initialFilterState.statuses.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox id={status} checked={filters.statuses.includes(status)} onCheckedChange={checked => {
                            const newStatuses = checked ? [...filters.statuses, status] : filters.statuses.filter(s => s !== status);
                            dispatch({ type: 'SET_STATUSES', payload: newStatuses });
                          }} />
                          <label htmlFor={status} className="text-sm capitalize cursor-pointer">{status}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Area Filter */}
                  <div>
                     <label className="text-sm font-medium">Area (acres): {filters.area.min} - {filters.area.max}</label>
                     <Slider value={[filters.area.min, filters.area.max]} onValueChange={([min, max]) => dispatch({ type: 'SET_AREA_RANGE', payload: { min, max }})} max={100} step={1} className="mt-2" />
                  </div>
                   {/* Date Range Filter */}
                  <div>
                     <label className="text-sm font-medium">Submission Date</label>
                     <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input type="date" value={filters.dateRange.from} onChange={e => dispatch({type: 'SET_DATE_RANGE', payload: {...filters.dateRange, from: e.target.value}})} />
                        <Input type="date" value={filters.dateRange.to} onChange={e => dispatch({type: 'SET_DATE_RANGE', payload: {...filters.dateRange, to: e.target.value}})} />
                     </div>
                  </div>
                  <Separator />
                  <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'RESET_FILTERS' })}>Reset Filters</Button>
                </TabsContent>
                <TabsContent value="dss" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><BrainCircuit className="w-5 h-5" /> DSS Recommendations</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveDssRecommendations([])}>Clear</Button>
                  </div>
                  {isDssLoading && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  )}
                  {activeDssRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {activeDssRecommendations.map(rec => (
                        <Alert key={rec.id} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                          <Lightbulb className="h-4 w-4" />
                          <AlertTitle>{rec.title}</AlertTitle>
                          <AlertDescription>{rec.description}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    !isDssLoading && <p className="text-sm text-gray-500 text-center py-4">Click "Run DSS Analysis" on a claim to see recommendations.</p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* === MAP AREA === */}
        <div className="flex-1 h-full relative">
          {/* Top Bar: Search and Status */}
          <div className="absolute top-4 left-4 right-4 z-[300] flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Sidebar Toggle Button */}
               <Button size="icon" variant="secondary" className="shadow-md bg-white/90 backdrop-blur-sm" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                <ChevronsRight className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
              </Button>
               {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search name, village, patta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48 md:w-64 shadow-md bg-white/90 backdrop-blur-sm"/>
              </div>
            </div>
             {/* Status Badges */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2 shadow-md bg-white/90 backdrop-blur-sm">
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              
              {locationError && (
                <Badge variant="destructive" className="flex items-center gap-2 shadow-md bg-white/90 backdrop-blur-sm text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Location Error
                </Badge>
              )}
              
              {!isOnline && isOfflineServiceReady() && (
                <Badge variant="secondary" className="flex items-center gap-1 shadow-md bg-white/90 backdrop-blur-sm text-xs">
                  Offline Ready
                </Badge>
              )}
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[300] flex flex-col gap-2">
            <Card className="p-1 bg-white/90 backdrop-blur-sm shadow-md">
              <Button size="icon" variant="ghost" onClick={handleZoomIn}><Plus/></Button>
              <Separator/>
              <Button size="icon" variant="ghost" onClick={handleZoomOut}><Minus/></Button>
            </Card>
            <Card className="p-1 bg-white/90 backdrop-blur-sm shadow-md">
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={flyToCurrentLocation}
                    disabled={isLocationLoading}
                  >
                    {isLocationLoading ? <Loader2 className="animate-spin" /> : <Locate />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isLocationLoading ? 'Getting location...' : 'My Location'}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={downloadOfflineMap}
                    disabled={isCachingOfflineData || !isOfflineServiceReady()}
                  >
                    {isCachingOfflineData ? <Loader2 className="animate-spin" /> : <Download />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>
                    {isCachingOfflineData 
                      ? 'Saving for offline...' 
                      : isOfflineServiceReady() 
                        ? 'Save Map Offline' 
                        : 'Offline not supported'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </Card>
          </div>

          {/* Map Legend & Summary */}
          <Card className="absolute left-4 z-[300] p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md max-w-xs bottom-24 md:bottom-4">
             <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm">Legend</h4>
                <Badge variant="outline">{filteredClaims.length} / {claims.length} shown</Badge>
             </div>
             <div className="flex gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Approved</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Rejected</div>
             </div>
          </Card>
          
          {/* Leaflet Map Container */}
          <MapContainer
            ref={mapRef}
            center={currentLocation}
            zoom={10}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            {/* Base Tile Layers */}
            {mapLayers.filter(l => l.type === 'base' && l.enabled).map(l => (
              <TileLayer key={l.id} url={l.url} attribution={l.attribution} />
            ))}

            {/* Overlay Tile Layers */}
            {mapLayers.filter(l => l.type === 'overlay' && l.enabled).map(l => (
              <TileLayer key={l.id} url={l.url} attribution={l.attribution} opacity={l.opacity} />
            ))}
            
            {/* Marker Cluster Group */}
            <MarkerClusterGroup chunkedLoading>
              {filteredClaims.map(claim => (
                <Marker key={claim.id} position={claim.position} icon={createCustomIcon(claim.claimType, claim.status)}>
                  <Popup>
                    <div className="w-64 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{ { IFR: '👤', CFR: '🌳', CR: '💧' }[claim.claimType] }</div>
                        <div>
                          <p className="font-bold text-base">{claim.claimantName}</p>
                          <p className="text-xs text-gray-500">{claim.village}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <Badge variant="secondary">{claim.claimType}</Badge>
                         <Badge variant={getClaimStatusBadgeVariant(claim.status)} className="capitalize">{claim.status}</Badge>
                      </div>
                      <Separator />
                      <div className="text-sm grid grid-cols-2 gap-1">
                          <p className="text-gray-600">Patta #:</p> <p className="font-mono">{claim.pattaNumber || 'N/A'}</p>
                          <p className="text-gray-600">Area:</p> <p>{claim.area} acres</p>
                          <p className="text-gray-600">Submitted:</p> <p>{claim.submittedAt}</p>
                      </div>
                       <Button size="sm" className="w-full mt-2" onClick={() => handleDssAnalysis(claim)}>
                         {isDssLoading && selectedClaimForDss?.id === claim.id ? (
                           <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                         ) : (
                           <><BrainCircuit className="w-4 h-4 mr-2" /> Run DSS Analysis</>
                         )}
                       </Button>
                       <Button size="sm" variant="outline" className="w-full">View Full Details</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
             
             {/* Current Location Marker */}
             <Marker position={currentLocation}>
               <Popup>Your approximate location</Popup>
             </Marker>

             {/* Drawing Tools */}
             <DrawControl 
                onCreated={handleDrawCreated}
                onEdited={handleDrawEdited}
                onDeleted={handleDrawDeleted}
             />
          </MapContainer>
        </div>
      </div>
    </TooltipProvider>
  )
}