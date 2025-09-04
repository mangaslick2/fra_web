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
  Satellite
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'
import { offlineService } from '@/lib/offline-service'

export default function WelcomePageMobile() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [pendingClaims, setPendingClaims] = useState(0)
  const [isFirstTime, setIsFirstTime] = useState(true)

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
        setIsFirstTime(false)
        setVoiceEnabled(settings.voiceEnabled)
        if (settings.language === 'en' || settings.language === 'hi') {
          setLanguage(settings.language)
        }
      }
    } catch (error) {
      console.error('Failed to load app state:', error)
    }
  }

  const playWelcomeMessage = async () => {
    const message = language === 'hi' 
      ? 'वन अधिकार पोर्टल में आपका स्वागत है। यहाँ आप अपने वन अधिकार के दावे दर्ज कर सकते हैं और उनकी स्थिति देख सकते हैं।'
      : 'Welcome to Forest Rights Portal. Here you can file your forest rights claims and track their status.'
    
    await audioService.speak(message, { language })
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

  const navigateTo = async (path: string, label: string) => {
    if (voiceEnabled) {
      const message = language === 'hi' ? `${label} खोला जा रहा है` : `Opening ${label}`
      await audioService.speak(message, { language })
    }
    router.push(path)
  }

  const quickActions = [
    {
      id: 'map',
      title: language === 'hi' ? 'FRA नक्शा देखें' : 'Open FRA Atlas',
      titleHi: 'FRA नक्शा देखें',
      description: language === 'hi' ? 'गांव का नक्शा और दावों की स्थिति देखें' : 'View village map and claim status',
      icon: Map,
      color: 'bg-blue-500',
      href: '/map',
      primary: true
    },
    {
      id: 'file-claim',
      title: language === 'hi' ? 'नया दावा दर्ज करें' : 'File New Claim',
      titleHi: 'नया दावा दर्ज करें',
      description: language === 'hi' ? 'वन अधिकार के लिए नया दावा दर्ज करें' : 'Submit a new forest rights claim',
      icon: FileText,
      color: 'bg-green-500',
      href: '/claims/new',
      primary: true
    },
    {
      id: 'my-claims',
      title: language === 'hi' ? 'मेरे दावे देखें' : 'View My Claims',
      titleHi: 'मेरे दावे देखें',
      description: language === 'hi' ? 'अपने दावों की स्थिति और इतिहास देखें' : 'Check status and history of your claims',
      icon: FolderCheck,
      color: 'bg-purple-500',
      href: '/my-claims',
      primary: true,
      badge: pendingClaims > 0 ? pendingClaims : undefined
    },
    {
      id: 'help',
      title: language === 'hi' ? 'सहायता प्राप्त करें' : 'Get Help',
      titleHi: 'सहायता प्राप्त करें',
      description: language === 'hi' ? 'गाइड और ट्यूटोरियल देखें' : 'View guides and tutorials',
      icon: HelpCircle,
      color: 'bg-orange-500',
      href: '/help',
      primary: true
    }
  ]

  const features = [
    {
      icon: Smartphone,
      title: language === 'hi' ? 'मोबाइल फर्स्ट' : 'Mobile First',
      description: language === 'hi' ? 'मोबाइल डिवाइस के लिए अनुकूलित' : 'Optimized for mobile devices'
    },
    {
      icon: WifiOff,
      title: language === 'hi' ? 'ऑफलाइन सपोर्ट' : 'Offline Support',
      description: language === 'hi' ? 'इंटरनेट के बिना भी काम करता है' : 'Works without internet connection'
    },
    {
      icon: Volume2,
      title: language === 'hi' ? 'आवाज़ गाइड' : 'Voice Guide',
      description: language === 'hi' ? 'आवाज़ में निर्देश और सहायता' : 'Voice instructions and assistance'
    },
    {
      icon: Satellite,
      title: language === 'hi' ? 'AI सैटेलाइट डेटा' : 'AI Satellite Data',
      description: language === 'hi' ? 'कृत्रिम बुद्धिमत्ता और उपग्रह चित्र' : 'Artificial intelligence and satellite imagery'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleVoiceToggle}>
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleLanguageToggle}>
            {language === 'hi' ? 'हिंदी' : 'English'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <TreePine className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'hi' 
              ? 'वन अधिकार पोर्टल में आपका स्वागत है' 
              : 'Welcome to Forest Rights Portal'
            }
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'hi'
              ? 'वन अधिकार अधिनियम के तहत अपने दावे दर्ज करें, ट्रैक करें और प्रबंधित करें। AI और सैटेलाइट डेटा के साथ स्मार्ट सुविधाएं।'
              : 'File, track and manage your claims under the Forest Rights Act. Smart features with AI and satellite data integration.'
            }
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={playWelcomeMessage} variant="outline" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {language === 'hi' ? 'स्वागत संदेश सुनें' : 'Listen to Welcome'}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card 
                  key={action.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => navigateTo(action.href, action.title)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white relative`}>
                        <Icon className="w-6 h-6" />
                        {action.badge && (
                          <Badge className="absolute -top-2 -right-2 w-6 h-6 text-xs flex items-center justify-center p-0">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                        <div className="flex items-center text-primary text-sm font-medium">
                          {language === 'hi' ? 'खोलें' : 'Open'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                    <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'कुल दावे' : 'Total Claims'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-gray-600">
                {language === 'hi' ? 'राज्य में कुल' : 'Across the state'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'स्वीकृत दावे' : 'Approved Claims'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">892</div>
              <p className="text-xs text-gray-600">
                {language === 'hi' ? '71.5% सफलता दर' : '71.5% success rate'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'लाभार्थी' : 'Beneficiaries'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12,456</div>
              <p className="text-xs text-gray-600">
                {language === 'hi' ? 'परिवार लाभान्वित' : 'Families benefited'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* First Time User Alert */}
        {isFirstTime && (
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              {language === 'hi'
                ? 'पहली बार उपयोग कर रहे हैं? सहायता सेक्शन में जाकर गाइड देखें या आवाज़ सहायता चालू करें।'
                : 'First time user? Visit the Help section for guides or enable voice assistance for better navigation.'
              }
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
