import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, ArrowLeft, Play, RotateCcw, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

// Mock lessons data
const mockLessons = [
  {
    id: 1,
    title: "Climate Change Fundamentals",
    description: "Understanding the science behind global warming and its impacts on our planet.",
    difficulty: "Beginner",
    duration: 45,
    progress: 0,
    category: "Climate Change",
    thumbnail: "/api/placeholder/300/200",
    status: "not_started"
  },
  {
    id: 2,
    title: "Water Conservation Strategies",
    description: "Learn practical methods to conserve water in daily life and communities.",
    difficulty: "Beginner",
    duration: 30,
    progress: 65,
    category: "Water Conservation",
    thumbnail: "/api/placeholder/300/200",
    status: "in_progress"
  },
  {
    id: 3,
    title: "Renewable Energy Sources",
    description: "Explore solar, wind, and other renewable energy technologies.",
    difficulty: "Intermediate",
    duration: 60,
    progress: 100,
    category: "Energy",
    thumbnail: "/api/placeholder/300/200",
    status: "completed"
  },
  {
    id: 4,
    title: "Sustainable Agriculture",
    description: "Modern farming techniques that protect the environment.",
    difficulty: "Advanced",
    duration: 75,
    progress: 0,
    category: "Agriculture",
    thumbnail: "/api/placeholder/300/200",
    status: "not_started"
  },
  {
    id: 5,
    title: "Plastic Pollution Solutions",
    description: "Understanding plastic waste and innovative solutions to reduce it.",
    difficulty: "Intermediate",
    duration: 40,
    progress: 25,
    category: "Waste Management",
    thumbnail: "/api/placeholder/300/200",
    status: "in_progress"
  },
  {
    id: 6,
    title: "Biodiversity Conservation",
    description: "Protecting ecosystems and endangered species around the world.",
    difficulty: "Intermediate",
    duration: 50,
    progress: 100,
    category: "Conservation",
    thumbnail: "/api/placeholder/300/200",
    status: "completed"
  }
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-500/10 text-green-700 border-green-500/20"
    case "Intermediate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
    case "Advanced": return "bg-red-500/10 text-red-700 border-red-500/20"
    default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

const getActionButton = (lesson: any) => {
  switch (lesson.status) {
    case "not_started":
      return (
        <EcoButton variant="eco" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Start Lesson
        </EcoButton>
      )
    case "in_progress":
      return (
        <EcoButton variant="nature" className="w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          Resume
        </EcoButton>
      )
    case "completed":
      return (
        <EcoButton variant="outline" className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Review
        </EcoButton>
      )
    default:
      return null
  }
}

export default function Lessons() {
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
              <h1 className="text-3xl font-bold text-foreground">Environmental Lessons</h1>
              <p className="text-muted-foreground mt-1">Expand your knowledge with interactive learning</p>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLessons.map((lesson) => (
            <EcoCard key={lesson.id} variant="interactive" className="group">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
                {lesson.status === "completed" && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <EcoCardHeader className="pb-2">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(lesson.difficulty)}>
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {lesson.category}
                  </Badge>
                </div>
                
                <EcoCardTitle className="text-lg line-clamp-2">
                  {lesson.title}
                </EcoCardTitle>
                
                <EcoCardDescription className="line-clamp-2">
                  {lesson.description}
                </EcoCardDescription>
              </EcoCardHeader>

              <EcoCardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration} minutes</span>
                </div>

                {lesson.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                  </div>
                )}

                {getActionButton(lesson)}
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </div>
    </div>
  )
}