'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/contexts/language-context'
import {
  Search,
  HelpCircle,
  BookOpen,
  Video,
  FileText,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Award,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'

interface HelpArticle {
  id: string
  title: string
  titleHi: string
  category: 'getting-started' | 'claim-process' | 'documents' | 'troubleshooting' | 'policies'
  type: 'article' | 'video' | 'tutorial' | 'faq'
  content: string
  contentHi: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  views: number
  rating: number
  lastUpdated: string
  tags: string[]
  hasAudio: boolean
  downloadable: boolean
}

interface TrainingModule {
  id: string
  title: string
  titleHi: string
  description: string
  descriptionHi: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  completed: boolean
  lessons: number
  certificate: boolean
  category: string
}

const mockArticles: HelpArticle[] = [
  {
    id: 'help-001',
    title: 'Getting Started with FRA Portal',
    titleHi: 'FRA पोर्टल के साथ शुरुआत करना',
    category: 'getting-started',
    type: 'tutorial',
    content: 'Learn how to navigate the Forest Rights Act portal and access key features.',
    contentHi: 'वन अधिकार अधिनियम पोर्टल को नेविगेट करना और मुख्य सुविधाओं तक पहुंचना सीखें।',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    views: 1234,
    rating: 4.8,
    lastUpdated: '2024-03-15',
    tags: ['basics', 'navigation', 'overview'],
    hasAudio: true,
    downloadable: true
  },
  {
    id: 'help-002',
    title: 'Filing Your First Forest Rights Claim',
    titleHi: 'अपना पहला वन अधिकार दावा दर्ज करना',
    category: 'claim-process',
    type: 'video',
    content: 'Step-by-step guide to filing Individual Forest Rights (IFR) claims.',
    contentHi: 'व्यक्तिगत वन अधिकार (IFR) दावे दर्ज करने के लिए चरण-दर-चरण गाइड।',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    views: 2156,
    rating: 4.9,
    lastUpdated: '2024-03-12',
    tags: ['ifr', 'filing', 'claims', 'step-by-step'],
    hasAudio: true,
    downloadable: false
  },
  {
    id: 'help-003',
    title: 'Required Documents Checklist',
    titleHi: 'आवश्यक दस्तावेज़ चेकलिस्ट',
    category: 'documents',
    type: 'article',
    content: 'Complete list of documents needed for different types of forest rights claims.',
    contentHi: 'विभिन्न प्रकार के वन अधिकार दावों के लिए आवश्यक दस्तावेजों की पूरी सूची।',
    difficulty: 'beginner',
    estimatedTime: '8 min',
    views: 3421,
    rating: 4.7,
    lastUpdated: '2024-03-10',
    tags: ['documents', 'checklist', 'requirements'],
    hasAudio: true,
    downloadable: true
  },
  {
    id: 'help-004',
    title: 'Understanding Community Forest Rights',
    titleHi: 'सामुदायिक वन अधिकारों को समझना',
    category: 'claim-process',
    type: 'tutorial',
    content: 'Comprehensive guide to Community Forest Rights (CFR) and Community Rights (CR).',
    contentHi: 'सामुदायिक वन अधिकार (CFR) और सामुदायिक अधिकार (CR) के लिए व्यापक गाइड।',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    views: 987,
    rating: 4.6,
    lastUpdated: '2024-03-08',
    tags: ['cfr', 'community', 'rights', 'advanced'],
    hasAudio: true,
    downloadable: true
  }
]

const mockTrainingModules: TrainingModule[] = [
  {
    id: 'train-001',
    title: 'FRA Portal Basics',
    titleHi: 'FRA पोर्टल बेसिक्स',
    description: 'Complete introduction to using the Forest Rights Act portal',
    descriptionHi: 'वन अधिकार अधिनियम पोर्टल का उपयोग करने के लिए पूरा परिचय',
    duration: '45 min',
    difficulty: 'beginner',
    progress: 75,
    completed: false,
    lessons: 6,
    certificate: true,
    category: 'basics'
  },
  {
    id: 'train-002',
    title: 'Advanced Claim Management',
    titleHi: 'उन्नत दावा प्रबंधन',
    description: 'Master complex claim scenarios and management techniques',
    descriptionHi: 'जटिल दावा परिदृश्यों और प्रबंधन तकनीकों में महारत हासिल करें',
    duration: '90 min',
    difficulty: 'advanced',
    progress: 30,
    completed: false,
    lessons: 12,
    certificate: true,
    category: 'advanced'
  },
  {
    id: 'train-003',
    title: 'Mobile App Training',
    titleHi: 'मोबाइल ऐप प्रशिक्षण',
    description: 'Learn to use the mobile application for field work',
    descriptionHi: 'फील्डवर्क के लिए मोबाइल एप्लिकेशन का उपयोग करना सीखें',
    duration: '30 min',
    difficulty: 'beginner',
    progress: 100,
    completed: true,
    lessons: 4,
    certificate: true,
    category: 'mobile'
  }
]

const faqs = [
  {
    id: 'faq-001',
    question: 'What documents are required for IFR claims?',
    questionHi: 'IFR दावों के लिए कौन से दस्तावेज़ आवश्यक हैं?',
    answer: 'For Individual Forest Rights claims, you need: Identity proof, Address proof, Occupation evidence, Land possession proof, and Community verification.',
    answerHi: 'व्यक्तिगत वन अधिकार दावों के लिए, आपको चाहिए: पहचान प्रमाण, पता प्रमाण, व्यवसाय प्रमाण, भूमि कब्जा प्रमाण, और सामुदायिक सत्यापन।'
  },
  {
    id: 'faq-002',
    question: 'How long does the claim approval process take?',
    questionHi: 'दावा अनुमोदन प्रक्रिया में कितना समय लगता है?',
    answer: 'The typical processing time is 6-9 months, but with our digital platform, it can be reduced to 3-4 months.',
    answerHi: 'सामान्य प्रसंस्करण समय 6-9 महीने है, लेकिन हमारे डिजिटल प्लेटफॉर्म के साथ, इसे 3-4 महीने तक कम किया जा सकता है।'
  },
  {
    id: 'faq-003',
    question: 'Can I track my claim status online?',
    questionHi: 'क्या मैं अपने दावे की स्थिति ऑनलाइन ट्रैक कर सकता हूँ?',
    answer: 'Yes, you can track your claim status in real-time using your claim ID in the "My Claims" section.',
    answerHi: 'हाँ, आप "मेरे दावे" अनुभाग में अपनी दावा ID का उपयोग करके वास्तविक समय में अपने दावे की स्थिति को ट्रैक कर सकते हैं।'
  }
]

export default function EnhancedHelpPage() {
  const { language } = useLanguage()
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([])
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadHelpData()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, searchQuery, selectedCategory])

  const loadHelpData = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setArticles(mockArticles)
      setTrainingModules(mockTrainingModules)
    } catch (error) {
      console.error('Failed to load help data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = [...articles]

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>
      default:
        return <Badge variant="outline">{difficulty}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-600" />
      case 'tutorial': return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'article': return <FileText className="w-4 h-4 text-gray-600" />
      case 'faq': return <HelpCircle className="w-4 h-4 text-purple-600" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const playArticleAudio = async (article: HelpArticle) => {
    if (!article.hasAudio) return

    setIsPlaying(true)
    try {
      const content = language === 'hi' ? article.contentHi : article.content
      await audioService.speak(content, { language })
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
    setIsPlaying(false)
  }

  const stopAudio = () => {
    // Audio will stop automatically when component updates
    setIsPlaying(false)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            Help & Training Center
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'hi' 
              ? 'सहायता, प्रशिक्षण और संसाधन केंद्र' 
              : 'Comprehensive help, training, and resources'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{articles.length}</p>
            <p className="text-sm text-gray-600">Help Articles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{trainingModules.length}</p>
            <p className="text-sm text-gray-600">Training Modules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-gray-600">Support Available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">98%</p>
            <p className="text-sm text-gray-600">User Satisfaction</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Main Content */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Help Articles</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={language === 'hi' ? 'सहायता लेख खोजें...' : 'Search help articles...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {['all', 'getting-started', 'claim-process', 'documents', 'troubleshooting'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeIcon(article.type)}
                    <h3 className="font-semibold text-sm">
                      {language === 'hi' ? article.titleHi : article.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {language === 'hi' ? article.contentHi : article.content}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    {getDifficultyBadge(article.difficulty)}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {article.estimatedTime}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {article.rating}
                    </div>
                    <span>{article.views} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BookOpen className="w-4 h-4 mr-1" />
                          Read
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getTypeIcon(article.type)}
                            {language === 'hi' ? article.titleHi : article.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            {getDifficultyBadge(article.difficulty)}
                            <Badge variant="outline">{article.estimatedTime}</Badge>
                          </div>
                          
                          <p className="text-gray-700">
                            {language === 'hi' ? article.contentHi : article.content}
                          </p>
                          
                          {article.hasAudio && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => playArticleAudio(article)}
                                disabled={isPlaying}
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isPlaying ? 'Playing...' : 'Listen'}
                              </Button>
                              {isPlaying && (
                                <Button variant="outline" size="sm" onClick={stopAudio}>
                                  <VolumeX className="w-4 h-4" />
                                  Stop
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {article.hasAudio && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playArticleAudio(article)}
                        disabled={isPlaying}
                      >
                        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    )}

                    {article.downloadable && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      {language === 'hi' ? module.titleHi : module.title}
                    </h3>
                    {module.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'hi' ? module.descriptionHi : module.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{module.duration}</span>
                    <span>{module.lessons} lessons</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    {getDifficultyBadge(module.difficulty)}
                    {module.certificate && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Award className="w-3 h-3 mr-1" />
                        Certificate
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full">
                    {module.completed ? 'Review' : module.progress > 0 ? 'Continue' : 'Start Training'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {language === 'hi' ? faq.questionHi : faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {language === 'hi' ? faq.answerHi : faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Helpline</p>
                    <p className="text-sm text-gray-600">1800-XXX-XXXX (Toll Free)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@fra-portal.gov.in</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="font-medium">Office Address</p>
                    <p className="text-sm text-gray-600">Ministry of Tribal Affairs<br />New Delhi, India</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-gray-600">24/7 Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Request Callback
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Knowledge Base
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
