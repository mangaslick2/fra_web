import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthSystem } from "@/components/auth-system"
import { GovernmentPortalLayout } from "@/components/government-portal-layout"
import { LanguageProvider } from "@/contexts/language-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Forest Rights Portal - वन अधिकार पोर्टल",
  description: "Forest Rights Act Claims Management System with AI and Satellite Integration",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FRA Portal"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FRA Portal" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        }>
          <LanguageProvider>
            <AuthSystem>
              <GovernmentPortalLayout>
                {children}
              </GovernmentPortalLayout>
            </AuthSystem>
          </LanguageProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
