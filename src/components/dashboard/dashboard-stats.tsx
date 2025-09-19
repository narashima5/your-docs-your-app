import { StatsCard } from "@/components/ui/stats-card"
import { BookOpen, Target, Award, TrendingUp } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"

export function DashboardStats() {
  const { profile } = useProfile()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Lessons Completed"
        value={profile?.completed_lessons.toString() || "0"}
        description="Keep learning!"
        icon={BookOpen}
      />
      <StatsCard
        title="Missions Done"
        value={profile?.completed_missions.toString() || "0"}
        description="Take action!"
        icon={Target}
      />
      <StatsCard
        title="Badges Earned"
        value={profile?.badges.length.toString() || "0"}
        description="Next: Tree Hugger"
        icon={Award}
      />
      <StatsCard
        title="Eco Points"
        value={profile?.eco_points.toString() || "0"}
        description="Keep it up!"
        icon={TrendingUp}
      />
    </div>
  )
}