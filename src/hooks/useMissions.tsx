import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useRewards } from '@/contexts/RewardsContext'

interface Mission {
  id: string
  title: string
  description: string
  instructions: string
  points: number
  difficulty: string
  category: string
  estimated_time: string
  requirements: any
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MissionSubmission {
  id: string
  user_id: string
  mission_id: string
  status: string
  submission_data: any
  submitted_at?: string | null
  reviewed_at?: string | null
  reviewer_notes?: string | null
  points_awarded: number | null
  created_at: string
  updated_at: string
}

interface MissionWithSubmission extends Mission {
  submission?: MissionSubmission
  status: string
}

export function useMissions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { addReward } = useRewards()

  const { data: missions, isLoading, error } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async () => {
      // Fetch active missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (missionsError) throw missionsError

      // If user is authenticated, fetch their submissions
      if (user) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('mission_submissions')
          .select('*')
          .eq('user_id', user.id)

        if (submissionsError) throw submissionsError

        // Combine missions with submissions
        const missionsWithSubmissions: MissionWithSubmission[] = missionsData.map(mission => {
          const submission = submissionsData.find(s => s.mission_id === mission.id)
          const status = submission?.status || 'not_started'

          return {
            ...mission,
            submission,
            status
          }
        })

        return missionsWithSubmissions
      }

      // If no user, return missions without submissions
      return missionsData.map(mission => ({
        ...mission,
        status: 'not_started' as const
      }))
    },
    enabled: true,
  })

  const startMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user) throw new Error('No user')

      const { data, error } = await supabase
        .from('mission_submissions')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          status: 'in_progress'
        }, { onConflict: 'user_id, mission_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] })
    },
  })

  const submitMissionMutation = useMutation({
    mutationFn: async ({ missionId, submissionData, videoUrl }: {
      missionId: string
      submissionData: any
      videoUrl?: string | null
    }) => {
      if (!user) throw new Error('No user')

      const { data, error } = await supabase
        .from('mission_submissions')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          status: 'submitted',
          submission_data: submissionData,
          video_url: videoUrl || null,
          submitted_at: new Date().toISOString()
        }, { onConflict: 'user_id, mission_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['completed-missions', user?.id] })
      
      // Get mission title
      const { data: missionData } = await supabase
        .from('missions')
        .select('title')
        .eq('id', variables.missionId)
        .single()
      
      // Show mission submission animation
      addReward({
        type: 'mission',
        points: 0, // Points awarded on approval, not submission
        title: missionData?.title || 'Mission'
      })
    },
  })

  // Get mission statistics
  const { data: missionStats } = useQuery({
    queryKey: ['mission-stats', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data: submissions, error } = await supabase
        .from('mission_submissions')
        .select('status, points_awarded')
        .eq('user_id', user.id)

      if (error) throw error

      const totalTasks = missions?.length || 0
      const completedTasks = submissions.filter(s => s.status === 'approved').length
      const totalPointsEarned = submissions
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => sum + (s.points_awarded || 0), 0)

      return {
        totalTasks,
        completedTasks,
        totalPointsEarned,
        submittedTasks: submissions.filter(s => s.status === 'submitted').length,
        inProgressTasks: submissions.filter(s => s.status === 'in_progress').length
      }
    },
    enabled: !!user && !!missions,
  })

  return {
    missions,
    missionStats,
    isLoading,
    error,
    startMission: startMissionMutation.mutate,
    submitMission: submitMissionMutation.mutate,
    isStartingMission: startMissionMutation.isPending,
    isSubmittingMission: submitMissionMutation.isPending,
  }
}