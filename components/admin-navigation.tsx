"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Shield, Bell, BarChart3, Home, FileText, Users, Settings } from "lucide-react"
import Link from "next/link"

export function AdminNavigation() {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Admin Portal</h2>
                  <p className="text-sm text-slate-600 mt-1">Forest Rights Administration</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/reports">
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Reports & Analytics
                    </Button>
                  </Link>
                  <Link href="/claims">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Claims Management
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-slate-900">Admin Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">3</Badge>
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
