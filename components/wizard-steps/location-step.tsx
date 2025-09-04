"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Map, Crosshair } from "lucide-react"
import { useState } from "react"

interface LocationStepProps {
  data: any
  updateData: (updates: any) => void
}

export function LocationStep({ data, updateData }: LocationStepProps) {
  const [gettingLocation, setGettingLocation] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)

  const captureGPS = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateData({
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
          setGettingLocation(false)
        },
        (error) => {
          console.error("GPS Error:", error)
          setGettingLocation(false)
        },
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">स्थान चिह्नित करें</h2>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Mark Location</h3>
        <p className="text-slate-600">Capture GPS location and mark land boundaries</p>
      </div>

      {/* GPS Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            GPS Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.location ? (
            <Button
              onClick={captureGPS}
              disabled={gettingLocation}
              className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
            >
              <Navigation className="h-6 w-6 mr-2" />
              {gettingLocation ? "Getting Location..." : "Capture GPS Location"}
            </Button>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">Location Captured!</p>
              <p className="text-sm text-green-600">
                Lat: {data.location.lat.toFixed(6)}, Lng: {data.location.lng.toFixed(6)}
              </p>
              <Button variant="outline" size="sm" onClick={captureGPS} className="mt-2 bg-transparent">
                Update Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boundary Drawing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-600" />
            Land Boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-100 h-64 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Crosshair className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Interactive Map</p>
              <p className="text-sm text-slate-500">Tap corners to mark boundaries</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={drawingMode ? "default" : "outline"}
              onClick={() => setDrawingMode(!drawingMode)}
              className="flex-1"
            >
              {drawingMode ? "Stop Drawing" : "Start Drawing"}
            </Button>
            <Button variant="outline" onClick={() => updateData({ boundaries: [] })}>
              Clear
            </Button>
          </div>

          {data.boundaries.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 text-sm">{data.boundaries.length} boundary points marked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
