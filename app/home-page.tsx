'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Map, 
  FileText, 
  FolderCheck, 
  HelpCircle, 
  TreePine, 
  Users, 
  BarChart3,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Globe,
  Smartphone,
  Wifi,
  WifiOff,
  ChevronRight,
  Star,
  CheckCircle
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'
import { offlineService } from '@/lib/offline-service'

interface QuickAction {
  id: string
  title: string
  titleHi: string
  description: string
  descriptionHi: string
  icon: any
  href: string
  color: string
  priority: boolean
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'map',
    title: 'Open FRA Atlas',
    titleHi: 'FRA नक्शा खोलें',
    description: 'View forest rights map with satellite data',
    descriptionHi: 'उपग्रह डेटा के साथ वन अधिकार नक्शा देखें',
    icon: Map,
    href: '/map',
    color: 'bg-blue-500',
    priority: true
  },
  {
    id: 'file-claim',
    title: 'File a Claim',
    titleHi: 'दावा दर्ज करें',
    description: 'I need help filing my forest rights claim',
    descriptionHi: 'मुझे अपना वन अधिकार दावा दर्ज करने में सहायता चाहिए',
    icon: FileText,
    href: '/claims/new',
    color: 'bg-green-500',
    priority: true
  },
  {
    id: 'my-claims',
    title: 'My Claims',
    titleHi: 'मेरे दावे',
    description: 'Check status of submitted claims',
    descriptionHi: 'जमा किए गए दावों की स्थिति जांचें',
    icon: FolderCheck,
    href: '/my-claims',
    color: 'bg-purple-500',
    priority: true
  },
  {
    id: 'help',
    title: 'Help & Training',
    titleHi: 'सहायता और प्रशिक्षण',
    description: 'Audio guides and tutorials',
    descriptionHi: 'ऑडियो गाइड और ट्यूटोरियल',
    icon: HelpCircle,
    href: '/help',
    color: 'bg-orange-500',
    priority: false
  }
]

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pendingClaims, setPendingClaims] = useState(0)
  const [userLocation, setUserLocation] = useState<string>('')
  const [stats, setStats] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    villagesCovered: 0
  })

  useEffect(() => {
    // Network status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Load user data
    loadUserData()

    // Get location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, reverse geocode to get village/district name
          setUserLocation('Dindori, Madhya Pradesh')
        },
        () => {
          setUserLocation('Location not available')
        }
      )
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadUserData = async () => {
    try {
      // Load pending claims
      const claims = await offlineService.getAllClaims()
      setPendingClaims(claims.filter(c => c.status === 'draft' || c.status === 'failed').length)

      // Load user settings
      const settings = await offlineService.getSettings()
      if (settings) {
        setVoiceEnabled(settings.voiceEnabled)
        if (settings.language === 'en' || settings.language === 'hi') {
          setLanguage(settings.language)
        }
      }

      // Mock stats - in real app, fetch from API
      setStats({
        totalClaims: 45672,
        approvedClaims: 38934,
        villagesCovered: 1247
      })
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const playWelcomeMessage = async () => {
    if (isPlaying) return

    setIsPlaying(true)
    
    const welcomeText = language === 'hi' 
      ? 'वन अधिकार पोर्टल में आपका स्वागत है। यह आपके वन अधिकार दावों के लिए डिजिटल सहायक है। आप नक्शा देख सकते हैं, नया दावा दर्ज कर सकते हैं, या अपने दावों की स्थिति जांच सकते हैं।'
      : 'Welcome to the Forest Rights Portal. This is your digital assistant for forest rights claims. You can view the map, file a new claim, or check your existing claims status.'

    try {
      await audioService.speak(welcomeText, { language })
    } catch (error) {
      console.error('Failed to play welcome message:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (voiceEnabled) {
      const message = language === 'hi' ? action.titleHi : action.title
      await audioService.speak(`${message} खोला जा रहा है`, { language: 'hi' })
    }
    
    router.push(action.href)
  }

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'hi' : 'en'
    setLanguage(newLang)
    
    // Save setting
    const currentSettings = await offlineService.getSettings()
    await offlineService.saveSettings({
      ...currentSettings,
      language: newLang,
      voiceEnabled
    } as any)
  }

  const toggleVoice = async () => {
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
      await audioService.speak('आवाज़ सहायता चालू हो गई', { language: 'hi' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-10"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'hi' ? 'वन अधिकार पोर्टल' : 'Forest Rights Portal'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {language === 'hi' 
                    ? 'AI और उपग्रह डेटा के साथ स्मार्ट दावा प्रबंधन' 
                    : 'Smart claims management with AI and satellite data'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={toggleLanguage}>
                  <Globe className="w-4 h-4 mr-2" />
                  {language.toUpperCase()}
                </Button>
                <Button size="sm" variant="outline" onClick={toggleVoice}>
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Map className="w-4 h-4" />
                {userLocation}
                <Badge variant={isOnline ? "default" : "destructive"} className="ml-2">
                  {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button 
                onClick={playWelcomeMessage} 
                disabled={isPlaying}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {language === 'hi' ? 'स्वागत संदेश सुनें' : 'Listen to Welcome'}
              </Button>
              
              {pendingClaims > 0 && (
                <Alert className="flex-1">
                  <AlertDescription className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {language === 'hi' 
                      ? `${pendingClaims} दावे ऑफलाइन सेव हैं` 
                      : `${pendingClaims} claims saved offline`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Card 
                  key={action.id} 
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {language === 'hi' ? action.titleHi : action.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {language === 'hi' ? action.descriptionHi : action.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    {action.priority && (
                      <Badge variant="secondary" className="mt-3">
                        <Star className="w-3 h-3 mr-1" />
                        {language === 'hi' ? 'प्राथमिकता' : 'Priority'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {language === 'hi' ? 'राष्ट्रीय आंकड़े' : 'National Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalClaims.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'कुल दावे' : 'Total Claims'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.approvedClaims.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'स्वीकृत' : 'Approved'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.villagesCovered.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'गांव' : 'Villages'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'hi' ? 'प्रमुख विशेषताएं' : 'Key Features'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Smartphone,
                  title: language === 'hi' ? 'मोबाइल फर्स्ट' : 'Mobile First',
                  description: language === 'hi' ? 'स्मार्टफोन के लिए अनुकूलित' : 'Optimized for smartphones'
                },
                {
                  icon: WifiOff,
                  title: language === 'hi' ? 'ऑफलाइन सपोर्ट' : 'Offline Support',
                  description: language === 'hi' ? 'इंटरनेट के बिना भी काम करता है' : 'Works without internet'
                },
                {
                  icon: Volume2,
                  title: language === 'hi' ? 'आवाज़ सहायता' : 'Voice Assistant',
                  description: language === 'hi' ? 'बोलकर नेविगेट करें' : 'Navigate by voice'
                },
                {
                  icon: TreePine,
                  title: language === 'hi' ? 'AI सिफारिशें' : 'AI Recommendations',
                  description: language === 'hi' ? 'स्मार्ट योजना सुझाव' : 'Smart scheme suggestions'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* App Installation Prompt */}
        <Card className="border-dashed border-2 border-green-300 bg-green-50">
          <CardContent className="p-6 text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-lg mb-2">
              {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'hi' 
                ? 'होम स्क्रीन पर जोड़ें और ऑफलाइन सुविधाओं का लाभ उठाएं'
                : 'Add to home screen for offline features and quick access'
              }
            </p>
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <CheckCircle className="w-4 h-4" />
              {language === 'hi' ? 'होम स्क्रीन पर जोड़ें' : 'Add to Home Screen'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
