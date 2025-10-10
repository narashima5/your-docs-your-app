import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Award, Trophy } from "lucide-react"

interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  eco_points: number
  completed_missions: number
  rank: number
}

interface LeaderboardUserPositionProps {
  entry: LeaderboardEntry
}

export function LeaderboardUserPosition({ entry }: LeaderboardUserPositionProps) {
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

  return (
    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getRankIcon(entry.rank)}
            <span className="font-bold text-lg">#{entry.rank}</span>
          </div>
          <div>
            <p className="font-medium">Your Position</p>
            <p className="text-sm text-muted-foreground">
              {entry.eco_points} eco-points
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          You
        </Badge>
      </div>
    </div>
  )
}
