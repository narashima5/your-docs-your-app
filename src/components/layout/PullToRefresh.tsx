import { useState, useRef, useCallback, ReactNode } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)
  
  const threshold = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance to pull
      const resistance = 0.4
      setPullDistance(Math.min(diff * resistance, threshold * 1.5))
    }
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold / 2)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div 
      ref={containerRef}
      className="min-h-screen overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "flex items-center justify-center transition-all duration-200 overflow-hidden",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ height: pullDistance }}
      >
        <div 
          className={cn(
            "flex items-center gap-2 text-primary",
            isRefreshing && "animate-pulse"
          )}
        >
          <RefreshCw 
            className={cn(
              "h-5 w-5 transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)` 
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? "Refreshing..." 
              : progress >= 1 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </div>
      </div>
      
      {children}
    </div>
  )
}
