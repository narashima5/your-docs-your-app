import { useState } from "react"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { StatsCard } from "@/components/ui/stats-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, Target, Coins, Award, CheckCircle, Clock, Camera } from "lucide-react"
import { Link } from "react-router-dom"

// Mock missions data
const mockMissions = [
  {
    id: 1,
    title: "Plant a Tree",
    description: "Plant a native tree species in your locality and document its growth.",
    instructions: "1. Choose appropriate location\n2. Dig proper sized hole\n3. Plant and water\n4. Take before/after photos",
    points: 150,
    difficulty: "Beginner",
    category: "Conservation",
    estimatedTime: "2 hours",
    status: "available"
  },
  {
    id: 2,
    title: "Plastic-Free Day Challenge",
    description: "Go an entire day without using any single-use plastic items.",
    instructions: "1. Plan plastic alternatives\n2. Document your day\n3. Share your experience\n4. Calculate plastic saved",
    points: 100,
    difficulty: "Intermediate",
    category: "Waste Reduction",
    estimatedTime: "1 day",
    status: "available"
  },
  {
    id: 3,
    title: "Community Clean-up Drive",
    description: "Organize or participate in a local community cleaning activity.",
    instructions: "1. Gather volunteers\n2. Collect cleaning supplies\n3. Clean designated area\n4. Properly dispose waste",
    points: 200,
    difficulty: "Intermediate",
    category: "Community Action",
    estimatedTime: "3 hours",
    status: "completed"
  },
  {
    id: 4,
    title: "Energy Audit at Home",
    description: "Conduct a comprehensive energy audit and implement conservation measures.",
    instructions: "1. Check all appliances\n2. Measure energy consumption\n3. Identify inefficiencies\n4. Implement solutions",
    points: 120,
    difficulty: "Advanced",
    category: "Energy Conservation",
    estimatedTime: "4 hours",
    status: "in_progress"
  },
  {
    id: 5,
    title: "Rain Water Harvesting Setup",
    description: "Install a basic rainwater collection system for your home or school.",
    instructions: "1. Design collection system\n2. Install gutters/pipes\n3. Set up storage tank\n4. Test and document",
    points: 250,
    difficulty: "Advanced",
    category: "Water Conservation",
    estimatedTime: "1 day",
    status: "available"
  },
  {
    id: 6,
    title: "Organic Composting Project",
    description: "Start a composting system using kitchen waste and garden materials.",
    instructions: "1. Set up compost bin\n2. Collect organic waste\n3. Maintain proper ratios\n4. Monitor decomposition",
    points: 180,
    difficulty: "Beginner",
    category: "Waste Management",
    estimatedTime: "30 minutes daily",
    status: "available"
  }
]

const mockStats = {
  totalTasks: 45,
  completedTasks: 12,
  ecoPoints: 2450,
  badgesEarned: 15
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-500/10 text-green-700 border-green-500/20"
    case "Intermediate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
    case "Advanced": return "bg-red-500/10 text-red-700 border-red-500/20"
    default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500/10 text-green-700 border-green-500/20"
    case "in_progress": return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    case "available": return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

const getActionButton = (mission: any) => {
  switch (mission.status) {
    case "available":
      return (
        <EcoButton variant="eco" className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Start Mission
        </EcoButton>
      )
    case "in_progress":
      return (
        <EcoButton variant="nature" className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Submit Proof
        </EcoButton>
      )
    case "completed":
      return (
        <EcoButton variant="outline" className="w-full" disabled>
          <CheckCircle className="h-4 w-4 mr-2" />
          Completed
        </EcoButton>
      )
    default:
      return null
  }
}

export default function Missions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const categories = ["all", ...Array.from(new Set(mockMissions.map(m => m.category)))]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredMissions = mockMissions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || mission.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || mission.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <EcoButton variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </EcoButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Environmental Missions</h1>
              <p className="text-muted-foreground mt-1">Take action and make a real-world impact</p>
            </div>
          </div>
        </div>

        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Tasks"
            value={mockStats.totalTasks}
            icon={Target}
            variant="primary"
          />
          <StatsCard
            title="Completed Tasks"
            value={mockStats.completedTasks}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Eco-Points Earned"
            value={mockStats.ecoPoints}
            icon={Coins}
            variant="accent"
          />
          <StatsCard
            title="Badges Earned"
            value={mockStats.badgesEarned}
            icon={Award}
            variant="warning"
          />
        </div>

        {/* Filters */}
        <EcoCard className="mb-6">
          <EcoCardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search missions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === "all" ? "All Levels" : difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((mission) => (
            <EcoCard key={mission.id} variant="interactive" className="group">
              <EcoCardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {mission.difficulty}
                    </Badge>
                    <Badge className={getStatusColor(mission.status)}>
                      {mission.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-eco-accent font-semibold">
                    <Coins className="h-4 w-4" />
                    <span>{mission.points}</span>
                  </div>
                </div>
                
                <EcoCardTitle className="text-lg line-clamp-2 mb-2">
                  {mission.title}
                </EcoCardTitle>
                
                <EcoCardDescription className="line-clamp-2">
                  {mission.description}
                </EcoCardDescription>
              </EcoCardHeader>

              <EcoCardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{mission.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duration:
                    </span>
                    <span className="font-medium">{mission.estimatedTime}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium mb-1">Instructions:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {mission.instructions.split('\n').slice(0, 2).map((step, i) => (
                      <div key={i}>{step}</div>
                    ))}
                    {mission.instructions.split('\n').length > 2 && (
                      <div className="text-primary">+ more steps...</div>
                    )}
                  </div>
                </div>

                {getActionButton(mission)}
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No missions found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}