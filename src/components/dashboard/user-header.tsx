import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { Settings, LogOut, Trophy, Flame } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"

export function UserHeader() {
  const { user, signOut } = useAuth()
  const { profile, isLoading } = useProfile()

  if (isLoading || !user || !profile) {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
            {profile.display_name?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">
              {profile.display_name || user.email?.split('@')[0] || 'Eco Learner'}
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Level {profile.level}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-accent" />
              <span>{profile.eco_points.toLocaleString()} Eco Points</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{profile.streak_days} day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <EcoButton variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </EcoButton>
        <EcoButton variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </EcoButton>
      </div>
    </div>
  )
}