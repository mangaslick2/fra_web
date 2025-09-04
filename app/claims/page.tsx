import { ClaimsManager } from "@/components/claims-manager"
import { Navigation } from "@/components/navigation"

export default function ClaimsPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <ClaimsManager />
      </main>
    </div>
  )
}
