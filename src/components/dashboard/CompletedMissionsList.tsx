import { useQuery } from "@tanstack/react-query"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Target, X, Calendar, Coins, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface CompletedMission {
  id: string
  mission: {
    id: string
    title: string
    description: string
    difficulty: string
    category: string
    estimated_time: string
    points: number
  }
  points_awarded: number
  status: string
  submitted_at: string
}

interface CompletedMissionsListProps {
  onClose: () => void
}

export function CompletedMissionsList({ onClose }: CompletedMissionsListProps) {
  const { user } = useAuth()

  const { data: completedMissions, isLoading } = useQuery({
    queryKey: ['completed-missions', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          id,
          points_awarded,
          status,
          submitted_at,
          mission:missions (
            id,
            title,
            description,
            difficulty,
            category,
            estimated_time,
            points
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return data as CompletedMission[]
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

  const totalPointsEarned = completedMissions?.reduce((sum, mission) => sum + (mission.points_awarded || 0), 0) || 0

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <EcoCard className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <EcoCardHeader>
          <div className="flex items-center justify-between">
            <EcoCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Completed Missions ({completedMissions?.length || 0})
            </EcoCardTitle>
            <EcoButton variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </EcoButton>
          </div>
          
          {totalPointsEarned > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Total Points Earned: {totalPointsEarned}
            </div>
          )}
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
          ) : completedMissions?.length ? (
            <div className="space-y-4">
              {completedMissions.map((completedMission) => (
                <EcoCard key={completedMission.id} variant="interactive" className="group">
                  <EcoCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {completedMission.mission.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {completedMission.mission.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getDifficultyColor(completedMission.mission.difficulty)}>
                          {completedMission.mission.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <Coins className="h-4 w-4" />
                          <span>{completedMission.points_awarded}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{completedMission.mission.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{completedMission.mission.estimated_time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {formatDate(completedMission.submitted_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                          {completedMission.status}
                        </Badge>
                      </div>
                    </div>
                  </EcoCardContent>
                </EcoCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No completed missions yet</h3>
              <p className="text-muted-foreground">
                Complete missions to see your achievements here!
              </p>
            </div>
          )}
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}