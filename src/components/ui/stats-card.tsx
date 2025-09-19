import * as React from "react"
import { LucideIcon } from "lucide-react"
import { EcoCard, EcoCardContent } from "./eco-card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  variant?: "default" | "primary" | "accent" | "success" | "warning"
  className?: string
}

const variantStyles = {
  default: "bg-gradient-to-br from-card to-muted",
  primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
  accent: "bg-gradient-to-br from-eco-accent/10 to-eco-accent/5 border-eco-accent/20",
  success: "bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-400/20",
  warning: "bg-gradient-to-br from-eco-sun/10 to-eco-sun/5 border-eco-sun/20",
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  variant = "default",
  className 
}: StatsCardProps) {
  return (
    <EcoCard 
      variant="interactive" 
      className={cn(
        "group transition-all duration-300 hover:scale-105",
        variantStyles[variant],
        className
      )}
    >
      <EcoCardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "ml-3 p-2 rounded-full transition-all duration-300",
              "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
              "group-hover:scale-110"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </EcoCardContent>
    </EcoCard>
  )
}