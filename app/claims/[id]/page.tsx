import { ClaimDetails } from "@/components/claim-details"
import { Navigation } from "@/components/navigation"

interface ClaimPageProps {
  params: Promise<{ id: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <ClaimDetails claimId={id} />
      </main>
    </div>
  )
}
