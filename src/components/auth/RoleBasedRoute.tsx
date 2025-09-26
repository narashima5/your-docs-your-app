import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallbackRoute?: string
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles = ['student', 'organization'], 
  fallbackRoute = '/dashboard' 
}: RoleBasedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()
  const navigate = useNavigate()
  const [hasCheckedRole, setHasCheckedRole] = useState(false)

  useEffect(() => {
    if (!authLoading && !profileLoading && profile && !hasCheckedRole) {
      const userRole = profile.role
      
      if (allowedRoles.includes(userRole)) {
        setHasCheckedRole(true)
      } else {
        navigate(fallbackRoute, { replace: true })
      }
    }
  }, [authLoading, profileLoading, profile, allowedRoles, fallbackRoute, navigate, hasCheckedRole])

  if (authLoading || profileLoading || !profile || !hasCheckedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}