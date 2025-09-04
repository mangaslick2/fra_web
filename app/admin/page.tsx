import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AdminNavigation />
      <main className="flex-1 overflow-hidden">
        <AdminDashboard />
      </main>
    </div>
  )
}
