'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  TrendingUp,
  Users,
  Droplets,
  Sprout,
  TreePine,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Star,
  ArrowRight,
  Download,
  Filter,
  Volume2
} from 'lucide-react'
import { audioService } from '@/lib/audio-service'

interface AdvancedScheme {
  id: string
  name: string
  nameHi: string
  category: 'agriculture' | 'forestry' | 'water' | 'livelihood' | 'infrastructure'
  priority: number
  confidence: number
  potentialBeneficiaries: number
  estimatedBenefit: string
  estimatedBenefitHi: string
  eligibilityCriteria: string[]
  eligibilityCriteriaHi: string[]
  requiredDocuments: string[]
  timeline: string
  timelineHi: string
  reason: string
  reasonHi: string
  actionSteps: string[]
  actionStepsHi: string[]
  fundingSource: string
  contactInfo: {
    department: string
    phone: string
    email: string
  }
}

interface VillageAnalytics {
  villageName: string
  villageNameHi: string
  district: string
  state: string
  totalHouseholds: number
  forestCoverPercent: number
  waterBodyCount: number
  agriculturalLandHectares: number
  fraClaims: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  schemes: {
    active: number
    completed: number
    totalBeneficiaries: number
  }
  priorities: string[]
  risksAndChallenges: string[]
}

interface DSSIndicator {
  id: string
  name: string
  nameHi: string
  value: number
  trend: 'up' | 'down' | 'stable'
  category: string
  description: string
  descriptionHi: string
  threshold: {
    good: number
    warning: number
    critical: number
  }
}

export function AdvancedDSSRecommendations() {
  const [selectedVillage, setSelectedVillage] = useState<string>('sample-village')
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<AdvancedScheme[]>([])
  const [villageAnalytics, setVillageAnalytics] = useState<VillageAnalytics | null>(null)
  const [indicators, setIndicators] = useState<DSSIndicator[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadDSSData()
  }, [selectedVillage])

  const loadDSSData = async () => {
    setLoading(true)
    
    // Simulate API call - in real implementation, this would fetch from your DSS backend
    setTimeout(() => {
      setVillageAnalytics({
        villageName: 'Kharkheda',
        villageNameHi: 'खरखेड़ा',
        district: 'Dindori',
        state: 'Madhya Pradesh',
        totalHouseholds: 245,
        forestCoverPercent: 68.5,
        waterBodyCount: 3,
        agriculturalLandHectares: 142.3,
        fraClaims: {
          total: 67,
          approved: 45,
          pending: 18,
          rejected: 4
        },
        schemes: {
          active: 8,
          completed: 12,
          totalBeneficiaries: 180
        },
        priorities: ['Water Conservation', 'Forest Protection', 'Livelihood Generation'],
        risksAndChallenges: ['Soil Erosion', 'Water Scarcity', 'Human-Wildlife Conflict']
      })

      setIndicators([
        {
          id: 'forest-cover',
          name: 'Forest Cover Index',
          nameHi: 'वन आवरण सूचकांक',
          value: 68.5,
          trend: 'down',
          category: 'environment',
          description: 'Percentage of forest cover in the village',
          descriptionHi: 'गांव में वन आवरण का प्रतिशत',
          threshold: { good: 70, warning: 50, critical: 30 }
        },
        {
          id: 'water-index',
          name: 'Water Security Index',
          nameHi: 'जल सुरक्षा सूचकांक',
          value: 45.2,
          trend: 'up',
          category: 'water',
          description: 'Water availability and quality assessment',
          descriptionHi: 'जल उपलब्धता और गुणवत्ता का आकलन',
          threshold: { good: 70, warning: 50, critical: 30 }
        },
        {
          id: 'livelihood-score',
          name: 'Livelihood Diversification',
          nameHi: 'आजीविका विविधीकरण',
          value: 62.8,
          trend: 'stable',
          category: 'social',
          description: 'Income source diversity and stability',
          descriptionHi: 'आय स्रोत विविधता और स्थिरता',
          threshold: { good: 70, warning: 50, critical: 30 }
        }
      ])

      setRecommendations([
        {
          id: 'watershed-development',
          name: 'Watershed Development Program',
          nameHi: 'वाटरशेड विकास कार्यक्रम',
          category: 'water',
          priority: 95,
          confidence: 88,
          potentialBeneficiaries: 180,
          estimatedBenefit: '₹15-20 lakh project cost, benefiting 180 households',
          estimatedBenefitHi: '₹15-20 लाख परियोजना लागत, 180 घरों को लाभ',
          eligibilityCriteria: [
            'Village with water scarcity issues',
            'Community participation commitment',
            'Availability of watershed area'
          ],
          eligibilityCriteriaHi: [
            'जल संकट वाला गांव',
            'सामुदायिक भागीदारी की प्रतिबद्धता',
            'वाटरशेड क्षेत्र की उपलब्धता'
          ],
          requiredDocuments: ['Village resolution', 'Land records', 'Technical survey'],
          timeline: '12-18 months',
          timelineHi: '12-18 महीने',
          reason: 'Water Security Index below threshold (45.2%) and declining groundwater levels',
          reasonHi: 'जल सुरक्षा सूचकांक सीमा से नीचे (45.2%) और भूजल स्तर में गिरावट',
          actionSteps: [
            'Conduct village meeting for consent',
            'Submit proposal to District Collector',
            'Get technical approval from DRDA',
            'Form Village Watershed Committee'
          ],
          actionStepsHi: [
            'सहमति के लिए ग्राम सभा बैठक करें',
            'जिला कलेक्टर को प्रस्ताव जमा करें',
            'DRDA से तकनीकी अनुमोदन लें',
            'ग्राम वाटरशेड समिति बनाएं'
          ],
          fundingSource: 'MGNREGA + State Watershed Mission',
          contactInfo: {
            department: 'District Rural Development Agency',
            phone: '+91-XXXX-XXXXXX',
            email: 'drda.dindori@mp.gov.in'
          }
        },
        {
          id: 'forest-protection',
          name: 'Community Forest Protection Scheme',
          nameHi: 'सामुदायिक वन संरक्षण योजना',
          category: 'forestry',
          priority: 87,
          confidence: 92,
          potentialBeneficiaries: 245,
          estimatedBenefit: '₹8-12 lakh annual forest protection fund',
          estimatedBenefitHi: '₹8-12 लाख वार्षिक वन संरक्षण फंड',
          eligibilityCriteria: [
            'CFR rights recognized',
            'Forest Management Committee formed',
            'Forest cover >60%'
          ],
          eligibilityCriteriaHi: [
            'CFR अधिकार मान्यता प्राप्त',
            'वन प्रबंधन समिति गठित',
            'वन आवरण >60%'
          ],
          requiredDocuments: ['CFR certificate', 'Management plan', 'Committee registration'],
          timeline: '6-8 months',
          timelineHi: '6-8 महीने',
          reason: 'High forest cover (68.5%) but declining trend detected',
          reasonHi: 'उच्च वन आवरण (68.5%) लेकिन गिरावट की प्रवृत्ति',
          actionSteps: [
            'Strengthen Forest Management Committee',
            'Prepare Community Forest Management Plan',
            'Apply for protection fund',
            'Setup monitoring system'
          ],
          actionStepsHi: [
            'वन प्रबंधन समिति को मजबूत करें',
            'सामुदायिक वन प्रबंधन योजना तैयार करें',
            'संरक्षण फंड के लिए आवेदन दें',
            'निगरानी प्रणाली स्थापित करें'
          ],
          fundingSource: 'Compensatory Afforestation Fund',
          contactInfo: {
            department: 'Forest Department',
            phone: '+91-XXXX-XXXXXX',
            email: 'dfo.dindori@mp.gov.in'
          }
        },
        {
          id: 'ntfp-value-addition',
          name: 'NTFP Value Addition & Marketing',
          nameHi: 'NTFP मूल्य संवर्धन और विपणन',
          category: 'livelihood',
          priority: 78,
          confidence: 85,
          potentialBeneficiaries: 120,
          estimatedBenefit: '₹2000-5000 additional monthly income per household',
          estimatedBenefitHi: '₹2000-5000 अतिरिक्त मासिक आय प्रति घर',
          eligibilityCriteria: [
            'Forest rights recognized',
            'NTFP collection rights',
            'Self-help groups formed'
          ],
          eligibilityCriteriaHi: [
            'वन अधिकार मान्यता प्राप्त',
            'NTFP संग्रह अधिकार',
            'स्वयं सहायता समूह गठित'
          ],
          requiredDocuments: ['FRA certificate', 'SHG registration', 'Business plan'],
          timeline: '9-12 months',
          timelineHi: '9-12 महीने',
          reason: 'Rich biodiversity and traditional NTFP collection, but low income realization',
          reasonHi: 'समृद्ध जैव विविधता और पारंपरिक NTFP संग्रह, लेकिन कम आय',
          actionSteps: [
            'Form NTFP collection committees',
            'Setup processing units',
            'Establish market linkages',
            'Train in value addition techniques'
          ],
          actionStepsHi: [
            'NTFP संग्रह समितियां बनाएं',
            'प्रसंस्करण इकाइयां स्थापित करें',
            'बाजार संपर्क स्थापित करें',
            'मूल्य संवर्धन तकनीकों में प्रशिक्षण दें'
          ],
          fundingSource: 'Tribal Development Fund + SFDA',
          contactInfo: {
            department: 'Tribal Development Department',
            phone: '+91-XXXX-XXXXXX',
            email: 'tribal.dindori@mp.gov.in'
          }
        }
      ])

      setLoading(false)
    }, 1500)
  }

  const getIndicatorColor = (indicator: DSSIndicator) => {
    if (indicator.value >= indicator.threshold.good) return 'text-green-600'
    if (indicator.value >= indicator.threshold.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getIndicatorBgColor = (indicator: DSSIndicator) => {
    if (indicator.value >= indicator.threshold.good) return 'bg-green-100'
    if (indicator.value >= indicator.threshold.warning) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agriculture': return <Sprout className="w-5 h-5" />
      case 'forestry': return <TreePine className="w-5 h-5" />
      case 'water': return <Droplets className="w-5 h-5" />
      case 'livelihood': return <Users className="w-5 h-5" />
      case 'infrastructure': return <Target className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'bg-red-500'
    if (priority >= 75) return 'bg-orange-500'
    if (priority >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const speakRecommendation = async (recommendation: AdvancedScheme) => {
    if (voiceEnabled) {
      const text = language === 'hi' 
        ? `${recommendation.nameHi}. ${recommendation.reasonHi}`
        : `${recommendation.name}. ${recommendation.reason}`
      await audioService.speak(text, { language })
    }
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <BarChart3 className="w-16 h-16 mx-auto animate-pulse" />
          <p>Analyzing village data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'hi' ? 'निर्णय सहायता प्रणाली' : 'Decision Support System'}
          </h1>
          <p className="text-gray-600">
            {language === 'hi' 
              ? 'गांव के लिए स्मार्ट सिफारिशें और योजनाएं' 
              : 'Smart recommendations and schemes for your village'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            <Volume2 className={`w-4 h-4 mr-2 ${voiceEnabled ? 'text-blue-600' : ''}`} />
            Voice
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Village Overview */}
      {villageAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {language === 'hi' ? villageAnalytics.villageNameHi : villageAnalytics.villageName}
              <Badge variant="secondary">{villageAnalytics.district}, {villageAnalytics.state}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{villageAnalytics.totalHouseholds}</div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'कुल घर' : 'Total Households'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{villageAnalytics.fraClaims.approved}</div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'स्वीकृत दावे' : 'Approved Claims'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{villageAnalytics.schemes.active}</div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'सक्रिय योजनाएं' : 'Active Schemes'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{villageAnalytics.forestCoverPercent}%</div>
                <div className="text-sm text-gray-600">
                  {language === 'hi' ? 'वन आवरण' : 'Forest Cover'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">
            {language === 'hi' ? 'सिफारिशें' : 'Recommendations'}
          </TabsTrigger>
          <TabsTrigger value="indicators">
            {language === 'hi' ? 'संकेतक' : 'Indicators'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {language === 'hi' ? 'विश्लेषण' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'agriculture', 'forestry', 'water', 'livelihood', 'infrastructure'].map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Recommendations Grid */}
          <div className="grid gap-4">
            {filteredRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getCategoryIcon(recommendation.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {language === 'hi' ? recommendation.nameHi : recommendation.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getPriorityColor(recommendation.priority)} text-white`}>
                            Priority: {recommendation.priority}%
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.confidence}% Confidence
                          </Badge>
                          <Badge variant="secondary">
                            {recommendation.potentialBeneficiaries} Beneficiaries
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => speakRecommendation(recommendation)}
                    >
                      <Lightbulb className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{language === 'hi' ? 'कारण:' : 'Reason:'}</strong>{' '}
                      {language === 'hi' ? recommendation.reasonHi : recommendation.reason}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-medium mb-2">
                      {language === 'hi' ? 'अनुमानित लाभ:' : 'Estimated Benefit:'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'hi' ? recommendation.estimatedBenefitHi : recommendation.estimatedBenefit}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      {language === 'hi' ? 'पात्रता मानदंड:' : 'Eligibility Criteria:'}
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {(language === 'hi' ? recommendation.eligibilityCriteriaHi : recommendation.eligibilityCriteria).map((criteria, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        {language === 'hi' ? 'समयसीमा:' : 'Timeline:'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {language === 'hi' ? recommendation.timelineHi : recommendation.timeline}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        {language === 'hi' ? 'फंडिंग स्रोत:' : 'Funding Source:'}
                      </h4>
                      <p className="text-sm text-gray-600">{recommendation.fundingSource}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">
                      {language === 'hi' ? 'कार्य योजना:' : 'Action Plan:'}
                    </h4>
                    <div className="space-y-2">
                      {(language === 'hi' ? recommendation.actionStepsHi : recommendation.actionSteps).map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      {language === 'hi' ? 'आवेदन करें' : 'Apply Now'}
                    </Button>
                    <Button variant="outline">
                      {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {indicators.map((indicator) => (
              <Card key={indicator.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">
                      {language === 'hi' ? indicator.nameHi : indicator.name}
                    </h3>
                    {getTrendIcon(indicator.trend)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`text-3xl font-bold ${getIndicatorColor(indicator)}`}>
                      {indicator.value.toFixed(1)}%
                    </div>
                    
                    <Progress 
                      value={indicator.value} 
                      className={`h-2 ${getIndicatorBgColor(indicator)}`}
                    />
                    
                    <p className="text-sm text-gray-600">
                      {language === 'hi' ? indicator.descriptionHi : indicator.description}
                    </p>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Critical: {indicator.threshold.critical}%</span>
                      <span>Good: {indicator.threshold.good}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {villageAnalytics && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'hi' ? 'विकास प्राथमिकताएं' : 'Development Priorities'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {villageAnalytics.priorities.map((priority, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span>{priority}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'hi' ? 'जोखिम और चुनौतियां' : 'Risks & Challenges'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {villageAnalytics.risksAndChallenges.map((risk, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { AdvancedDSSRecommendations as AdvancedDSSDashboard }
