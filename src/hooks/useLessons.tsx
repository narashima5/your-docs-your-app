import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useRewards } from '@/contexts/RewardsContext'

interface Lesson {
  id: string
  title: string
  description: string
  content: any
  difficulty: string
  category: string
  duration_minutes: number
  thumbnail_url?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  progress_percentage: number
  is_completed: boolean
  completed_at?: string
  last_accessed_at: string
  created_at: string
  updated_at: string
}

interface LessonWithProgress extends Lesson {
  progress?: LessonProgress
  status: 'not_started' | 'in_progress' | 'completed'
}

export function useLessons() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { addReward } = useRewards()

  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['lessons', user?.id],
    queryFn: async () => {
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true })

      if (lessonsError) throw lessonsError

      // If user is authenticated, fetch their progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)

        if (progressError) throw progressError

        // Combine lessons with progress
        const lessonsWithProgress: LessonWithProgress[] = lessonsData.map(lesson => {
          const progress = progressData.find(p => p.lesson_id === lesson.id)
          let status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
          
          if (progress) {
            if (progress.is_completed) {
              status = 'completed'
            } else if (progress.progress_percentage > 0) {
              status = 'in_progress'
            }
          }

          return {
            ...lesson,
            progress,
            status
          }
        })

        return lessonsWithProgress
      }

      // If no user, return lessons without progress
      return lessonsData.map(lesson => ({
        ...lesson,
        status: 'not_started' as const
      }))
    },
    enabled: true,
  })

  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, progressPercentage, isCompleted }: {
      lessonId: string
      progressPercentage: number
      isCompleted?: boolean
    }) => {
      if (!user) throw new Error('No user')

      const updates = {
        user_id: user.id,
        lesson_id: lessonId,
        progress_percentage: progressPercentage,
        is_completed: isCompleted || progressPercentage >= 100,
        completed_at: (isCompleted || progressPercentage >= 100) ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert(updates, { onConflict: 'user_id, lesson_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['completed-lessons', user?.id] })
      
      if (data.is_completed) {
        // Get lesson title
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('title')
          .eq('id', variables.lessonId)
          .single()
        
        // Show lesson completion animation
        addReward({
          type: 'lesson',
          points: 25,
          title: lessonData?.title || 'Lesson'
        })
        
        // Check for level up
        const { data: profileData } = await supabase
          .from('profiles')
          .select('level, eco_points')
          .eq('user_id', user?.id)
          .single()
        
        if (profileData) {
          const oldLevel = Math.max(1, Math.floor((profileData.eco_points - 25) / 200) + 1)
          const newLevel = Math.max(1, Math.floor(profileData.eco_points / 200) + 1)
          
          if (newLevel > oldLevel) {
            setTimeout(() => {
              addReward({
                type: 'level_up',
                points: 0,
                title: `Level ${newLevel}`,
                newLevel
              })
            }, 3500)
          }
        }
      }
    },
  })

  return {
    lessons,
    isLoading,
    error,
    updateProgress: updateProgressMutation.mutate,
    isUpdatingProgress: updateProgressMutation.isPending,
  }
}