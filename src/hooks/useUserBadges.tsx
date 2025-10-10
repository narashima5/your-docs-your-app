import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useUserBadges() {
  const { user } = useAuth()

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  return {
    badges,
    badgeCount: badges.length,
    isLoading,
  }
}
