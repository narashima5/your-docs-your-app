import { StatsCard } from "@/components/ui/stats-card"
import { 
  BookOpen, 
  CheckCircle, 
  Target, 
  Award, 
  Brain, 
  Coins,
  Trophy 
} from "lucide-react"

// Mock user data - in real app this would come from API/context
const mockUserStats = {
  ongoingLessons: 3,
  completedLessons: 12,
  missionsCompleted: 8,
  badgesEarned: 15,
  quizzesAttended: 18,
  ecoPoints: 2450,
  leaderboardPosition: 47
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Ongoing Lessons"
        value={mockUserStats.ongoingLessons}
        icon={BookOpen}
        description="Continue your learning"
        variant="primary"
      />
      
      <StatsCard
        title="Completed Lessons"
        value={mockUserStats.completedLessons}
        icon={CheckCircle}
        description="Great progress!"
        variant="success"
      />
      
      <StatsCard
        title="Missions Completed"
        value={mockUserStats.missionsCompleted}
        icon={Target}
        description="Real-world impact"
        variant="accent"
      />
      
      <StatsCard
        title="Badges Earned"
        value={mockUserStats.badgesEarned}
        icon={Award}
        description="Achievement unlocked"
        variant="warning"
      />
      
      <StatsCard
        title="Quizzes Attended"
        value={mockUserStats.quizzesAttended}
        icon={Brain}
        description="Knowledge tested"
        variant="default"
      />
      
      <StatsCard
        title="Eco-Points"
        value={mockUserStats.ecoPoints}
        icon={Coins}
        description="Keep earning more!"
        variant="success"
        className="md:col-span-2 lg:col-span-1"
      />
      
      <StatsCard
        title="Leaderboard Rank"
        value={`#${mockUserStats.leaderboardPosition}`}
        icon={Trophy}
        description="Climb higher!"
        variant="primary"
        className="lg:col-span-1"
      />
    </div>
  )
}