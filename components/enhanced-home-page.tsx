'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { useLanguage } from '@/contexts/language-context'
import {
  Map,
  FileText,
  FolderCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  TreePine,
  Droplets,
  Users,
  BarChart3,
  Play,
  ChevronRight,
  Smartphone,
  Globe,
  Satellite,
  Bell,
  TrendingUp,
  Calendar,
  ExternalLink,
  Award,
  Target,
  Clock,
  MapPin,
  Building2,
  Layers
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'
import { offlineService } from '@/lib/offline-service'

interface NewsItem {
  id: string
  title: string
  titleHi: string
  summary: string
  summaryHi: string
  date: string
  category: 'policy' | 'announcement' | 'success' | 'guidelines'
  image?: string
  link: string
  isExternal: boolean
}

const latestNews: NewsItem[] = [
  {
    id: '1',
    title: 'Forest Rights Act Amendment 2024: Key Updates',
    titleHi: 'वन अधिकार अधिनियम संशोधन 2024: मुख्य अपडेट',
    summary: 'New provisions for faster claim processing and digital integration announced',
    summaryHi: 'तेज़ दावा प्रसंस्करण और डिजिटल एकीकरण के लिए नए प्रावधान घोषित',
    date: '2024-12-15',
    category: 'policy',
    image: '/satellite-view-of-pond.jpg',
    link: 'https://tribal.nic.in/fra-updates',
    isExternal: true
  },
  {
    id: '2', 
    title: 'AI-Powered Satellite Mapping Now Available',
    titleHi: 'AI-संचालित उपग्रह मैपिंग अब उपलब्ध',
    summary: 'Advanced satellite imagery integration for accurate land boundary detection',
    summaryHi: 'सटीक भूमि सीमा का पता लगाने के लिए उन्नत उपग्रह इमेजरी एकीकरण',
    date: '2024-12-10',
    category: 'announcement',
    image: '/satellite-view-of-agricultural-field.jpg',
    link: '/dss',
    isExternal: false
  },
  {
    id: '3',
    title: '50,000+ Claims Approved Through Digital Platform',
    titleHi: 'डिजिटल प्लेटफॉर्म के माध्यम से 50,000+ दावे स्वीकृत',
    summary: 'Digital transformation leads to 300% faster processing times',
    summaryHi: 'डिजिटल परिवर्तन से प्रसंस्करण समय में 300% तेज़ी',
    date: '2024-12-05',
    category: 'success',
    image: '/satellite-view-of-homestead.jpg',
    link: '/admin/reports',
    isExternal: false
  },
  {
    id: '4',
    title: 'New Mobile App Guidelines for Field Officers',
    titleHi: 'फील्ड अधिकारियों के लिए नई मोबाइल ऐप गाइडलाइन',
    summary: 'Comprehensive training materials and best practices now available',
    summaryHi: 'व्यापक प्रशिक्षण सामग्री और सर्वोत्तम प्रथाएं अब उपलब्ध',
    date: '2024-11-28',
    category: 'guidelines',
    image: '/placeholder.jpg',
    link: '/help',
    isExternal: false
  }
]

const quickStats = [
  {
    id: 'total-claims',
    title: 'Total Claims',
    titleHi: 'कुल दावे',
    value: '2,45,678',
    trend: '+12%',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'approved',
    title: 'Approved',
    titleHi: 'स्वीकृत',
    value: '1,85,432',
    trend: '+18%',
    icon: Award,
    color: 'green'
  },
  {
    id: 'processing',
    title: 'Under Review',
    titleHi: 'समीक्षा में',
    value: '45,891',
    trend: '-8%',
    icon: Clock,
    color: 'yellow'
  },
  {
    id: 'villages',
    title: 'Villages Covered',
    titleHi: 'कवर किए गए गाँव',
    value: '12,456',
    trend: '+25%',
    icon: MapPin,
    color: 'purple'
  }
]

const quickActions = [
  {
    id: 'map',
    title: 'Explore FRA Atlas',
    titleHi: 'FRA एटलस एक्सप्लोर करें',
    description: 'Interactive map with satellite data',
    descriptionHi: 'उपग्रह डेटा के साथ इंटरैक्टिव मानचित्र',
    href: '/map',
    icon: Map,
    color: 'bg-blue-500'
  },
  {
    id: 'new-claim',
    title: 'File New Claim',
    titleHi: 'नया दावा दर्ज करें',
    description: 'Start your forest rights application',
    descriptionHi: 'अपना वन अधिकार आवेदन शुरू करें',
    href: '/claims/new',
    icon: FolderCheck,
    color: 'bg-green-500'
  },
  {
    id: 'track-claims',
    title: 'Track Claims',
    titleHi: 'दावों को ट्रैक करें',
    description: 'Monitor application status',
    descriptionHi: 'आवेदन स्थिति की निगरानी करें',
    href: '/claims',
    color: 'bg-orange-500',
    icon: BarChart3
  },
  {
    id: 'dss',
    title: 'AI Recommendations',
    titleHi: 'AI सिफारिशें',
    description: 'Smart insights and suggestions',
    descriptionHi: 'स्मार्ट अंतर्दृष्टि और सुझाव',
    href: '/dss',
    icon: Satellite,
    color: 'bg-purple-500'
  }
]

export default function EnhancedHomePage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [isOnline, setIsOnline] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [pendingClaims, setPendingClaims] = useState(0)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Load app data
    loadAppState()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadAppState = async () => {
    try {
      // Check if user has pending claims
      const claims = await offlineService.getAllClaims()
      setPendingClaims(claims.filter(c => c.status === 'draft' || c.status === 'failed').length)
      
      // Check if user has used the app before
      const settings = await offlineService.getSettings()
      if (settings) {
        setVoiceEnabled(settings.voiceEnabled)
      }
    } catch (error) {
      console.error('Failed to load app state:', error)
    }
  }

  const handleVoiceToggle = async () => {
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)
    
    // Save setting
    const currentSettings = await offlineService.getSettings()
    await offlineService.saveSettings({
      ...currentSettings,
      language,
      voiceEnabled: newVoiceState
    } as any)

    if (newVoiceState) {
      await audioService.speak(
        language === 'hi' ? 'आवाज़ सहायता सक्षम' : 'Voice assistance enabled', 
        { language }
      )
    }
  }

  const handleLanguageToggle = async () => {
    // Language is now handled globally, so this function can be removed or simplified
    // Just save voice settings
    const currentSettings = await offlineService.getSettings()
    await offlineService.saveSettings({
      ...currentSettings,
      voiceEnabled
    } as any)
  }

  const handleNavigation = async (href: string, title: string) => {
    if (voiceEnabled) {
      await audioService.speak(
        language === 'hi' ? `${title} खोला जा रहा है` : `Opening ${title}`, 
        { language }
      )
    }
    router.push(href)
  }

  const handleNewsClick = (news: NewsItem) => {
    if (news.isExternal) {
      window.open(news.link, '_blank')
    } else {
      router.push(news.link)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'policy': return 'bg-blue-100 text-blue-800'
      case 'announcement': return 'bg-green-100 text-green-800'
      case 'success': return 'bg-purple-100 text-purple-800'
      case 'guidelines': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100'
      case 'green': return 'text-green-600 bg-green-100'
      case 'yellow': return 'text-yellow-600 bg-yellow-100'
      case 'purple': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'hi' ? 'वन अधिकार पोर्टल' : 'Forest Rights Portal'}
            </h1>
            <p className="text-sm text-gray-600">
              {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          Network Status
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? (language === 'hi' ? 'ऑनलाइन' : 'Online') : (language === 'hi' ? 'ऑफलाइन' : 'Offline')}
          </Badge>

          Voice Toggle
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceToggle}
            className={voiceEnabled ? 'bg-green-100 border-green-300' : ''}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div> */}
      </div>

      {/* Alert for Pending Claims */}
      {pendingClaims > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {language === 'hi' 
                  ? `आपके पास ${pendingClaims} अधूरे दावे हैं` 
                  : `You have ${pendingClaims} pending claims`}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/my-claims')}
              >
                {language === 'hi' ? 'देखें' : 'View'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Latest FRA News Carousel */}
      <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            {language === 'hi' ? 'नवीनतम FRA समाचार' : 'Latest FRA News'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full">
            <CarouselContent>
              {latestNews.map((news) => (
                <CarouselItem key={news.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <div 
                      className="p-4 h-full flex flex-col"
                      onClick={() => handleNewsClick(news)}
                    >
                      {news.image && (
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={news.image} 
                            alt={language === 'hi' ? news.titleHi : news.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(news.category)}>
                          {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                        </Badge>
                        {news.isExternal && <ExternalLink className="w-3 h-3 text-gray-400" />}
                      </div>

                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {language === 'hi' ? news.titleHi : news.title}
                      </h3>
                      
                      <p className="text-xs text-gray-600 mb-3 flex-1 line-clamp-3">
                        {language === 'hi' ? news.summaryHi : news.summary}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(news.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatColor(stat.color)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1">
                      {language === 'hi' ? stat.titleHi : stat.title}
                    </p>
                    <p className="font-bold text-lg">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card 
              key={action.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] shadow-lg border-0 bg-white/80 backdrop-blur-sm"
              onClick={() => handleNavigation(action.href, action.title)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${action.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'hi' ? action.titleHi : action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'hi' ? action.descriptionHi : action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>
          {language === 'hi' 
            ? 'वन अधिकार अधिनियम 2006 • भारत सरकार' 
            : 'Forest Rights Act 2006 • Government of India'}
        </p>
      </div>
    </div>
  )
}
