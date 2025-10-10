import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Award, Trophy, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

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
        <div className="flex items-center justify-between">
          <EcoCardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Regional Leaderboard
          </EcoCardTitle>
          
          <Select value={selectedRegion} onValueChange={(value: "district" | "state" | "country" | "organization") => setSelectedRegion(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="district">District</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="country">Country</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </EcoCardHeader>

      <EcoCardContent className="space-y-4">
        {/* Current User Position */}
        {currentUserEntry && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(currentUserEntry.rank)}
                  <span className="font-bold text-lg">#{currentUserEntry.rank}</span>
                </div>
                <div>
                  <p className="font-medium">Your Position</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUserEntry.eco_points} eco-points
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/10">
                You
              </Badge>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {leaderboard?.map((entry) => (
            <div
              key={entry.user_id}
              className={`p-4 rounded-lg border ${getRankColor(entry.rank)} ${
                entry.user_id === user?.id ? "ring-2 ring-primary" : ""
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
                      {entry.user_id === user?.id && (
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
          ))}
        </div>

        {!leaderboard?.length && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No participants in your region yet. Be the first to earn points!
            </p>
          </div>
        )}
      </EcoCardContent>
    </EcoCard>
  )
}