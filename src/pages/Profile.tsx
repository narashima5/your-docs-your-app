import { useState } from "react"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/contexts/AuthContext"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/ui/stats-card"
import { User, MapPin, Award, TrendingUp, BookOpen, Target, Edit3, Save, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  eco_points: number
  rank: number
}

export default function Profile() {
  const { user } = useAuth()
  const { profile, updateProfile, isUpdating } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    display_name: "",
    region_district: "",
    region_state: "",
    region_country: ""
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  // Get user's position in leaderboard
  const { data: userRank } = useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, eco_points')
        .order('eco_points', { ascending: false })

      if (error) throw error

      const userIndex = data.findIndex(entry => entry.user_id === user.id)
      return userIndex !== -1 ? userIndex + 1 : null
    },
    enabled: !!user,
  })

  // Initialize edit form when profile loads
  useState(() => {
    if (profile) {
      setEditedProfile({
        display_name: profile.display_name || "",
        region_district: profile.region_district || "",
        region_state: profile.region_state || "",
        region_country: profile.region_country || "India"
      })
    }
  })

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({
      display_name: profile?.display_name || "",
      region_district: profile?.region_district || "",
      region_state: profile?.region_state || "",
      region_country: profile?.region_country || "India"
    })
  }

  const handleSave = () => {
    updateProfile(editedProfile)
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile({
      display_name: profile?.display_name || "",
      region_district: profile?.region_district || "",
      region_state: profile?.region_state || "",
      region_country: profile?.region_country || "India"
    })
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
            <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
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
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={isEditing ? editedProfile.display_name : profile?.display_name || ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your display name"
                  />
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
                description="Total points earned"
                icon={TrendingUp}
                variant="primary"
              />
              
              <StatsCard
                title="Lessons Completed"
                value={profile?.completed_lessons?.toString() || "0"}
                description="Learning progress"
                icon={BookOpen}
                variant="accent"
              />
              
              <StatsCard
                title="Missions Done"
                value={profile?.completed_missions?.toString() || "0"}
                description="Actions taken"
                icon={Target}
                variant="success"
              />
              
              <StatsCard
                title="Leaderboard Position"
                value={userRank ? `#${userRank}` : "Not ranked"}
                description="Your ranking"
                icon={Award}
                variant="warning"
              />
            </div>

            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Level & Badges
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Level {profile?.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Badges Earned</span>
                    <Badge variant="outline">{profile?.badges?.length || 0}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Keep completing lessons to earn more badges!
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Streak Days</span>
                    <Badge variant="outline">{profile?.streak_days || 0}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Daily activity streak
                  </div>
                </div>
              </EcoCardContent>
            </EcoCard>
          </div>
        </div>
      </div>
    </div>
  )
}