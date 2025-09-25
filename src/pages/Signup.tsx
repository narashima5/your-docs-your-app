import { SignupForm } from "@/components/auth/signup-form"
import { Leaf, TreePine, Flower2 } from "lucide-react"

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-primary/10">
          <TreePine className="h-28 w-28" />
        </div>
        <div className="absolute top-32 right-16 text-accent/10">
          <Leaf className="h-20 w-20 leaf-sway" />
        </div>
        <div className="absolute bottom-32 left-16 text-primary/10">
          <Flower2 className="h-24 w-24 leaf-sway" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-10 right-10 text-accent/10">
          <Leaf className="h-18 w-18 leaf-sway" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute top-1/2 left-4 text-primary/5">
          <TreePine className="h-16 w-16" />
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Leaf className="h-8 w-8 text-primary leaf-sway" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GameGreenEco
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Join the Environmental Learning Revolution
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  )
}