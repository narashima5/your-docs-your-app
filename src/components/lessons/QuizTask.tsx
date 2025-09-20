import { useState } from "react"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, X } from "lucide-react"

interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizTaskProps {
  lesson: {
    id: string
    title: string
  }
  onComplete: () => void
  onClose: () => void
}

export function QuizTask({ lesson, onComplete, onClose }: QuizTaskProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)

  // Sample quiz data - in real app, this would come from lesson content
  const quizzes: Quiz[] = [
    {
      id: "1",
      question: "What is the main cause of climate change?",
      options: [
        "Natural solar variations",
        "Human activities and greenhouse gas emissions",
        "Ocean currents",
        "Volcanic eruptions"
      ],
      correctAnswer: 1
    },
    {
      id: "2", 
      question: "Which renewable energy source is most widely used globally?",
      options: [
        "Solar power",
        "Wind power", 
        "Hydroelectric power",
        "Geothermal power"
      ],
      correctAnswer: 2
    },
    {
      id: "3",
      question: "What percentage of global greenhouse gas emissions come from agriculture?",
      options: [
        "10-15%",
        "20-25%",
        "30-35%",
        "40-45%"
      ],
      correctAnswer: 1
    }
  ]

  const currentQuiz = quizzes[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quizzes.length - 1

  const handleAnswerSubmit = () => {
    const selectedIndex = parseInt(selectedAnswer)
    const correct = selectedIndex === currentQuiz.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz completed
      if (score >= Math.ceil(quizzes.length * 0.7)) { // 70% passing score
        onComplete()
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setShowResult(false)
    }
  }

  const finalScore = Math.round((score / quizzes.length) * 100)

  if (isLastQuestion && showResult) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <EcoCard className="w-full max-w-2xl">
          <EcoCardHeader>
            <div className="flex items-center justify-between">
              <EcoCardTitle>Quiz Complete!</EcoCardTitle>
              <EcoButton variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </EcoButton>
            </div>
          </EcoCardHeader>
          <EcoCardContent className="text-center space-y-6">
            <div className="space-y-2">
              <div className="text-6xl font-bold text-primary">{finalScore}%</div>
              <p className="text-muted-foreground">Your Score</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg">
                You got {score} out of {quizzes.length} questions correct!
              </p>
              {finalScore >= 70 ? (
                <p className="text-green-600 font-medium">
                  🎉 Congratulations! You passed the quiz!
                </p>
              ) : (
                <p className="text-orange-600 font-medium">
                  Keep learning! You can retake this quiz anytime.
                </p>
              )}
            </div>
            
            <EcoButton 
              variant="eco" 
              onClick={finalScore >= 70 ? onComplete : onClose}
              className="w-full"
            >
              {finalScore >= 70 ? "Complete Lesson" : "Close"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <EcoCard className="w-full max-w-2xl">
        <EcoCardHeader>
          <div className="flex items-center justify-between">
            <EcoCardTitle>
              Question {currentQuestionIndex + 1} of {quizzes.length}
            </EcoCardTitle>
            <EcoButton variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </EcoButton>
          </div>
        </EcoCardHeader>
        
        <EcoCardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuiz.question}</h3>
            
            {!showResult ? (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {currentQuiz.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {currentQuiz.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md border ${
                      index === currentQuiz.correctAnswer
                        ? "bg-green-500/10 border-green-500/20 text-green-700"
                        : index === parseInt(selectedAnswer)
                        ? "bg-red-500/10 border-red-500/20 text-red-700"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {index === currentQuiz.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The correct answer is: {currentQuiz.options[currentQuiz.correctAnswer]}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            {!showResult ? (
              <EcoButton 
                variant="eco" 
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </EcoButton>
            ) : (
              <EcoButton variant="eco" onClick={handleNext}>
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </EcoButton>
            )}
          </div>
        </EcoCardContent>
      </EcoCard>
    </div>
  )
}