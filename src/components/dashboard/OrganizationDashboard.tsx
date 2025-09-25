import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, TrendingUp, Award, BookOpen, Target } from "lucide-react"
import { StudentDetailsModal } from "./StudentDetailsModal"
import { StatsCard } from "@/components/ui/stats-card"
import { OrganizationLeaderboard } from "@/components/missions/OrganizationLeaderboard"
import { OrganizationSettings } from "./OrganizationSettings"

interface Student {
  id: string
  user_id: string
  display_name: string
  level: number
  eco_points: number
  completed_lessons: number
  completed_missions: number
  region_district: string
  region_state: string
  region_country: string
}

export function OrganizationDashboard() {
  const { user, signOut } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { data: organizationProfile } = useQuery({
    queryKey: ['organization-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['organization-students', organizationProfile?.organization_name],
    queryFn: async () => {
      if (!organizationProfile?.organization_name) return []
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('organization_name', organizationProfile.organization_name)
        .eq('role', 'student')
        .order('eco_points', { ascending: false })
      
      if (error) throw error
      return data as Student[]
    },
    enabled: !!organizationProfile?.organization_name,
  })

  const { data: organizationStats } = useQuery({
    queryKey: ['organization-stats', organizationProfile?.organization_name],
    queryFn: async () => {
      if (!organizationProfile?.organization_name) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('eco_points, completed_lessons, completed_missions')
        .ilike('organization_name', organizationProfile.organization_name)
        .eq('role', 'student')
      
      if (error) throw error
      
      const totalStudents = data.length
      const totalEcoPoints = data.reduce((sum, student) => sum + student.eco_points, 0)
      const totalLessons = data.reduce((sum, student) => sum + student.completed_lessons, 0)
      const totalMissions = data.reduce((sum, student) => sum + student.completed_missions, 0)
      
      return {
        totalStudents,
        totalEcoPoints,
        totalLessons,
        totalMissions,
        avgEcoPoints: totalStudents > 0 ? Math.round(totalEcoPoints / totalStudents) : 0
      }
    },
    enabled: !!organizationProfile?.organization_name,
  })

  if (!organizationProfile || organizationProfile.role !== 'organization') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. Organization role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{organizationProfile.organization_name}</h1>
            <p className="text-muted-foreground mt-1">Organization Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <EcoButton variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </EcoButton>
            <EcoButton variant="outline" onClick={() => signOut()}>
              Logout
            </EcoButton>
          </div>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={organizationStats?.totalStudents?.toString() || "0"}
            description="Registered students"
            icon={Users}
          />
          <StatsCard
            title="Total Eco Points"
            value={organizationStats?.totalEcoPoints?.toString() || "0"}
            description="Combined points"
            icon={TrendingUp}
          />
          <StatsCard
            title="Avg Eco Points"
            value={organizationStats?.avgEcoPoints?.toString() || "0"}
            description="Per student"
            icon={Award}
          />
          <StatsCard
            title="Lessons Completed"
            value={organizationStats?.totalLessons?.toString() || "0"}
            description="Total lessons"
            icon={BookOpen}
          />
          <StatsCard
            title="Missions Completed"
            value={organizationStats?.totalMissions?.toString() || "0"}
            description="Total missions"
            icon={Target}
          />
        </div>

        {/* Students List */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found in your organization.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student)
                      setShowStudentDetails(true)
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{student.display_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Level {student.level} • {student.region_district}, {student.region_state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-primary">{student.eco_points} points</div>
                        <div className="text-sm text-muted-foreground">
                          {student.completed_lessons}L • {student.completed_missions}M
                        </div>
                      </div>
                      <Badge variant="outline">View Details</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </EcoCardContent>
        </EcoCard>

        {/* Organization Leaderboard */}
        <OrganizationLeaderboard />

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            organizationName={organizationProfile.organization_name}
            onClose={() => {
              setShowStudentDetails(false)
              setSelectedStudent(null)
            }}
          />
        )}

        {/* Settings Modal */}
        <OrganizationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  )
}