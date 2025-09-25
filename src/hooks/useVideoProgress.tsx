import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface VideoProgress {
  id: string
  user_id: string
  lesson_id: string
  video_position: number
  duration: number
  last_watched_at: string
}

export function useVideoProgress(lessonId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: progress, isLoading } = useQuery({
    queryKey: ['video-progress', user?.id, lessonId],
    queryFn: async () => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('lesson_videos')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle()
      
      if (error) throw error
      return data as VideoProgress | null
    },
    enabled: !!user && !!lessonId,
  })

  const updateProgressMutation = useMutation({
    mutationFn: async ({ position, duration }: { position: number; duration: number }) => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('lesson_videos')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          video_position: position,
          duration: duration,
          last_watched_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-progress', user?.id, lessonId] })
    },
  })

  return {
    progress,
    isLoading,
    updateProgress: updateProgressMutation.mutate,
    isUpdating: updateProgressMutation.isPending,
  }
}