import { Trophy } from "lucide-react"
import { EcoCardTitle } from "@/components/ui/eco-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaderboardHeaderProps {
  selectedRegion: string
  onRegionChange: (region: "district" | "state" | "country" | "organization") => void
}

export function LeaderboardHeader({ selectedRegion, onRegionChange }: LeaderboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <EcoCardTitle className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Regional Leaderboard
      </EcoCardTitle>
      
      <Select value={selectedRegion} onValueChange={(value: "district" | "state" | "country" | "organization") => onRegionChange(value)}>
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
  )
}
