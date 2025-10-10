import { Trophy } from "lucide-react"
import { LeaderboardEntry } from "./LeaderboardEntry"

interface LeaderboardEntryData {
  user_id: string
  display_name: string | null
  eco_points: number
  completed_missions: number
  rank: number
}

interface LeaderboardListProps {
  entries: LeaderboardEntryData[]
  currentUserId?: string
}

export function LeaderboardList({ entries, currentUserId }: LeaderboardListProps) {
  if (!entries.length) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No participants in your region yet. Be the first to earn points!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {entries.map((entry) => (
        <LeaderboardEntry
          key={entry.user_id}
          entry={entry}
          isCurrentUser={entry.user_id === currentUserId}
        />
      ))}
    </div>
  )
}
