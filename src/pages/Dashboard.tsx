import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"
import { ContinueLearning } from "@/components/dashboard/ContinueLearning"
import { OrganizationDashboard } from "@/components/dashboard/OrganizationDashboard"
import { useProfile } from "@/hooks/useProfile"
import { AppLayout } from "@/components/layout/AppLayout"
import { PullToRefresh } from "@/components/layout/PullToRefresh"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export default function Dashboard() {
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(async () => {
    // Invalidate all relevant queries to refresh data
    await queryClient.invalidateQueries({ queryKey: ['profile'] })
    await queryClient.invalidateQueries({ queryKey: ['lessons'] })
    await queryClient.invalidateQueries({ queryKey: ['missions'] })
    await queryClient.invalidateQueries({ queryKey: ['lesson-progress'] })
    // Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [queryClient])

  // Show organization dashboard for organization users
  if (profile?.role === 'organization') {
    return (
      <AppLayout>
        <OrganizationDashboard />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* User Header */}
            <UserHeader />
            
            {/* Dashboard Stats */}
            <DashboardStats />
            
            {/* Continue Learning */}
            <ContinueLearning />
            
            {/* Navigation Cards */}
            <NavigationCards />
          </div>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}
