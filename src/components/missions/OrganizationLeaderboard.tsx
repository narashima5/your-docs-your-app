import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, TrendingUp, Award } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrganizationLeaderboardData {
  organization_name: string
  region_district: string
  region_state: string
  region_country: string
  student_count: number
  total_eco_points: number
  avg_eco_points: number
  total_lessons_completed: number
  total_missions_completed: number
}

export function OrganizationLeaderboard({ className }: { className?: string }) {
  const [selectedRegion, setSelectedRegion] = useState<'district' | 'state' | 'country'>('state')
  const [selectedValue, setSelectedValue] = useState<string>('')

  // Get available regions
  const { data: regions } = useQuery({
    queryKey: ['regions', selectedRegion],
    queryFn: async () => {
      const column = selectedRegion === 'district' ? 'region_district' : 
                   selectedRegion === 'state' ? 'region_state' : 'region_country'
      
      const { data, error } = await supabase
        .from('profiles')
        .select(column)
        .eq('role', 'student')
        .not(column, 'is', null)
      
      if (error) throw error
      
      const uniqueRegions = [...new Set(data.map(item => item[column]).filter(Boolean))]
      return uniqueRegions.sort()
    },
  })

  // Get organization leaderboard data
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organization-leaderboard', selectedRegion, selectedValue],
    queryFn: async () => {
      if (!selectedValue) return []
      
      const column = selectedRegion === 'district' ? 'region_district' : 
                   selectedRegion === 'state' ? 'region_state' : 'region_country'
      
      const { data, error } = await supabase
        .from('organization_leaderboard')
        .select('*')
        .eq(column, selectedValue)
        .order('student_count', { ascending: false })
        .order('total_eco_points', { ascending: false })
      
      if (error) throw error
      return data as OrganizationLeaderboardData[]
    },
    enabled: !!selectedValue,
  })

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1: return <Trophy className="h-5 w-5 text-gray-400" />
      case 2: return <Trophy className="h-5 w-5 text-amber-600" />
      default: return <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">#{index + 1}</div>
    }
  }

  return (
    <EcoCard className={className}>
      <EcoCardHeader>
        <EcoCardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Organization Leaderboard
        </EcoCardTitle>
        <div className="flex gap-2 mt-4">
          <Select value={selectedRegion} onValueChange={(value: 'district' | 'state' | 'country') => {
            setSelectedRegion(value)
            setSelectedValue('')
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="district">District</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="country">Country</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedValue} onValueChange={setSelectedValue}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={`Select ${selectedRegion}`} />
            </SelectTrigger>
            <SelectContent>
              {regions?.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </EcoCardHeader>
      <EcoCardContent>
        {!selectedValue ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Select a region to view organization rankings</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No organizations found in this region</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {organizations.map((org, index) => (
                <div
                  key={org.organization_name}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20' : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{org.organization_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {org.region_district}, {org.region_state}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{org.student_count}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{org.total_eco_points.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Total Points</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        <span className="font-medium">{Math.round(org.avg_eco_points)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Points</div>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <Badge className={
                      index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-800 border-gray-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }>
                      {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </EcoCardContent>
    </EcoCard>
  )
}