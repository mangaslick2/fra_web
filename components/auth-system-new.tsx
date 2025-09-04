'use client'

import React, { useState, useEffect, createContext } from 'react'
import { Shield, User, Lock, Eye, EyeOff, AlertCircle, Building2, Users, FileText, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee' | 'field_officer'
  department: string
  employeeId: string
  designation: string
  district?: string
  isActive: boolean
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (employeeId: string, password: string) => Promise<void>
  logout: () => void
  requireAuth: () => void
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  requireAuth: () => {}
})

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
    
    // Set up auth requirement listener for protected actions
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
    setError('')
    setIsLoading(true)

    try {
      // Mock authentication - replace with real API call
      const mockUsers: Record<string, User> = {
        'FRA001': {
          id: '1',
          name: 'राज कुमार',
          email: 'raj.kumar@fra.gov.in',
          role: 'admin',
          department: 'Forest Department',
          employeeId: 'FRA001',
          designation: 'District Collector',
          district: 'Balaghat',
          isActive: true
        },
        'FRA002': {
          id: '2',
          name: 'सुनीता शर्मा',
          email: 'sunita.sharma@fra.gov.in',
          role: 'employee',
          department: 'Tribal Affairs',
          employeeId: 'FRA002',
          designation: 'Sub Divisional Officer',
          district: 'Mandla',
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

      setShowLoginModal(false)
      setLoginForm({ employeeId: '', password: '', showPassword: false })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loginFunction = async (employeeId: string, password: string) => {
    setLoginForm({ employeeId, password, showPassword: false })
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
    await handleLogin(fakeEvent)
  }

  const handleLogout = () => {
    localStorage.removeItem('fra-auth')
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    })
    setShowLoginModal(false)
    // Redirect to home page
    window.location.href = '/'
  }

  // Loading state - show spinner only initially
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading Forest Rights Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login: loginFunction, 
      logout: handleLogout, 
      requireAuth: () => handleAuthRequired() 
    }}>
      {children}
      
      {/* Login Modal - Only shown when auth is required */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Authentication Required
              </h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please login to perform this action.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={loginForm.employeeId}
                  onChange={(e) => setLoginForm(prev => ({
                    ...prev,
                    employeeId: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your employee ID"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type={loginForm.showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setLoginForm(prev => ({
                    ...prev,
                    showPassword: !prev.showPassword
                  }))}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {loginForm.showPassword ? 
                    <EyeOff className="h-4 w-4" /> : 
                    <Eye className="h-4 w-4" />
                  }
                </button>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-500">
              <p><strong>Demo Accounts:</strong></p>
              <p>Admin: FRA001/fra123</p>
              <p>Employee: FRA002/fra123</p>
              <p>Field Officer: FRA003/fra123</p>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
