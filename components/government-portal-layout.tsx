'use client'

import { useState, useEffect, ReactNode, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { 
  Menu,
  Home,
  Map,
  FileText,
  FolderCheck,
  HelpCircle,
  Settings,
  Users,
  BarChart3,
  TreePine,
  LogOut,
  User,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Shield,
  Building2,
  Bell,
  Search,
  Building,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { audioService } from '@/lib/audio-service'
import { AuthContext } from '@/components/auth-system'
import { useLanguage } from '@/contexts/language-context'

interface User {
  id: string
  name: string
  role: 'admin' | 'employee' | 'field_officer'
  department: string
  employeeId: string
  designation: string
  district: string
}

interface NavigationItem {
  id: string
  label: string
  labelHi: string
  icon: any
  href: string
  roles: string[]
  badge?: number
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'HOME',
    labelHi: 'डैशबोर्ड',
    icon: Home,
    href: '/',
    roles: [] // Public access
  },
  {
    id: 'map',
    label: 'FRA Atlas',
    labelHi: 'FRA नक्शा',
    icon: Map,
    href: '/map',
    roles: [] // Public access
  },
  {
    id: 'claims',
    label: 'Claims',
    labelHi: 'दावे',
    icon: FileText,
    href: '/claims',
    roles: [] // Public access
  },
  {
    id: 'assets',
    label: 'Assets',
    labelHi: 'संपत्ति',
    icon: Building,
    href: '/assets',
    roles: [] // Public access
  },
  {
    id: 'asset-maps',
    label: 'Asset Maps',
    labelHi: 'संपत्ति मानचित्र',
    icon: Layers,
    href: '/asset-maps',
    roles: [] // Public access
  },
  {
    id: 'gram-sabha',
    label: 'Gram Sabha',
    labelHi: 'ग्राम सभा',
    icon: Building2,
    href: '/gram-sabha',
    roles: [] // Public access
  },
  {
    id: 'new-claim',
    label: 'New Claim',
    labelHi: 'नया दावा',
    icon: FolderCheck,
    href: '/claims/new',
    roles: ['employee', 'field_officer'] // Requires auth for creation
  },
  {
    id: 'my-claims',
    label: 'My Claims',
    labelHi: 'मेरे दावे',
    icon: FolderCheck,
    href: '/my-claims',
    roles: ['employee', 'field_officer'] // Requires auth for personal claims
  },
  {
    id: 'dss',
    label: 'DSS Panel',
    labelHi: 'DSS पैनल',
    icon: BarChart3,
    href: '/dss',
    roles: [] // Public access to view recommendations
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    labelHi: 'एडमिन पैनल',
    icon: Users,
    href: '/admin',
    roles: ['admin'] // Admin only
  },
  {
    id: 'help',
    label: 'Help',
    labelHi: 'सहायता',
    icon: HelpCircle,
    href: '/help',
    roles: [] // Public access
  }
]

export function GovernmentPortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, requireAuth } = useContext(AuthContext)
  const { language, toggleLanguage } = useLanguage()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = async (href: string, label: string) => {
    if (voiceEnabled) {
      await audioService.speak(`Opening ${label}`, { language })
    }
    router.push(href)
    setSidebarOpen(false)
  }

  const toggleVoice = async () => {
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)
    
    if (newVoiceState) {
      await audioService.speak('Voice assistance enabled', { language })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'employee': return 'bg-blue-100 text-blue-800'
      case 'field_officer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'employee': return 'Employee'
      case 'field_officer': return 'Field Officer'
      default: return role
    }
  }

  // Show all navigation items - public items (no roles) are always visible,
  // private items only visible to authenticated users with appropriate roles
  const filteredNavItems = navigationItems.filter(item => {
    // If no roles specified, item is public and always visible
    if (!item.roles || item.roles.length === 0) {
      return true
    }
    // If roles specified, only show to authenticated users with matching roles
    return isAuthenticated && user && item.roles.includes(user.role)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government Portal Header - Always visible */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader className="space-y-4">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TreePine className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Forest Rights Portal</div>
                        <div className="text-xs text-gray-600">Government of India</div>
                      </div>
                    </div>
                  </SheetTitle>

                  {/* User Info */}
                  {isAuthenticated && user ? (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={cn("text-xs", getRoleColor(user.role))}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <span className="text-xs text-gray-600">{user.employeeId}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {user.designation} • {user.district}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Button onClick={requireAuth} variant="outline" size="sm" className="w-full">
                        <Shield className="w-4 h-4 mr-2" />
                        Login as Officer
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        Browse freely, login to make changes
                      </p>
                    </div>
                  )}
                </SheetHeader>

                <Separator className="my-6" />

                {/* Navigation */}
                <nav className="space-y-1">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-auto p-3",
                          isActive && "bg-green-600 text-white"
                        )}
                        onClick={() => handleNavigation(item.href, item.label)}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">
                          {language === 'hi' ? item.labelHi : item.label}
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </nav>

                <Separator className="my-6" />

                {/* Settings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voice Assistant</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoice}
                      className="p-1"
                    >
                      {voiceEnabled ? (
                        <Volume2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLanguage}
                      className="text-xs"
                    >
                      {language === 'hi' ? 'हिंदी' : 'English'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network</span>
                    <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                      {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                )}
              </SheetContent>
            </Sheet>

            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">Forest Rights Portal</div>
                <div className="text-xs text-gray-600">Government of India • वन अधिकार पोर्टल</div>
              </div>
            </div>
          </div>

          {/* Center - Search (desktop only) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search claims, villages, or help..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Network Status */}
            <Badge variant={isOnline ? "default" : "destructive"} className="hidden sm:flex text-xs">
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Voice Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleVoice} className="hidden sm:flex">
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5 text-green-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </Button>

            {/* Language Toggle - Global */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex text-xs px-2"
            >
              {language === 'hi' ? 'हिंदी' : 'English'}
            </Button>

            {/* User Info (desktop) or Login Button */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2 ml-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.employeeId}</div>
                </div>
                <Badge className={cn("text-xs", getRoleColor(user.role))}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={requireAuth} variant="outline" size="sm" className="ml-4">
                <Shield className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="fixed left-0 w-64 h-full bg-white border-r border-gray-200 overflow-y-auto z-30 top-16">
          <nav className="p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-auto p-3",
                    isActive && "bg-green-600 text-white"
                  )}
                  onClick={() => handleNavigation(item.href, item.label)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">
                    {language === 'hi' ? item.labelHi : item.label}
                  </span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen md:ml-64 pt-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <nav className="flex items-center justify-around py-2">
          {filteredNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 h-auto min-w-0 flex-1",
                    isActive && "text-green-600"
                  )}
                  onClick={() => handleNavigation(item.href, item.label)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs truncate max-w-full">
                    {language === 'hi' ? item.labelHi : item.label}
                  </span>
                </Button>
              )
            })}
          </nav>
        </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
