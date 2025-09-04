import { Suspense } from "react"
import { AssetMapsInterface } from "@/components/asset-maps-interface"

export default function AssetMapsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Asset Maps...</p>
            </div>
          </div>
        }
      >
        <AssetMapsInterface />
      </Suspense>
    </div>
  )
}
