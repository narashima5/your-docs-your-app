import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EcoButton } from "@/components/ui/eco-button"
import { Leaf, TreePine, Flower2, ArrowRight } from "lucide-react"

const Index = () => {
  const navigate = useNavigate()


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-primary/10">
          <TreePine className="h-32 w-32 leaf-sway" />
        </div>
        <div className="absolute top-20 right-20 text-accent/10">
          <Leaf className="h-24 w-24 leaf-sway" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-20 left-20 text-primary/10">
          <Flower2 className="h-28 w-28 leaf-sway" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute bottom-10 right-10 text-accent/10">
          <Leaf className="h-20 w-20 leaf-sway" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>

      <div className="text-center z-10 relative max-w-2xl mx-auto px-4">
        {/* Logo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 grow-in">
          <div className="p-3 sm:p-4 bg-primary/10 rounded-full">
            <Leaf className="h-10 w-10 sm:h-16 sm:w-16 text-primary leaf-sway" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GameGreenEco
          </h1>
        </div>

        {/* Tagline */}
        <div className="slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3 sm:mb-4">
            Empowering Environmental Education
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto">
            Join thousands of students learning about sustainability, climate action, 
            and environmental protection through interactive lessons and real-world missions.
          </p>
        </div>

        {/* Features */}
        <div className="slide-up grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8" style={{ animationDelay: "0.4s" }}>
          <div className="text-center p-4 sm:p-0">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2 sm:mb-3">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Interactive Lessons</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Learn through engaging content</p>
          </div>
          <div className="text-center p-4 sm:p-0">
            <div className="p-2 sm:p-3 bg-accent/10 rounded-full w-fit mx-auto mb-2 sm:mb-3">
              <TreePine className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Real Missions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Take action in your community</p>
          </div>
          <div className="text-center p-4 sm:p-0">
            <div className="p-2 sm:p-3 bg-eco-sun/10 rounded-full w-fit mx-auto mb-2 sm:mb-3">
              <Flower2 className="h-5 w-5 sm:h-6 sm:w-6 text-eco-sun" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Earn Rewards</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Get points and badges</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="slide-up flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center" style={{ animationDelay: "0.6s" }}>
          <EcoButton 
            variant="eco" 
            size="lg"
            onClick={() => navigate('/login')}
            className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </EcoButton>
          <EcoButton 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/signup')}
            className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
          >
            Join GameGreenEco
          </EcoButton>
        </div>

      </div>
    </div>
  );
};

export default Index;
