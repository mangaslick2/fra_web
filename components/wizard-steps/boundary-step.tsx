"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Square } from "lucide-react"

interface BoundaryStepProps {
  data: any
  updateData: (updates: any) => void
}

export function BoundaryStep({ data, updateData }: BoundaryStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Mark Land Boundary</h2>
        <p className="text-slate-600">Mark the boundaries of your land claim on the map</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Simplified map interface for boundary marking */}
          <div className="aspect-video bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-slate-300 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">Interactive Map</p>
                <p className="text-sm text-slate-500">Tap to mark boundary points</p>
              </div>
            </div>

            {/* Sample boundary points */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
          <Navigation className="h-4 w-4" />
          Use GPS Location
        </Button>

        <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
          <Square className="h-4 w-4" />
          Draw Rectangle
        </Button>

        <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
          <MapPin className="h-4 w-4" />
          Mark Points
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tap on the map to mark the corners of your land</li>
            <li>• Use GPS for accurate location marking</li>
            <li>• Connect points to form a closed boundary</li>
            <li>• You can edit points by tapping on them</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
