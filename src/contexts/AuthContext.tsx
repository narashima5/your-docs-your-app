import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event)
          
          // Handle different auth events
          switch (event) {
            case 'SIGNED_OUT':
              setSession(null)
              setUser(null)
              break
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
              if (session) {
                setSession(session)
                setUser(session.user)
              } else {
                // Token refresh failed
                console.log('Token refresh failed, clearing session')
                setSession(null)
                setUser(null)
              }
              break
            case 'INITIAL_SESSION':
              setSession(session)
              setUser(session?.user ?? null)
              break
            default:
              setSession(session)
              setUser(session?.user ?? null)
          }
          setLoading(false)
        }
      }
    )

    // Then get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) {
          console.log('Session error:', error.message)
          // Clear any corrupted session data
          supabase.auth.signOut()
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
        setLoading(false)
      }
    }).catch((error) => {
      if (mounted) {
        console.log('Failed to get session:', error.message)
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/dashboard`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {
          display_name: email.split('@')[0],
          role: 'student'
        }
      }
    })
    
    if (!error) {
      toast({
        title: "Account created! 🌱",
        description: "Check your email to verify your account",
      })
    }
    
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.session) {
      // Session is automatically handled by onAuthStateChange
      console.log('Sign in successful')
    }
    
    return { error }
  }

  const signOut = async () => {
    try {
      // Clear local state first for immediate UI feedback
      setSession(null)
      setUser(null)
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        toast({
          title: "Sign out issue",
          description: "You've been signed out locally. Please refresh if needed.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
      }
    } catch (error) {
      console.error('Sign out exception:', error)
      // Still clear local state even if API call fails
      setSession(null)
      setUser(null)
    }
  }

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
