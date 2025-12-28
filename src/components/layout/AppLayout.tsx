import { ReactNode } from "react"
import { MobileBottomNav } from "./MobileBottomNav"

interface AppLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
}

export function AppLayout({ children, showBottomNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Main content with bottom padding for mobile nav */}
      <div className={showBottomNav ? "pb-16 md:pb-0" : ""}>
        {children}
      </div>
      
      {/* Mobile bottom navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}
