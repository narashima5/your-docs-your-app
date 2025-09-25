import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useLessonMissions(lessonId?: string) {
  const { user } = useAuth()

  const { data: missions, isLoading } = useQuery({
    queryKey: ['lesson-missions', lessonId],
    queryFn: async () => {
      if (!lessonId) return []
      
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_active', true)
        .order('title')
      
      if (error) throw error
      return data || []
    },
    enabled: !!lessonId,
  })

  const { data: missionSubmissions } = useQuery({
    queryKey: ['mission-submissions', user?.id, lessonId],
    queryFn: async () => {
      if (!user || !lessonId || !missions?.length) return []
      
      const missionIds = missions.map(m => m.id)
      
      const { data, error } = await supabase
        .from('mission_submissions')
        .select('*')
        .eq('user_id', user.id)
        .in('mission_id', missionIds)
      
      if (error) throw error
      return data || []
    },
    enabled: !!user && !!lessonId && !!missions?.length,
  })

  const missionsWithStatus = missions?.map(mission => {
    const submission = missionSubmissions?.find(s => s.mission_id === mission.id)
    return {
      ...mission,
      status: submission?.status || 'not_started',
      submission
    }
  })

  return {
    missions: missionsWithStatus || [],
    isLoading,
  }
}