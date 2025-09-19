import { Link } from "react-router-dom"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { BookOpen, Target, ArrowRight } from "lucide-react"

export function NavigationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <EcoCard variant="interactive" className="group">
        <EcoCardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <BookOpen className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
            <div>
              <EcoCardTitle className="text-xl">Lessons</EcoCardTitle>
              <EcoCardDescription>
                Explore environmental topics and expand your knowledge
              </EcoCardDescription>
            </div>
          </div>
        </EcoCardHeader>
        
        <EcoCardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Access interactive lessons on climate change, conservation, renewable energy, 
            and sustainable practices. Each lesson includes engaging content and knowledge assessments.
          </p>
          
          <Link to="/lessons">
            <EcoButton variant="eco" className="w-full group-hover:scale-105 transition-transform">
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </EcoButton>
          </Link>
        </EcoCardContent>
      </EcoCard>

      <EcoCard variant="interactive" className="group">
        <EcoCardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-eco-accent/10 group-hover:bg-eco-accent group-hover:text-white transition-colors duration-300">
              <Target className="h-6 w-6 text-eco-accent group-hover:text-white" />
            </div>
            <div>
              <EcoCardTitle className="text-xl">Missions</EcoCardTitle>
              <EcoCardDescription>
                Complete real-world environmental tasks and earn rewards
              </EcoCardDescription>
            </div>
          </div>
        </EcoCardHeader>
        
        <EcoCardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Take action with hands-on environmental missions. Plant trees, reduce waste, 
            conserve energy, and document your impact to earn eco-points and badges.
          </p>
          
          <Link to="/missions">
            <EcoButton variant="nature" className="w-full group-hover:scale-105 transition-transform">
              View Missions
              <ArrowRight className="h-4 w-4 ml-2" />
            </EcoButton>
          </Link>
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}