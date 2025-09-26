import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Leaf, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(formData.email, formData.password)

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your email and password",
        variant: "destructive"
      })
    } else {
      navigate('/dashboard', { replace: true })
    }

    setIsLoading(false)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <EcoCard variant="elevated" className="w-full max-w-md mx-auto">
      <EcoCardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Leaf className="h-8 w-8 text-primary leaf-sway" />
          </div>
        </div>
        <EcoCardTitle>Welcome Back</EcoCardTitle>
        <EcoCardDescription>
          Sign in to continue your environmental learning journey
        </EcoCardDescription>
      </EcoCardHeader>
      
      <EcoCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember"
              checked={formData.remember}
              onCheckedChange={(checked) => handleChange("remember", !!checked)}
            />
            <Label htmlFor="remember" className="text-sm">Remember me</Label>
          </div>

          <EcoButton
            type="submit"
            variant="eco"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </EcoButton>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-primary font-medium hover:underline transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </EcoCardContent>
    </EcoCard>
  )
}