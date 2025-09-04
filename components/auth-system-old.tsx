'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Users,
  FileText
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee' | 'field_officer'
  department: string
  employeeId: string
  designation: string
  district: string
  isActive: boolean
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export function AuthSystem({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  })
  const [loginForm, setLoginForm] = useState({
    employeeId: '',
    password: '',
    showPassword: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()
    
    // Set up auth requirement listener
    window.addEventListener('auth-required', handleAuthRequired)
    
    return () => {
      window.removeEventListener('auth-required', handleAuthRequired)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const savedAuth = localStorage.getItem('fra-auth')
      if (savedAuth) {
        const auth = JSON.parse(savedAuth)
        setAuthState({
          isAuthenticated: true,
          user: auth.user,
          loading: false
        })
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleAuthRequired = () => {
    if (!authState.isAuthenticated) {
      setShowLoginModal(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Mock authentication - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock user data based on employee ID
      const mockUsers: { [key: string]: User } = {
        'FRA001': {
          id: '1',
          name: 'राज कुमार शर्मा',
          email: 'raj.sharma@fra.gov.in',
          role: 'admin',
          department: 'Forest Rights Administration',
          employeeId: 'FRA001',
          designation: 'District Collector',
          district: 'Dindori',
          isActive: true
        },
        'FRA002': {
          id: '2',
          name: 'प्रिया पटेल',
          email: 'priya.patel@fra.gov.in',
          role: 'employee',
          department: 'Tribal Welfare',
          employeeId: 'FRA002',
          designation: 'Assistant Commissioner',
          district: 'Dindori',
          isActive: true
        },
        'FRA003': {
          id: '3',
          name: 'अमित सिंह',
          email: 'amit.singh@fra.gov.in',
          role: 'field_officer',
          department: 'Forest Department',
          employeeId: 'FRA003',
          designation: 'Field Officer',
          district: 'Dindori',
          isActive: true
        }
      }

      const user = mockUsers[loginForm.employeeId]
      
      if (!user || loginForm.password !== 'fra123') {
        throw new Error('Invalid employee ID or password')
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Contact administrator.')
      }

      // Save auth state
      const authData = { user, token: 'mock-jwt-token' }
      localStorage.setItem('fra-auth', JSON.stringify(authData))
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fra-auth')
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    })
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Forest Rights Portal...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forest Rights Portal</h1>
              <p className="text-gray-600">वन अधिकार पोर्टल</p>
              <Badge variant="secondary" className="mt-2">
                Government Portal - Authorized Access Only
              </Badge>
            </div>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Officer Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      placeholder="Enter your Employee ID"
                      value={loginForm.employeeId}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={loginForm.showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    >
                      {loginForm.showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span>FRA001 / fra123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Employee:</span>
                  <span>FRA002 / fra123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Field Officer:</span>
                  <span>FRA003 / fra123</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="space-y-2">
              <Building2 className="w-6 h-6 mx-auto text-gray-600" />
              <p className="text-gray-600">Government Portal</p>
            </div>
            <div className="space-y-2">
              <Users className="w-6 h-6 mx-auto text-gray-600" />
              <p className="text-gray-600">Multi-role Access</p>
            </div>
            <div className="space-y-2">
              <FileText className="w-6 h-6 mx-auto text-gray-600" />
              <p className="text-gray-600">Digital Claims</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pass user context to children
  return (
    <div data-user-role={authState.user?.role} data-user-id={authState.user?.id}>
      {children}
    </div>
  )
}
