'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-draw/dist/leaflet.draw.css'

// Import leaflet-draw to extend L with Draw functionality
if (typeof window !== 'undefined') {
  require('leaflet-draw')
}

interface DrawControlProps {
  onCreated: (e: any) => void
  onEdited: (e: any) => void
  onDeleted: (e: any) => void
}

const DrawControl: React.FC<DrawControlProps> = ({ onCreated, onEdited, onDeleted }) => {
  const map = useMap()
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup())

  useEffect(() => {
    const drawnItems = drawnItemsRef.current
    map.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#4f46e5',
            weight: 2,
          },
        },
        polyline: false,
        circle: false,
        rectangle: {
          shapeOptions: {
            color: '#4f46e5',
            weight: 2,
          },
        },
        marker: false,
        circlemarker: false,
      },
    })

    map.addControl(drawControl)

    const handleDrawCreated = (e: any) => {
      const layer = e.layer
      drawnItems.addLayer(layer)
      onCreated(e)
    }

    const handleDrawEdited = (e: any) => {
      onEdited(e)
    }

    const handleDrawDeleted = (e: any) => {
      onDeleted(e)
    }

    map.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.on(L.Draw.Event.EDITED, handleDrawEdited)
    map.on(L.Draw.Event.DELETED, handleDrawDeleted)

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated)
      map.off(L.Draw.Event.EDITED, handleDrawEdited)
      map.off(L.Draw.Event.DELETED, handleDrawDeleted)
      
      // Check if map still has control before removing
      if (map && map.hasLayer(drawnItems)) {
        map.removeLayer(drawnItems)
      }
      // This check is to prevent errors during hot-reloads in development
      if (map && (map as any)._container.contains(drawControl.getContainer())) {
        map.removeControl(drawControl)
      }
    }
  }, [map, onCreated, onEdited, onDeleted])

  return null
}

export default DrawControl
