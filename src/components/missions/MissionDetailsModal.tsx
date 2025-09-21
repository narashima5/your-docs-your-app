import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { X, Clock, Target, Star, Play } from "lucide-react"

interface Mission {
  id: string
  title: string
  description: string
  instructions: string
  difficulty: string
  category: string
  estimated_time: string
  points: number
  requirements: any[]
}

interface MissionDetailsModalProps {
  mission: Mission
  onClose: () => void
  onStart: (missionId: string) => void
}

export function MissionDetailsModal({ mission, onClose, onStart }: MissionDetailsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-700 border-green-500/20"
      case "Medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      case "Hard": return "bg-red-500/10 text-red-700 border-red-500/20"
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <EcoCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <EcoCardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <EcoCardTitle className="text-xl mb-2">{mission.title}</EcoCardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(mission.difficulty)}>
                  {mission.difficulty}
                </Badge>
                <Badge variant="outline">{mission.category}</Badge>
              </div>
            </div>
            <EcoButton variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </EcoButton>
          </div>
        </EcoCardHeader>

        <EcoCardContent className="overflow-y-auto space-y-6">
          {/* Mission Overview */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Mission Overview</h3>
            <p className="text-muted-foreground">{mission.description}</p>
          </div>

          {/* Mission Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Estimated Time</div>
                <div className="font-medium">{mission.estimated_time}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg">
              <Star className="h-5 w-5 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Points</div>
                <div className="font-medium">{mission.points} pts</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-500/5 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
                <div className="font-medium">{mission.difficulty}</div>
              </div>
            </div>
          </div>

          {/* Complete Instructions */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Complete Instructions</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {mission.instructions}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {mission.requirements && mission.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Requirements</h3>
              <ul className="space-y-2">
                {mission.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <EcoButton 
              onClick={() => onStart(mission.id)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Mission
            </EcoButton>
            <EcoButton variant="outline" onClick={onClose}>
              Maybe Later
            </EcoButton>
          </div>
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}