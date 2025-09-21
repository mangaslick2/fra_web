'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default function AssetMapsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to assets page with map tab after a brief delay
    const timer = setTimeout(() => {
      router.replace('/assets?tab=map')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
          <p className="text-muted-foreground text-sm">
            Asset Maps has been integrated into the main Assets page. 
            You'll be redirected to the Map View automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
