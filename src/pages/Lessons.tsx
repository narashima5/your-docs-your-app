import { useState, useEffect } from "react"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, ArrowLeft, Play, RotateCcw, CheckCircle, Loader, Target, Lock } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { useLessons } from "@/hooks/useLessons"
import { VideoPlayer } from "@/components/lessons/VideoPlayer"
import { QuizTask } from "@/components/lessons/QuizTask"
import { LessonStartModal } from "@/components/lessons/LessonStartModal"
import { useLessonMissions } from "@/hooks/useLessonMissions"

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-500/10 text-green-700 border-green-500/20"
    case "Intermediate": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
    case "Advanced": return "bg-red-500/10 text-red-700 border-red-500/20"
    default: return "bg-gray-500/10 text-gray-700 border-gray-500/20"
  }
}

export default function Lessons() {
  const [searchParams] = useSearchParams()
  const { lessons, isLoading, updateProgress, isUpdatingProgress } = useLessons()
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isReplay, setIsReplay] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showMissions, setShowMissions] = useState(false)
  const { missions } = useLessonMissions(selectedLesson?.id)

  // Check for lesson and replay parameters
  useEffect(() => {
    const lessonId = searchParams.get('lesson')
    const replay = searchParams.get('replay')
    
    if (lessonId && lessons) {
      const lesson = lessons.find(l => l.id === lessonId)
      if (lesson) {
        setSelectedLesson(lesson)
        setIsReplay(replay === 'true')
        if (replay === 'true') {
          // Show lesson page with retake option instead of automatically starting video
          return
        }
      }
    }
  }, [searchParams, lessons])

  const getActionButton = (lesson: any) => {
    const handleAction = () => {
      if (lesson.status === "not_started") {
        // Start lesson - show lesson modal
        setSelectedLesson(lesson)
        setShowLessonModal(true)
      } else if (lesson.status === "in_progress") {
        // Continue lesson - show lesson modal
        setSelectedLesson(lesson)
        setShowLessonModal(true)
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
            Continue Lesson
          </EcoButton>
        )
      case "completed":
        return (
          <EcoButton 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSelectedLesson(lesson)
              setIsReplay(true)
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Replay
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

        {/* Replay Lesson Page */}
        {isReplay && selectedLesson && !showVideo && !showQuiz && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <EcoCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <EcoCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <EcoCardTitle className="text-2xl mb-2">{selectedLesson.title}</EcoCardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getDifficultyColor(selectedLesson.difficulty)}>
                        {selectedLesson.difficulty}
                      </Badge>
                      <Badge variant="outline">{selectedLesson.category}</Badge>
                    </div>
                  </div>
                  <EcoButton 
                    variant="outline" 
                    onClick={() => {
                      setIsReplay(false)
                      setSelectedLesson(null)
                      window.history.replaceState({}, '', '/lessons')
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Lessons
                  </EcoButton>
                </div>
              </EcoCardHeader>

              <EcoCardContent className="space-y-6">
                <p className="text-muted-foreground">{selectedLesson.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EcoCard>
                    <EcoCardContent className="p-4">
                      <h3 className="font-semibold mb-3">Lesson Content</h3>
                      <div className="space-y-3">
                        <EcoButton 
                          className="w-full"
                          onClick={() => {
                            setShowVideo(true)
                            setIsReplay(false)
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Retake Lesson
                        </EcoButton>
                        <div className="text-sm text-muted-foreground">
                          Duration: {selectedLesson.duration_minutes} minutes
                        </div>
                      </div>
                    </EcoCardContent>
                  </EcoCard>

                  <EcoCard>
                    <EcoCardContent className="p-4">
                      <h3 className="font-semibold mb-3">Quiz & Tasks</h3>
                      <div className="space-y-3">
                        <EcoButton 
                          variant="outline"
                          className="w-full" 
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Quiz Completed (25 pts)
                        </EcoButton>
                        <div className="text-sm text-muted-foreground">
                          Quiz already completed with full points
                        </div>
                      </div>
                    </EcoCardContent>
                  </EcoCard>
                </div>

                <EcoCard>
                  <EcoCardContent className="p-4">
                    <h3 className="font-semibold mb-3">Associated Tasks</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Understanding Climate Change</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Environmental Impact Assessment</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                    </div>
                  </EcoCardContent>
                </EcoCard>
              </EcoCardContent>
            </EcoCard>
          </div>
        )}
      </div>

      {/* Video Player */}
      {showVideo && selectedLesson && (
        <VideoPlayer
          lesson={selectedLesson}
          onProgressUpdate={(progress) => {
            updateProgress({ 
              lessonId: selectedLesson.id, 
              progressPercentage: progress 
            })
          }}
          onComplete={() => {
            setShowVideo(false)
            setShowQuiz(true)
          }}
          onClose={() => {
            setShowVideo(false)
            setSelectedLesson(null)
          }}
        />
      )}

      {/* Quiz/Task */}
      {showQuiz && selectedLesson && (
        <QuizTask
          lesson={selectedLesson}
          onComplete={() => {
            updateProgress({ 
              lessonId: selectedLesson.id, 
              progressPercentage: 100, 
              isCompleted: true 
            })
            setShowQuiz(false)
            // Show missions if available
            if (missions?.length > 0) {
              setShowMissions(true)
            } else {
              setSelectedLesson(null)
            }
          }}
          onClose={() => {
            setShowQuiz(false)
            setSelectedLesson(null)
          }}
        />
      )}

      {/* Lesson Start Modal */}
      {showLessonModal && selectedLesson && (
        <LessonStartModal
          lesson={selectedLesson}
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false)
            setSelectedLesson(null)
          }}
          onStartVideo={() => {
            setShowLessonModal(false)
            setShowVideo(true)
            if (selectedLesson.status === "not_started") {
              updateProgress({ lessonId: selectedLesson.id, progressPercentage: 10 })
            }
          }}
          onStartQuiz={() => {
            setShowLessonModal(false)
            setShowQuiz(true)
          }}
          lessonProgress={selectedLesson.progress}
        />
      )}

      {/* Missions Modal */}
      {showMissions && selectedLesson && missions?.length > 0 && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <EcoCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EcoCardHeader>
              <EcoCardTitle className="text-2xl mb-2">Congratulations! 🎉</EcoCardTitle>
              <EcoCardDescription>
                You've completed the lesson "{selectedLesson.title}". Now you can tackle these real-world missions to apply what you've learned!
              </EcoCardDescription>
            </EcoCardHeader>

            <EcoCardContent className="space-y-4">
              <div className="grid gap-4">
                {missions.map((mission) => (
                  <EcoCard key={mission.id} className="border border-border/50">
                    <EcoCardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{mission.title}</h3>
                            <Badge variant="outline">{mission.points} points</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {mission.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Difficulty: {mission.difficulty}</span>
                            <span>Category: {mission.category}</span>
                            <span>Time: {mission.estimated_time}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Link to={`/missions?mission=${mission.id}`}>
                            <EcoButton size="sm">
                              Start Mission
                            </EcoButton>
                          </Link>
                          {mission.status !== 'not_started' && (
                            <Badge className={
                              mission.status === 'approved' ? 'bg-green-100 text-green-700' :
                              mission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              mission.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {mission.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </EcoCardContent>
                  </EcoCard>
                ))}
              </div>
              
              <div className="flex justify-center pt-4">
                <EcoButton 
                  variant="outline" 
                  onClick={() => {
                    setShowMissions(false)
                    setSelectedLesson(null)
                  }}
                >
                  Continue Learning
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        </div>
      )}
    </div>
  )
}