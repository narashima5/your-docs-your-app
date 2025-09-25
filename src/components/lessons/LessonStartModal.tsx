import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EcoButton } from "@/components/ui/eco-button"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, Target, Clock, BookOpen, Lock } from "lucide-react"

interface LessonStartModalProps {
  lesson: any
  isOpen: boolean
  onClose: () => void
  onStartVideo: () => void
  onStartQuiz: () => void
  lessonProgress: any
}

export function LessonStartModal({ lesson, isOpen, onClose, onStartVideo, onStartQuiz, lessonProgress }: LessonStartModalProps) {
  const isLessonCompleted = lessonProgress?.is_completed || false
  const lessonProgressPercent = lessonProgress?.progress_percentage || 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {lesson.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Info */}
          <div className="space-y-4">
            <p className="text-muted-foreground">{lesson.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getDifficultyColor(lesson.difficulty)}>
                {lesson.difficulty}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.duration_minutes} min
              </Badge>
              <Badge variant="outline">
                {lesson.category}
              </Badge>
            </div>

            {lessonProgressPercent > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-muted-foreground">{lessonProgressPercent}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lessonProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lesson Components */}
          <div className="grid gap-4">
            {/* Video Lesson */}
            <EcoCard>
              <EcoCardHeader className="pb-3">
                <EcoCardTitle className="flex items-center gap-2 text-lg">
                  <Play className="h-5 w-5" />
                  Video Lesson
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Watch the interactive video content to learn about {lesson.category.toLowerCase()}.
                </p>
                <EcoButton onClick={onStartVideo} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {lessonProgressPercent > 0 ? 'Continue Video' : 'Start Video'}
                </EcoButton>
              </EcoCardContent>
            </EcoCard>

            {/* Quiz */}
            <EcoCard>
              <EcoCardHeader className="pb-3">
                <EcoCardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Knowledge Quiz
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Test your understanding with interactive questions.
                </p>
                <EcoButton 
                  onClick={onStartQuiz}
                  disabled={!isLessonCompleted}
                  variant={!isLessonCompleted ? "outline" : "default"}
                  className="w-full"
                >
                  {!isLessonCompleted ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Video First
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Start Quiz
                    </>
                  )}
                </EcoButton>
              </EcoCardContent>
            </EcoCard>

            {/* Mission */}
            <EcoCard>
              <EcoCardHeader className="pb-3">
                <EcoCardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Real-World Mission
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Apply your knowledge with hands-on environmental actions.
                </p>
                <EcoButton 
                  disabled={!isLessonCompleted}
                  variant={!isLessonCompleted ? "outline" : "default"}
                  className="w-full"
                  onClick={() => {
                    onClose()
                    // Navigate to missions page - you'll need to implement this
                  }}
                >
                  {!isLessonCompleted ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Video First
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      View Missions
                    </>
                  )}
                </EcoButton>
              </EcoCardContent>
            </EcoCard>
          </div>

          <div className="flex gap-3 pt-4">
            <EcoButton variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </EcoButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}