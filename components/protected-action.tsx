'use client'

import React from 'react'
import { AuthContext } from '@/components/auth-system'
import { useContext } from 'react'

interface ProtectedActionProps {
  children: (props: { requireAuth: () => void; isAuthenticated: boolean }) => React.ReactNode
}

export function ProtectedAction({ children }: ProtectedActionProps) {
  const { isAuthenticated, requireAuth } = useContext(AuthContext)
  
  return <>{children({ requireAuth, isAuthenticated })}</>
}

// Hook to protect functions
export function useProtectedAction() {
  const { isAuthenticated, requireAuth } = useContext(AuthContext)
  
  const protectAction = (callback: () => void) => {
    return () => {
      if (!isAuthenticated) {
        requireAuth()
        return
      }
      callback()
    }
  }
  
  const protectAsyncAction = (callback: () => Promise<void>) => {
    return async () => {
      if (!isAuthenticated) {
        requireAuth()
        return
      }
      await callback()
    }
  }
  
  return { protectAction, protectAsyncAction, isAuthenticated }
}
