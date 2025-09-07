'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  FileText,
  Satellite,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Lightbulb,
  Award,
  Activity
} from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description: string
  category: 'processing' | 'verification' | 'policy' | 'resource'
  priority: 'high' | 'medium' | 'low'
  confidence: number
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  implementationCost: string
  potentialBenefit: string
  affectedClaims: number
  recommendedBy: string
  createdAt: string
  status: 'new' | 'in_progress' | 'implemented' | 'rejected'
}

interface Analytics {
  totalClaims: number
  processingTime: {
    current: number
    target: number
    trend: 'up' | 'down'
  }
  approvalRate: {
    current: number
    previous: number
    trend: 'up' | 'down'
  }
  efficiency: {
    score: number
    factors: string[]
  }
  predictiveInsights: {
    expectedClaims: number
    peakPeriod: string
    resourceNeeds: string[]
  }
}

const mockRecommendations: Recommendation[] = [
  {
    id: 'REC-001',
    title: 'Optimize Satellite Data Processing',
    description: 'Implement batch processing for satellite imagery analysis to reduce processing time by 40%',
    category: 'processing',
    priority: 'high',
    confidence: 94.5,
    impact: 'high',
    timeframe: '2-3 weeks',
    implementationCost: '₹2-3 Lakhs',
    potentialBenefit: '40% faster processing',
    affectedClaims: 1250,
    recommendedBy: 'AI System',
    createdAt: '2024-03-15',
    status: 'new'
  },
  {
    id: 'REC-002', 
    title: 'Automated Document Verification',
    description: 'Deploy ML model for initial document screening to reduce manual review workload',
    category: 'verification',
    priority: 'high',
    confidence: 89.2,
    impact: 'high',
    timeframe: '3-4 weeks',
    implementationCost: '₹5-7 Lakhs',
    potentialBenefit: '60% reduction in manual work',
    affectedClaims: 2100,
    recommendedBy: 'Data Analytics Team',
    createdAt: '2024-03-14',
    status: 'in_progress'
  },
  {
    id: 'REC-003',
    title: 'Mobile Training Program',
    description: 'Launch comprehensive mobile app training for field officers in remote areas',
    category: 'resource',
    priority: 'medium',
    confidence: 87.8,
    impact: 'medium',
    timeframe: '4-6 weeks',
    implementationCost: '₹3-4 Lakhs',
    potentialBenefit: '25% improvement in data quality',
    affectedClaims: 800,
    recommendedBy: 'Field Operations',
    createdAt: '2024-03-13',
    status: 'new'
  },
  {
    id: 'REC-004',
    title: 'Policy Simplification Initiative',
    description: 'Streamline claim categories and reduce documentation requirements for certain claim types',
    category: 'policy',
    priority: 'medium',
    confidence: 82.1,
    impact: 'high',
    timeframe: '8-12 weeks',
    implementationCost: '₹1-2 Lakhs',
    potentialBenefit: '30% faster approvals',
    affectedClaims: 1500,
    recommendedBy: 'Policy Analysis Unit',
    createdAt: '2024-03-12',
    status: 'new'
  }
]

const mockAnalytics: Analytics = {
  totalClaims: 2456,
  processingTime: {
    current: 45,
    target: 30,
    trend: 'down'
  },
  approvalRate: {
    current: 78.5,
    previous: 72.3,
    trend: 'up'
  },
  efficiency: {
    score: 82.4,
    factors: ['Automated screening', 'Improved documentation', 'Staff training']
  },
  predictiveInsights: {
    expectedClaims: 3200,
    peakPeriod: 'April-June 2024',
    resourceNeeds: ['2 Additional Officers', 'Satellite data subscription', 'Training materials']
  }
}

export default function EnhancedDSSPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterRecommendations()
  }, [recommendations, categoryFilter, priorityFilter, statusFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setRecommendations(mockRecommendations)
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to load DSS data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecommendations = () => {
    let filtered = [...recommendations]

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(rec => rec.category === categoryFilter)
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(rec => rec.priority === priorityFilter)
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rec => rec.status === statusFilter)
    }

    setFilteredRecommendations(filtered)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800"><Lightbulb className="w-3 h-3 mr-1" />New</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Implemented</Badge>
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'processing': return <BarChart3 className="w-4 h-4 text-blue-600" />
      case 'verification': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'policy': return <FileText className="w-4 h-4 text-purple-600" />
      case 'resource': return <Users className="w-4 h-4 text-orange-600" />
      default: return <Target className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Decision Support System
          </h1>
          <p className="text-gray-600 mt-1">AI-powered insights and recommendations for FRA claim processing</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Analytics
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold">{analytics.totalClaims.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing Time</p>
                <p className="text-2xl font-bold">{analytics.processingTime.current} days</p>
                <div className="flex items-center gap-1 text-sm">
                  {analytics.processingTime.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  )}
                  <span className={analytics.processingTime.trend === 'down' ? 'text-green-600' : 'text-red-600'}>
                    Target: {analytics.processingTime.target} days
                  </span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">{analytics.approvalRate.current}%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+{(analytics.approvalRate.current - analytics.approvalRate.previous).toFixed(1)}%</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold">{analytics.efficiency.score}%</p>
                <Progress value={analytics.efficiency.score} className="h-1 mt-2" />
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            {filteredRecommendations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recommendations found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getCategoryIcon(recommendation.category)}
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{recommendation.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Timeframe:</span>
                            <p className="font-medium">{recommendation.timeframe}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <p className="font-medium">{recommendation.implementationCost}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Benefit:</span>
                            <p className="font-medium">{recommendation.potentialBenefit}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Affected Claims:</span>
                            <p className="font-medium">{recommendation.affectedClaims}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {getPriorityBadge(recommendation.priority)}
                          {getStatusBadge(recommendation.status)}
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>AI Confidence</span>
                            <span className="font-bold">{recommendation.confidence}%</span>
                          </div>
                          <Progress value={recommendation.confidence} className="h-2" />
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>By: {recommendation.recommendedBy}</p>
                          <p>{new Date(recommendation.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Efficiency Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.efficiency.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{factor}</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall System Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Quality Score</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User Satisfaction</span>
                    <span className="font-bold">4.7/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Demand Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Expected Claims (Next Quarter)</p>
                    <p className="text-2xl font-bold">{analytics.predictiveInsights.expectedClaims}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Peak Period</p>
                    <p className="font-medium">{analytics.predictiveInsights.peakPeriod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Resource Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.predictiveInsights.resourceNeeds.map((need, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{need}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
