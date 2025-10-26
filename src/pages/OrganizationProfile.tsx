import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/contexts/AuthContext"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/ui/stats-card"
import { Building2, MapPin, Award, TrendingUp, BookOpen, Target, Edit3, Save, X, Users, Code } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrganizationProfile() {
  const { user } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    organization_name: "",
    display_name: "",
    region_district: "",
    region_state: "",
    region_country: ""
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  // Get organization stats
  const { data: orgStats } = useQuery({
    queryKey: ['org-stats', profile?.organization_code],
    queryFn: async () => {
      if (!profile?.organization_code) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('eco_points, completed_lessons, completed_missions')
        .eq('organization_code', profile.organization_code)
        .eq('role', 'student')

      if (error) throw error

      const totalStudents = data.length
      const totalEcoPoints = data.reduce((sum, s) => sum + s.eco_points, 0)
      const totalLessons = data.reduce((sum, s) => sum + s.completed_lessons, 0)
      const totalMissions = data.reduce((sum, s) => sum + s.completed_missions, 0)

      return {
        totalStudents,
        totalEcoPoints,
        totalLessons,
        totalMissions
      }
    },
    enabled: !!profile?.organization_code
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setEditedProfile({
        organization_name: profile.organization_name || "",
        display_name: profile.display_name || "",
        region_district: profile.region_district || "",
        region_state: profile.region_state || "",
        region_country: profile.region_country || "India"
      })
    }
  }, [profile, isEditing])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    updateProfile(editedProfile)
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your organization profile has been successfully updated.",
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile({
      organization_name: profile?.organization_name || "",
      display_name: profile?.display_name || "",
      region_district: profile?.region_district || "",
      region_state: profile?.region_state || "",
      region_country: profile?.region_country || "India"
    })
  }

  if (profile?.role !== 'organization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Organization role required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <EcoButton variant="outline" onClick={() => navigate('/dashboard')}>
              <X className="h-4 w-4" />
              Back
            </EcoButton>
            <h1 className="text-3xl font-bold text-foreground">Organization Profile</h1>
          </div>
          {!isEditing ? (
            <EcoButton onClick={handleEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </EcoButton>
          ) : (
            <div className="flex gap-2">
              <EcoButton onClick={handleSave} disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </EcoButton>
              <EcoButton variant="outline" onClick={handleCancel}>
                Cancel
              </EcoButton>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Information */}
          <div className="lg:col-span-2 space-y-6">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Organization Information
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input
                    id="organization_name"
                    value={isEditing ? editedProfile.organization_name : profile?.organization_name || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, organization_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={isEditing ? editedProfile.display_name : profile?.display_name || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <Label htmlFor="org_code">Organization Code</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="org_code"
                      value={profile?.organization_code || ""}
                      disabled
                      className="bg-muted flex-1"
                    />
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      Share with students
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Students use this code to join your organization
                  </p>
                </div>
              </EcoCardContent>
            </EcoCard>

            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="space-y-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={isEditing ? editedProfile.region_country : profile?.region_country || "India"}
                    onValueChange={(value) => setEditedProfile(prev => ({ ...prev, region_country: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={isEditing ? editedProfile.region_state : profile?.region_state || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, region_state: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your state"
                  />
                </div>

                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={isEditing ? editedProfile.region_district : profile?.region_district || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, region_district: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your district"
                  />
                </div>
              </EcoCardContent>
            </EcoCard>
          </div>

          {/* Stats & Achievements */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <StatsCard
                title="Eco Points"
                value={profile?.eco_points?.toString() || "0"}
                description="Organization total"
                icon={TrendingUp}
                variant="primary"
              />

              <StatsCard
                title="Total Students"
                value={orgStats?.totalStudents?.toString() || "0"}
                description="Enrolled students"
                icon={Users}
                variant="accent"
              />

              <StatsCard
                title="Student Eco Points"
                value={orgStats?.totalEcoPoints?.toString() || "0"}
                description="Combined student points"
                icon={Award}
                variant="success"
              />

              <StatsCard
                title="Lessons Completed"
                value={orgStats?.totalLessons?.toString() || "0"}
                description="By all students"
                icon={BookOpen}
                variant="warning"
              />

              <StatsCard
                title="Missions Completed"
                value={orgStats?.totalMissions?.toString() || "0"}
                description="By all students"
                icon={Target}
                variant="success"
              />
            </div>

            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Organization Level
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Level {profile?.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Organizations level up as students complete activities
                </div>
              </EcoCardContent>
            </EcoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
