import { useQuery } from "@tanstack/react-query"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, X, Calendar, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface CompletedLesson {
  id: string
  lesson: {
    id: string
    title: string
    description: string
    difficulty: string
    category: string
    duration_minutes: number
  }
  completed_at: string
  progress_percentage: number
}

interface CompletedLessonsListProps {
  onClose: () => void
}

export function CompletedLessonsList({ onClose }: CompletedLessonsListProps) {
  const { user } = useAuth()

  const { data: completedLessons, isLoading } = useQuery({
    queryKey: ['completed-lessons', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          id,
          completed_at,
          progress_percentage,
          lesson:lessons (
            id,
            title,
            description,
            difficulty,
            category,
            duration_minutes
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })

      if (error) throw error
      return data as CompletedLesson[]
    },
    enabled: !!user,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Intermediate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "Advanced": return "bg-red-500/10 text-red-700 border-red-500/20"
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <EcoCard className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <EcoCardHeader>
          <div className="flex items-center justify-between">
            <EcoCardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Completed Lessons ({completedLessons?.length || 0})
            </EcoCardTitle>
            <EcoButton variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </EcoButton>
          </div>
        </EcoCardHeader>

        <EcoCardContent className="overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : completedLessons?.length ? (
            <div className="space-y-4">
              {completedLessons.map((completedLesson) => (
                <EcoCard key={completedLesson.id} variant="interactive" className="group">
                  <EcoCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {completedLesson.lesson.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {completedLesson.lesson.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getDifficultyColor(completedLesson.lesson.difficulty)}>
                          {completedLesson.lesson.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{completedLesson.lesson.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{completedLesson.lesson.duration_minutes}m</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {formatDate(completedLesson.completed_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium text-green-600">
                          {completedLesson.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  </EcoCardContent>
                </EcoCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No completed lessons yet</h3>
              <p className="text-muted-foreground">
                Start learning to see your completed lessons here!
              </p>
            </div>
          )}
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}