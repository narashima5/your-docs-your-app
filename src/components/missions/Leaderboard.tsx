import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EcoCard, EcoCardContent, EcoCardHeader } from "@/components/ui/eco-card"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { LeaderboardHeader } from "./leaderboard/LeaderboardHeader"
import { LeaderboardUserPosition } from "./leaderboard/LeaderboardUserPosition"
import { LeaderboardList } from "./leaderboard/LeaderboardList"

interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  eco_points: number
  completed_missions: number
  rank: number
  region_district?: string
  region_state?: string
  region_country?: string
}

export function Leaderboard() {
  const [selectedRegion, setSelectedRegion] = useState<"district" | "state" | "country" | "organization">("country")
  const { user } = useAuth()

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedRegion, user?.id],
    queryFn: async () => {
      if (!user) return []

      // Use secure RPC to respect RLS and fetch leaderboard scoped to current user
      const { data, error } = await (supabase.rpc as any)('get_student_leaderboard_by_scope', {
        scope: selectedRegion,
      })

      if (error) throw error

      // Add ranks
      const ranked = (data || []).map((entry: any, index: number) => ({
        user_id: entry.user_id,
        display_name: entry.display_name,
        eco_points: entry.eco_points,
        completed_missions: entry.completed_missions,
        rank: index + 1,
        region_district: entry.region_district,
        region_state: entry.region_state,
        region_country: entry.region_country,
        organization_name: entry.organization_name,
      })) as LeaderboardEntry[]

      return ranked
    },
    enabled: !!user,
  })

  const currentUserEntry = leaderboard?.find(entry => entry.user_id === user?.id)

  if (isLoading) {
    return (
      <EcoCard>
        <EcoCardContent className="p-6 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
        </EcoCardContent>
      </EcoCard>
    )
  }

  return (
    <EcoCard>
      <EcoCardHeader>
        <LeaderboardHeader
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
        />
      </EcoCardHeader>

      <EcoCardContent className="space-y-4">
        {/* Current User Position */}
        {currentUserEntry && (
          <LeaderboardUserPosition entry={currentUserEntry} />
        )}

        {/* Full Leaderboard */}
        <LeaderboardList
          entries={leaderboard || []}
          currentUserId={user?.id}
        />
      </EcoCardContent>
    </EcoCard>
  )
}
