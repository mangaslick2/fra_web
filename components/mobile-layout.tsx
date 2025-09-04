'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Map,
  FileText,
  FolderCheck,
  HelpCircle,
  Menu,
  Home,
  BarChart3,
  Settings,
  User,
  Bell,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX
} from 'lucide-react'
import { offlineService } from '@/lib/offline-service'
import { audioService } from '@/lib/audio-service'

interface NavigationItem {
  id: string
  label: string
  labelHi: string
  icon: any
  href: string
  badge?: number
  primary?: boolean
}

const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'map',
    label: 'Map',
    labelHi: 'नक्शा',
    icon: Map,
    href: '/map',
    primary: true
  },
  {
    id: 'file-claim',
    label: 'File Claim',
    labelHi: 'दावा दर्ज करें',
    icon: FileText,
    href: '/claims/new',
    primary: true
  },
  {
    id: 'my-claims',
    label: 'My Claims',
    labelHi: 'मेरे दावे',
    icon: FolderCheck,
    href: '/my-claims',
    primary: true
  },
  {
    id: 'help',
    label: 'Help',
    labelHi: 'सहायता',
    icon: HelpCircle,
    href: '/help',
    primary: true
  },
  {
    id: 'more',
    label: 'More',
    labelHi: 'और',
    icon: Menu,
    href: '#',
    primary: true
  }
]

const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    labelHi: 'मुख्य पृष्ठ',
    icon: Home,
    href: '/'
  },
  {
    id: 'asset-maps',
    label: 'Asset Maps',
    labelHi: 'संपत्ति नक्शे',
    icon: Map,
    href: '/asset-maps'
  },
  {
    id: 'dss',
    label: 'Recommendations',
    labelHi: 'सिफारिशें',
    icon: BarChart3,
    href: '/dss'
  },
  {
    id: 'gram-sabha',
    label: 'Gram Sabha',
    labelHi: 'ग्राम सभा',
    icon: User,
    href: '/gram-sabha'
  },
  {
    id: 'admin',
    label: 'Admin',
    labelHi: 'प्रशासन',
    icon: Settings,
    href: '/admin'
  }
]

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [pendingClaims, setPendingClaims] = useState(0)
  const [notifications, setNotifications] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [storageStats, setStorageStats] = useState({
    claimsCount: 0,
    totalSize: 0
  })

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Load app data
    loadAppData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadAppData = async () => {
    try {
      // Load offline claims count
      const claims = await offlineService.getAllClaims()
      setPendingClaims(claims.filter(c => c.status === 'draft' || c.status === 'failed').length)
      
      // Load storage stats
      const stats = await offlineService.getStorageStats()
      setStorageStats(stats)
      
      // Load user settings
      const settings = await offlineService.getSettings()
      if (settings) {
        setVoiceEnabled(settings.voiceEnabled)
        if (settings.language === 'en' || settings.language === 'hi') {
          setLanguage(settings.language)
        }
      }
    } catch (error) {
      console.error('Failed to load app data:', error)
    }
  }

  const handleNavigation = async (item: NavigationItem) => {
    if (item.id === 'more') {
      setIsMenuOpen(true)
      return
    }

    if (voiceEnabled) {
      const label = language === 'hi' ? item.labelHi : item.label
      await audioService.speak(`${label} खोला जा रहा है`, { language })
    }

    router.push(item.href)
  }

  const handleVoiceToggle = async () => {
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)
    
    // Save setting
    const currentSettings = await offlineService.getSettings()
    await offlineService.saveSettings({
      ...currentSettings,
      voiceEnabled: newVoiceState,
      language
    } as any)

    if (newVoiceState) {
      await audioService.speak('आवाज़ सहायता चालू हो गई', { language: 'hi' })
    }
  }

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'hi' : 'en'
    setLanguage(newLang)
    
    // Save setting
    const currentSettings = await offlineService.getSettings()
    await offlineService.saveSettings({
      ...currentSettings,
      language: newLang,
      voiceEnabled
    } as any)

    if (voiceEnabled) {
      await audioService.speak(
        newLang === 'hi' ? 'भाषा हिंदी में बदल गई' : 'Language changed to English',
        { language: newLang }
      )
    }
  }

  const syncOfflineData = async () => {
    if (isOnline) {
      try {
        await offlineService.syncPendingClaims()
        await loadAppData()
        
        if (voiceEnabled) {
          await audioService.speak('डेटा सिंक हो गया', { language: 'hi' })
        }
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Top Status Bar (Mobile) */}
      <div className="md:hidden bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          {pendingClaims > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingClaims} Pending
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleVoiceToggle}>
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          <Button size="sm" variant="ghost" onClick={handleLanguageToggle}>
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </Button>
          
          {notifications > 0 && (
            <Button size="sm" variant="ghost" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0">
                {notifications}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-5 h-16">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = item.href !== '#' && isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors relative ${
                  active 
                    ? 'text-primary bg-primary/5' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">
                  {language === 'hi' ? item.labelHi : item.label}
                </span>
                
                {item.id === 'my-claims' && pendingClaims > 0 && (
                  <Badge className="absolute top-1 right-2 w-5 h-5 text-xs flex items-center justify-center p-0">
                    {pendingClaims}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Side Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="w-80">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                {language === 'hi' ? 'मेन्यू' : 'Menu'}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'hi' ? 'सभी सुविधाएं देखें' : 'Access all features'}
              </p>
            </div>

            <div className="space-y-1">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigation(item)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">
                      {language === 'hi' ? item.labelHi : item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">
                  {language === 'hi' ? 'ऑफलाइन डेटा' : 'Offline Data'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Claims: {storageStats.claimsCount}</div>
                  <div>Storage: {formatFileSize(storageStats.totalSize)}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={syncOfflineData} disabled={!isOnline}>
                    Sync
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => offlineService.clearCache()}
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">
                  {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {language === 'hi' ? 'आवाज़ सहायता' : 'Voice Assistant'}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleVoiceToggle}>
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {language === 'hi' ? 'भाषा' : 'Language'}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleLanguageToggle}>
                    {language === 'hi' ? 'हिंदी' : 'English'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden md:block fixed left-0 top-0 w-64 h-full bg-white border-r overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-6">FRA Portal</h1>
          
          <nav className="space-y-2">
            {[...PRIMARY_NAV_ITEMS.slice(0, -1), ...SECONDARY_NAV_ITEMS].map((item) => {
              const Icon = item.icon
              const active = item.href !== '#' && isActive(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">
                    {language === 'hi' ? item.labelHi : item.label}
                  </span>
                  {item.id === 'my-claims' && pendingClaims > 0 && (
                    <Badge className="ml-auto">
                      {pendingClaims}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Main Content Offset */}
      <style jsx global>{`
        @media (min-width: 768px) {
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
    </div>
  )
}
