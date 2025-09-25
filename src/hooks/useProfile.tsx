import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Profile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  level: number
  eco_points: number
  completed_lessons: number
  completed_missions: number
  badges: string[]
  streak_days: number
  last_activity_date: string | null
  region_district: string | null
  region_state: string | null
  region_country: string | null
  role: string
  gender: string | null
  organization_name: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) throw error
      return data as Profile | null
    },
    enabled: !!user,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  }
}