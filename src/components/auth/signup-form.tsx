import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Progress } from "@/components/ui/progress"
import { Leaf, User, Mail, Lock, School, MapPin, ArrowLeft, ArrowRight, UserCheck, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  school: string
  district: string
  state: string
  country: string
  role: string
  gender: string
}

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    district: "",
    state: "",
    country: "India",
    role: "student",
    gender: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        })
        return
      }
      
      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        })
        return
      }
      
      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      // Validate step 2 (educational details)
      if (!formData.school || !formData.district || !formData.state) {
        toast({
          title: "Missing Information",
          description: "Please fill in all educational details",
          variant: "destructive"
        })
        return
      }
      setCurrentStep(3)
      return
    }

    // Final submission (step 3)
    if (!formData.role || !formData.gender) {
      toast({
        title: "Missing Information", 
        description: "Please select your role and gender",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    const { error } = await signUp(formData.email, formData.password, {
      display_name: formData.fullName,
      role: formData.role,
      organization_name: formData.role === 'organization' ? formData.fullName : formData.school,
      region_district: formData.district,
      region_state: formData.state,
      region_country: formData.country,
      gender: formData.gender
    })
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      })
    } else {
      navigate('/login')
    }
    
    setIsLoading(false)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <EcoCard variant="elevated" className="w-full max-w-lg mx-auto">
      <EcoCardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Leaf className="h-8 w-8 text-primary leaf-sway" />
          </div>
        </div>
        <EcoCardTitle>Join GameGreenEco</EcoCardTitle>
        <EcoCardDescription>
          Start your journey toward environmental awareness
        </EcoCardDescription>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </EcoCardHeader>
      
      <EcoCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4 slide-up">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
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
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 slide-up">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Educational Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/College Name *</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school"
                    type="text"
                    placeholder="Enter your institution name"
                    value={formData.school}
                    onChange={(e) => handleChange("school", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="district"
                    type="text"
                    placeholder="Enter your district"
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 slide-up">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Role & Personal Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="organization">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Organization (School/College)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Male
                      </div>
                    </SelectItem>
                    <SelectItem value="female">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Female
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Other
                      </div>
                    </SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Prefer not to say
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <EcoButton
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </EcoButton>
            )}
            
            <EcoButton
              type="submit"
              variant="eco"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating Account..."
              ) : currentStep === totalSteps ? (
                "Create Account"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </EcoButton>
          </div>

          {currentStep === 1 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-primary font-medium hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </form>
      </EcoCardContent>
    </EcoCard>
  )
}