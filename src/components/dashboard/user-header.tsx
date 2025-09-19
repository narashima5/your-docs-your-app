import { useState } from "react"
import { EcoButton } from "@/components/ui/eco-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock user data - in real app this would come from API/context
const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  school: "Green Valley High School",
  location: "Mumbai, Maharashtra, India",
  avatar: ""
}

export function UserHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Logged out successfully",
      description: "Thank you for learning with EcoLearn! 🌱",
    })
    
    setIsLoggingOut(false)
    // Redirect to login would happen here
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10 mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {getInitials(mockUser.name)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {mockUser.name.split(' ')[0]}! 👋
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{mockUser.school}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{mockUser.location}</span>
            </div>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EcoButton variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Account
          </EcoButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}