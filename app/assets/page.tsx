import { AssetDetectionDashboard } from "@/components/asset-detection-dashboard"
import { Navigation } from "@/components/navigation"

export default function AssetsPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <AssetDetectionDashboard />
      </main>
    </div>
  )
}
