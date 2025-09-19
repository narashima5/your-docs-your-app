import { UserHeader } from "@/components/dashboard/user-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { NavigationCards } from "@/components/dashboard/navigation-cards"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* User Header */}
        <UserHeader />
        
        {/* Dashboard Stats */}
        <DashboardStats />
        
        {/* Navigation Cards */}
        <NavigationCards />
      </div>
    </div>
  )
}