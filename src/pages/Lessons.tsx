import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, ArrowLeft, Play, RotateCcw, CheckCircle, Loader } from "lucide-react"
import { Link } from "react-router-dom"
import { useLessons } from "@/hooks/useLessons"

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-500/10 text-green-700 border-green-500/20"
    case "Intermediate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
    case "Advanced": return "bg-red-500/10 text-red-700 border-red-500/20"
    default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

export default function Lessons() {
  const { lessons, isLoading, updateProgress, isUpdatingProgress } = useLessons()

  const getActionButton = (lesson: any) => {
    const handleAction = () => {
      if (lesson.status === "not_started") {
        // Start lesson - set 10% progress
        updateProgress({ lessonId: lesson.id, progressPercentage: 10 })
      } else if (lesson.status === "in_progress") {
        // Complete lesson - set 100% progress
        updateProgress({ lessonId: lesson.id, progressPercentage: 100, isCompleted: true })
      }
    }

    switch (lesson.status) {
      case "not_started":
        return (
          <EcoButton 
            variant="eco" 
            className="w-full" 
            onClick={handleAction}
            disabled={isUpdatingProgress}
          >
            {isUpdatingProgress ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Start Lesson
          </EcoButton>
        )
      case "in_progress":
        return (
          <EcoButton 
            variant="nature" 
            className="w-full"
            onClick={handleAction}
            disabled={isUpdatingProgress}
          >
            {isUpdatingProgress ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
            Complete Lesson
          </EcoButton>
        )
      case "completed":
        return (
          <EcoButton variant="outline" className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </EcoButton>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    )
  }
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
          {lessons?.map((lesson) => (
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
                  <span>{lesson.duration_minutes} minutes</span>
                </div>

                {lesson.progress && lesson.progress.progress_percentage > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{lesson.progress.progress_percentage}%</span>
                    </div>
                    <Progress value={lesson.progress.progress_percentage} className="h-2" />
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