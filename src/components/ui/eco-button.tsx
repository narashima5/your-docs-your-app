import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ecoButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 card-shadow hover-shadow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        eco: "eco-gradient text-white hover:scale-105 transition-all duration-300 eco-shadow hover-shadow font-semibold",
        nature: "bg-eco-accent text-white hover:bg-eco-accent/90 hover:scale-105 transition-all duration-300",
        earth: "bg-eco-earth text-white hover:bg-eco-earth/90 transition-all duration-300",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 font-semibold",
        stats: "bg-gradient-to-br from-primary to-primary-light text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EcoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ecoButtonVariants> {
  asChild?: boolean
}

const EcoButton = React.forwardRef<HTMLButtonElement, EcoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(ecoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
EcoButton.displayName = "EcoButton"

export { EcoButton, ecoButtonVariants }