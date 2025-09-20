import { useQuery } from "@tanstack/react-query"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Award, X, Calendar } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface UserBadge {
  id: string
  badge: {
    id: string
    name: string
    description: string
    image_url: string
    category: string
  }
  earned_at: string
}

interface BadgesListProps {
  onClose: () => void
}

export function BadgesList({ onClose }: BadgesListProps) {
  const { user } = useAuth()

  const { data: badges, isLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badge:badges (
            id,
            name,
            description,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data as UserBadge[]
    },
    enabled: !!user,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <EcoCard className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <EcoCardHeader>
          <div className="flex items-center justify-between">
            <EcoCardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Badges ({badges?.length || 0})
            </EcoCardTitle>
            <EcoButton variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </EcoButton>
          </div>
        </EcoCardHeader>

        <EcoCardContent className="overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <div className="w-16 h-16 bg-muted-foreground/20 rounded-full mx-auto"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mx-auto"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : badges?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((userBadge) => (
                <EcoCard key={userBadge.id} variant="interactive" className="group">
                  <EcoCardContent className="p-6 text-center space-y-4">
                    {/* Badge Image Placeholder */}
                    <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Award className="h-8 w-8 text-primary" />
                      
                      {/* Glow effect for special badges */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{userBadge.badge.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userBadge.badge.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {userBadge.badge.category}
                      </Badge>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Earned {formatDate(userBadge.earned_at)}
                      </div>
                    </div>
                  </EcoCardContent>
                </EcoCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No badges yet</h3>
              <p className="text-muted-foreground">
                Complete lessons to earn your first badges!
              </p>
            </div>
          )}
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}