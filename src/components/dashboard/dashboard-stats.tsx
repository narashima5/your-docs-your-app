import { useState } from "react"
import { StatsCard } from "@/components/ui/stats-card"
import { BookOpen, Target, Award, TrendingUp } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useUserBadges } from "@/hooks/useUserBadges"
import { BadgesList } from "./BadgesList"
import { CompletedLessonsList } from "./CompletedLessonsList"
import { CompletedMissionsList } from "./CompletedMissionsList"

export function DashboardStats() {
  const { profile } = useProfile()
  const { badgeCount } = useUserBadges()
  const [showBadges, setShowBadges] = useState(false)
  const [showCompletedLessons, setShowCompletedLessons] = useState(false)
  const [showCompletedMissions, setShowCompletedMissions] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => setShowCompletedLessons(true)} className="cursor-pointer">
          <StatsCard
            title="Lessons Completed"
            value={profile?.completed_lessons.toString() || "0"}
            description="Keep learning!"
            icon={BookOpen}
          />
        </div>
        <div onClick={() => setShowCompletedMissions(true)} className="cursor-pointer">
          <StatsCard
            title="Missions Done"
            value={profile?.completed_missions.toString() || "0"}
            description="Take action!"
            icon={Target}
          />
        </div>
        <div onClick={() => setShowBadges(true)} className="cursor-pointer">
          <StatsCard
            title="Badges Earned"
            value={badgeCount.toString()}
            description="Next: Tree Hugger"
            icon={Award}
          />
        </div>
        <StatsCard
          title="Eco Points"
          value={profile?.eco_points.toString() || "0"}
          description="Keep it up!"
          icon={TrendingUp}
        />
      </div>

      {/* Modals */}
      {showBadges && <BadgesList onClose={() => setShowBadges(false)} />}
      {showCompletedLessons && <CompletedLessonsList onClose={() => setShowCompletedLessons(false)} />}
      {showCompletedMissions && <CompletedMissionsList onClose={() => setShowCompletedMissions(false)} />}
    </>
  )
}