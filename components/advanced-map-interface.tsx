'use client'

import React, { useEffect, useState, useRef, useMemo, useCallback, useReducer } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import {
  MapPin, Layers3, Search, Volume2, Download, Wifi, WifiOff, X, Filter, Locate, Calendar,
  Trees, User, Users, ChevronsRight, Info, Minus, Plus, Sun, Moon
} from 'lucide-react'

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
import { Toaster, toast } from 'sonner' // Using sonner for cleaner notifications

// --- MOCK SERVICES (for demonstration) ---
const audioService = {
  speak: (text: string, options: { language: string }) => {
    console.log(`[AUDIO]: Speaking "${text}" in ${options.language}`)
    // In a real app, this would use window.speechSynthesis
  },
  startListening: (callback: (text: string) => void) => {
    console.log('[AUDIO]: Listening...')
    // In a real app, this would use window.SpeechRecognition
    const sampleVoiceInput = "रामपुर"
    setTimeout(() => callback(sampleVoiceInput), 2000)
  }
}

const offlineService = {
  getAllClaims: async () => {
    console.log('[OFFLINE]: Getting all claims from cache.')
    return [] // Return empty array to avoid conflict with sample data
  },
  cacheMapData: async (key: string, data: any) => {
    console.log(`[OFFLINE]: Caching map data for key "${key}".`)
    toast.success("Map area saved for offline use!")
  }
}
// --- END MOCK SERVICES ---

// --- LEAFLET & MARKER CLUSTER SETUP ---
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

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
interface MapLayerConfig {
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
  
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState)

  const [mapLayers, setMapLayers] = useState<MapLayerConfig[]>([
    {
      id: 'osm-light', name: 'Streets', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors', enabled: true, opacity: 1, type: 'base', icon: <Sun />
    },
    {
      id: 'osm-dark', name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO', enabled: false, opacity: 1, type: 'base', icon: <Moon />
    },
    {
      id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri', enabled: false, opacity: 1, type: 'base', icon: <Layers3 />
    },
    {
      id: 'villages', name: 'Village Boundaries', url: '', attribution: '', enabled: true, opacity: 0.5, type: 'overlay', icon: <Users />
    },
  ])

  // --- DATA FETCHING & INITIALIZATION ---
  useEffect(() => {
    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    // Geolocation
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLocation([pos.coords.latitude, pos.coords.longitude]),
      () => toast.warning("Could not access your location. Showing default area.")
    )
    
    // Load sample data
    loadSampleData()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const loadSampleData = () => {
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
    setMapLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l))
  }, [])

  const handleBaseLayerChange = useCallback((id: string) => {
    setMapLayers(prev => prev.map(l => ({
      ...l,
      enabled: l.type === 'base' ? l.id === id : l.enabled
    })))
    setActiveTheme(id.includes('dark') ? 'dark' : 'light');
  }, [])

  const handleLayerOpacity = useCallback((id: string, opacity: number) => {
    setMapLayers(prev => prev.map(l => l.id === id ? { ...l, opacity: opacity / 100 } : l))
  }, [])

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const flyToCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(newLoc);
        mapRef.current?.flyTo(newLoc, 15);
        toast.success("Moved to your current location!");
      },
      () => toast.error("Location permission denied.")
    )
  }, []);

  const downloadOfflineMap = useCallback(async () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      await offlineService.cacheMapData('current_view', { bounds });
    }
  }, []);

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
            <Tabs defaultValue="layers" className="h-[calc(100%-4rem)] w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="layers"><Layers3 className="w-4 h-4 mr-2" />Layers</TabsTrigger>
                <TabsTrigger value="filters"><Filter className="w-4 h-4 mr-2" />Filters</TabsTrigger>
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
                  <Button variant="outline" className="w-full" onClick={() => dispatch({ type: 'RESET_FILTERS' })}>Reset Filters</Button>
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
             {/* Status Badge */}
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2 shadow-md pointer-events-auto bg-white/90 backdrop-blur-sm">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
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
                <TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={flyToCurrentLocation}><Locate/></Button></TooltipTrigger>
                <TooltipContent side="left"><p>My Location</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={downloadOfflineMap}><Download/></Button></TooltipTrigger>
                <TooltipContent side="left"><p>Save Map Offline</p></TooltipContent>
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
                       <Button size="sm" className="w-full mt-2">View Full Details</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
             
             {/* Current Location Marker */}
             <Marker position={currentLocation}>
               <Popup>Your approximate location</Popup>
             </Marker>
          </MapContainer>
        </div>
      </div>
    </TooltipProvider>
  )
}