import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { PlayCircle, Camera, BookOpen, Target } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { VideoPlayer } from "@/components/lessons/VideoPlayer"

export function ContinueLearning() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedLesson, setSelectedLesson] = useState<any>(null)

  // Get in-progress lessons
  const { data: inProgressLessons = [] } = useQuery({
    queryKey: ['in-progress-lessons', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lesson:lessons(*)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gt('progress_percentage', 0)
        .order('last_accessed_at', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Get started but not submitted missions
  const { data: startedMissions = [] } = useQuery({
    queryKey: ['started-missions', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          mission:missions(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('updated_at', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  if (inProgressLessons.length === 0 && startedMissions.length === 0) {
    return null
  }

  return (
    <>
      <EcoCard className="mb-8">
        <EcoCardHeader>
          <EcoCardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Continue Learning
          </EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent className="space-y-6">
          {/* In-Progress Lessons */}
          {inProgressLessons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Resume Lessons
              </h3>
              {inProgressLessons.map((progress: any) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{progress.lesson.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <EcoButton
                    variant="eco"
                    size="sm"
                    className="ml-4"
                    onClick={() => setSelectedLesson(progress.lesson)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </EcoButton>
                </div>
              ))}
            </div>
          )}

          {/* Started Missions */}
          {startedMissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                Pending Missions
              </h3>
              {startedMissions.map((submission: any) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{submission.mission.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Started on {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <EcoButton
                    variant="nature"
                    size="sm"
                    onClick={() => navigate('/missions')}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Submit Proof
                  </EcoButton>
                </div>
              ))}
            </div>
          )}
        </EcoCardContent>
      </EcoCard>

      {/* Video Player Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle>{selectedLesson.title}</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <VideoPlayer 
                  lesson={selectedLesson}
                  onProgressUpdate={() => {}}
                  onComplete={() => setSelectedLesson(null)}
                  onClose={() => setSelectedLesson(null)}
                />
                <div className="mt-4 text-center">
                  <EcoButton variant="outline" onClick={() => setSelectedLesson(null)}>
                    Close
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          </div>
        </div>
      )}
    </>
  )
}
