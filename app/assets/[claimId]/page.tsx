import { AssetDetectionViewer } from "@/components/asset-detection-viewer"
import { Navigation } from "@/components/navigation"

interface AssetPageProps {
  params: Promise<{ claimId: string }>
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { claimId } = await params

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <AssetDetectionViewer claimId={claimId} />
      </main>
    </div>
  )
}
