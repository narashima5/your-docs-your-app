import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ecoCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "card-shadow hover-shadow",
        gradient: "bg-gradient-to-br from-card to-muted card-shadow hover-shadow",
        eco: "eco-gradient text-white shadow-lg hover:shadow-xl",
        stats: "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 card-shadow hover-shadow",
        nature: "bg-gradient-to-br from-eco-accent/10 to-eco-sky/10 border-eco-accent/30",
        elevated: "shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        interactive: "cursor-pointer card-shadow hover-shadow hover:scale-[1.02] hover:border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const EcoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof ecoCardVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(ecoCardVariants({ variant }), className)}
    {...props}
  />
))
EcoCard.displayName = "EcoCard"

const EcoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
EcoCardHeader.displayName = "EcoCardHeader"

const EcoCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
EcoCardTitle.displayName = "EcoCardTitle"

const EcoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EcoCardDescription.displayName = "EcoCardDescription"

const EcoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EcoCardContent.displayName = "EcoCardContent"

const EcoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EcoCardFooter.displayName = "EcoCardFooter"

export { 
  EcoCard, 
  EcoCardHeader, 
  EcoCardFooter, 
  EcoCardTitle, 
  EcoCardDescription, 
  EcoCardContent,
  ecoCardVariants 
}