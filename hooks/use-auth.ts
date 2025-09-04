'use client'

import { createContext, useContext } from 'react'

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

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthProtection = () => {
  const { isAuthenticated, requireAuth } = useAuth()
  
  const protectAction = (action: () => void) => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    action()
  }
  
  const protectAsyncAction = async (action: () => Promise<void>) => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    await action()
  }
  
  return { protectAction, protectAsyncAction }
}
