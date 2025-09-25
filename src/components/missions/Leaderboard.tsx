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
  display_name: string
  eco_points: number
  completed_missions: number
  rank: number
  region_district?: string
  region_state?: string
  region_country?: string
}

export function Leaderboard() {
  const [selectedRegion, setSelectedRegion] = useState<"district" | "state" | "country">("country")
  const { user } = useAuth()

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedRegion, user?.id],
    queryFn: async () => {
      if (!user) return []

      // Get current user's region info
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('region_district, region_state, region_country')
        .eq('user_id', user.id)
        .single()

      if (!userProfile) return []

      // Fix leaderboard query to show all students properly
      let query = supabase
        .from('profiles')
        .select('user_id, display_name, eco_points, completed_missions, region_district, region_state, region_country')
        .eq('role', 'student') // Only show students in leaderboard

      // Filter by region
      switch (selectedRegion) {
        case 'district':
          if (userProfile.region_district) {
            query = query.eq('region_district', userProfile.region_district)
          }
          break
        case 'state':
          if (userProfile.region_state) {
            query = query.eq('region_state', userProfile.region_state)
          }
          break
        case 'country':
          if (userProfile.region_country) {
            query = query.eq('region_country', userProfile.region_country)
          }
          break
      }

      const { data, error } = await query
        .order('eco_points', { ascending: false })
        .order('updated_at', { ascending: true }) // First to complete with same points ranks higher
        .limit(50)

      if (error) throw error

      // Add ranks
      return data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })) as LeaderboardEntry[]
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
          
          <Select value={selectedRegion} onValueChange={(value: "district" | "state" | "country") => setSelectedRegion(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="district">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  District
                </div>
              </SelectItem>
              <SelectItem value="state">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  State
                </div>
              </SelectItem>
              <SelectItem value="country">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Country
                </div>
              </SelectItem>
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

        {/* Top 10 Leaderboard */}
        <div className="space-y-2">
          {leaderboard?.slice(0, 10).map((entry) => (
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