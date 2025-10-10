import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, CheckCircle, Upload, UserPlus, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  activity_type: string
  activity_message: string
  created_at: string
  organization_code: string
  user_id: string
  metadata?: any
}

interface RecentActivityProps {
  organizationName: string
}

export function RecentActivity({ organizationName }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['recent-activity', organizationName],
    queryFn: async () => {
      // Since activity_log table uses organization_code, we need to skip this for now
      // Organizations are identified by organization_name in profiles
      // This would require a database migration to add organization_code column or change activity_log structure
      return []
    },
    enabled: !!organizationName,
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'joined':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'lesson_completed':
        return <BookOpen className="h-4 w-4 text-green-500" />
      case 'mission_submitted':
        return <Upload className="h-4 w-4 text-yellow-500" />
      case 'mission_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'mission_rejected':
        return <Activity className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <EcoCard>
      <EcoCardHeader>
        <EcoCardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </EcoCardTitle>
      </EcoCardHeader>
      <EcoCardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.activity_message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </EcoCardContent>
    </EcoCard>
  )
}
