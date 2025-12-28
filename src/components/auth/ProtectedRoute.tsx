import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only redirect when not loading and there's no valid session
    if (!loading && !session) {
      // Store the attempted URL for redirect after login
      const returnUrl = location.pathname + location.search
      navigate('/login', { 
        replace: true, 
        state: { from: returnUrl } 
      })
    }
  }, [session, loading, navigate, location])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if there's no session
  if (!session) {
    return null
  }

  return <>{children}</>
}
