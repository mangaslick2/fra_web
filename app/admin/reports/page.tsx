import { AdminReportsDashboard } from "@/components/admin-reports-dashboard"
import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AdminNavigation />
      <main className="flex-1 overflow-hidden">
        <AdminReportsDashboard />
      </main>
    </div>
  )
}
