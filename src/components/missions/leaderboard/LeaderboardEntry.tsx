import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Award, Trophy } from "lucide-react"

interface LeaderboardEntryData {
  user_id: string
  display_name: string | null
  eco_points: number
  completed_missions: number
  rank: number
}

interface LeaderboardEntryProps {
  entry: LeaderboardEntryData
  isCurrentUser: boolean
}

export function LeaderboardEntry({ entry, isCurrentUser }: LeaderboardEntryProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30"
      default:
        return "bg-card border-border"
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border ${getRankColor(entry.rank)} ${
        isCurrentUser ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-[60px]">
            {getRankIcon(entry.rank)}
            <span className="font-bold">#{entry.rank}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {entry.display_name || 'Anonymous User'}
              </p>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {entry.completed_missions} missions completed
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-primary text-lg">
            {entry.eco_points}
          </div>
          <div className="text-xs text-muted-foreground">
            eco-points
          </div>
        </div>
      </div>
    </div>
  )
}
