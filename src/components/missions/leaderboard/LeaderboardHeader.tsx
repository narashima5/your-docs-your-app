import { Trophy } from "lucide-react"
import { EcoCardTitle } from "@/components/ui/eco-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaderboardHeaderProps {
  selectedRegion: string
  onRegionChange: (region: "district" | "state" | "country" | "organization") => void
}

export function LeaderboardHeader({ selectedRegion, onRegionChange }: LeaderboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <EcoCardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        Regional Leaderboard
      </EcoCardTitle>
      
      <Select value={selectedRegion} onValueChange={(value: "district" | "state" | "country" | "organization") => onRegionChange(value)}>
        <SelectTrigger className="w-full sm:w-40">
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
