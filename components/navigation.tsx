"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  User,
  FileText,
  Map,
  Settings,
  Plus,
  Satellite,
  Home,
  Target,
  Users,
  HelpCircle,
  Bell,
  ChevronRight,
  LogOut,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface NavigationProps {
  user?: SupabaseUser | null
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  const userRole = user?.user_metadata?.role || "citizen"
  const isAdmin = ["forest_officer", "district_collector"].includes(userRole)
  const isGramSabha = userRole === "gram_sabha"

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", subtitle: "होम", badge: null },
    { href: "/map", icon: Map, label: "FRA Atlas", subtitle: "एफआरए एटलस", badge: null },
    {
      href: "/my-claims",
      icon: FileText,
      label: "My Claims",
      subtitle: "मेरे दावे",
      badge: user ? "3" : null,
      requiresAuth: true,
    },
    {
      href: "/claims/new",
      icon: Plus,
      label: "File New Claim",
      subtitle: "नया दावा दर्ज करें",
      badge: null,
      requiresAuth: true,
    },
    { href: "/asset-maps", icon: Satellite, label: "Asset Maps", subtitle: "संपत्ति मानचित्र", badge: null },
    { href: "/dss", icon: Target, label: "DSS Recommendations", subtitle: "डीएसएस सिफारिशें", badge: "2" },
    {
      href: "/gram-sabha",
      icon: Users,
      label: "Gram Sabha Hub",
      subtitle: "ग्राम सभा हब",
      badge: null,
      showFor: ["gram_sabha", "forest_officer", "district_collector"],
    },
    { href: "/help", icon: HelpCircle, label: "Help & Training", subtitle: "सहायता और प्रशिक्षण", badge: null },
  ]

  const adminItems = [
    { href: "/admin", icon: Settings, label: "Admin Dashboard", subtitle: "प्रशासन डैशबोर्ड", badge: "12" },
    { href: "/admin/reports", icon: FileText, label: "Reports", subtitle: "रिपोर्ट", badge: null },
  ]

  const filteredNavItems = navigationItems.filter((item) => {
    if (item.requiresAuth && !user) return false
    if (item.showFor && !item.showFor.includes(userRole)) return false
    return true
  })

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-4 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-lg hover:bg-slate-100">
                <Menu className="h-5 w-5 text-slate-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-80 p-0 bg-white">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">FRA</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Forest Rights Portal</h2>
                      <p className="text-sm text-slate-600">वन अधिकार पोर्टल</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${user ? "bg-green-500" : "bg-gray-400"}`}></div>
                    <span>{user ? "Authenticated" : "Guest"} • Connected</span>
                  </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="mb-4">
                      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-3">
                        Main Menu
                      </h3>
                      {filteredNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between px-3 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                              <item.icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <span className="font-medium text-sm">{item.label}</span>
                              <p className="text-xs text-slate-500">{item.subtitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {isAdmin && (
                      <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-3">
                          Administration
                        </h3>
                        {adminItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between px-3 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <item.icon className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <span className="font-medium text-sm">{item.label}</span>
                                <p className="text-xs text-slate-500">{item.subtitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                  {item.badge}
                                </Badge>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>

                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900">{user.user_metadata?.name || user.email}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {userRole.replace("_", " ")} • {user.user_metadata?.phone || "No phone"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <Settings className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 bg-transparent"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">Guest User</p>
                        <p className="text-xs text-slate-500">Sign in to access all features</p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <LogIn className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">FRA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900">Forest Rights</h1>
              <p className="text-xs text-slate-600 -mt-1">Portal</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-lg hover:bg-slate-100 relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-lg hover:bg-slate-100">
            <div
              className={`w-6 h-6 bg-gradient-to-br ${user ? "from-blue-500 to-blue-600" : "from-gray-400 to-gray-500"} rounded-full flex items-center justify-center`}
            >
              <User className="h-3 w-3 text-white" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}
