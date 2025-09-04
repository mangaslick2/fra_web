"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Navigation } from "@/components/navigation"
import { AuthModal } from "@/components/auth-modal"
import type { User } from "@supabase/supabase-js"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Pages that don't require navigation
  const noNavPages = ["/auth/login", "/auth/sign-up", "/auth/error"]
  const showNavigation = !noNavPages.includes(pathname)

  // Pages that require authentication
  const protectedPages = ["/admin", "/claims/new"]
  const requiresAuth = protectedPages.some((page) => pathname.startsWith(page))

  // Handle auth requirement
  useEffect(() => {
    if (!loading && requiresAuth && !user) {
      setShowAuthModal(true)
    }
  }, [loading, requiresAuth, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavigation && <Navigation user={user} />}
      <main className={showNavigation ? "pt-16" : ""}>{children}</main>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
