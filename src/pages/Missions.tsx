import { useState } from "react"
import { EcoCard, EcoCardContent, EcoCardDescription, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { EcoButton } from "@/components/ui/eco-button"
import { StatsCard } from "@/components/ui/stats-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Filter, Target, Coins, Award, CheckCircle, Clock, Camera, Loader, Trophy } from "lucide-react"
import { Link } from "react-router-dom"
import { useMissions } from "@/hooks/useMissions"
import { useProfile } from "@/hooks/useProfile"
import { FileUpload } from "@/components/missions/FileUpload"
import { Leaderboard } from "@/components/missions/Leaderboard"
import { MissionDetailsModal } from "@/components/missions/MissionDetailsModal"
import { BadgesList } from "@/components/dashboard/BadgesList"

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

export default function Missions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showSubmissionForm, setShowSubmissionForm] = useState<string | null>(null)
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])
  const [submissionDescription, setSubmissionDescription] = useState("")
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [selectedMission, setSelectedMission] = useState<any>(null)
  const [showBadges, setShowBadges] = useState(false)
  
  const { missions, missionStats, isLoading, startMission, submitMission, isStartingMission, isSubmittingMission } = useMissions()
  const { profile } = useProfile()

  const categories = ["all", ...Array.from(new Set(missions?.map(m => m.category) || []))]
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredMissions = missions?.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || mission.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || mission.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  }) || []

  const handleSubmissionSubmit = (missionId: string) => {
    if (submissionFiles.length === 0) {
      return
    }

    // In real app, files would be uploaded to storage first
    const fileUrls = submissionFiles.map(file => URL.createObjectURL(file))
    
    submitMission({
      missionId,
      submissionData: {
        files: fileUrls,
        description: submissionDescription,
        timestamp: new Date().toISOString()
      }
    })

    setShowSubmissionForm(null)
    setSubmissionFiles([])
    setSubmissionDescription("")
  }

  const getActionButton = (mission: any) => {
    const handleAction = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (mission.status === "not_started") {
        startMission(mission.id)
      } else if (mission.status === "in_progress") {
        setShowSubmissionForm(mission.id)
      }
    }

    switch (mission.status) {
      case "not_started":
        return (
          <EcoButton 
            variant="eco" 
            className="w-full"
            onClick={handleAction}
            disabled={isStartingMission}
          >
            {isStartingMission ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            Start Mission
          </EcoButton>
        )
      case "in_progress":
        return (
          <EcoButton 
            variant="nature" 
            className="w-full"
            onClick={handleAction}
            disabled={isSubmittingMission}
          >
            {isSubmittingMission ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
            Submit Proof
          </EcoButton>
        )
      case "submitted":
        return (
          <EcoButton variant="outline" className="w-full" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Under Review
          </EcoButton>
        )
      case "approved":
        return (
          <EcoButton variant="outline" className="w-full" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </EcoButton>
        )
      case "rejected":
        return (
          <EcoButton variant="destructive" className="w-full" onClick={handleAction}>
            <Target className="h-4 w-4 mr-2" />
            Retry Mission
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
          <p className="text-muted-foreground">Loading missions...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Environmental Missions</h1>
              <p className="text-muted-foreground mt-1">Take action and make a real-world impact</p>
            </div>
          </div>
          
          <EcoButton
            variant="eco"
            onClick={() => setShowLeaderboard(true)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </EcoButton>
        </div>

        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Tasks"
            value={missionStats?.totalTasks || missions?.length || 0}
            icon={Target}
            variant="primary"
          />
          <StatsCard
            title="Completed Tasks"
            value={missionStats?.completedTasks || 0}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Eco-Points Earned"
            value={profile?.eco_points || 0}
            icon={Coins}
            variant="accent"
          />
          <div onClick={() => setShowBadges(true)} className="cursor-pointer">
            <StatsCard
              title="Badges Earned"
              value={profile?.badges?.length || 0}
              icon={Award}
              variant="warning"
            />
          </div>
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
            <EcoCard 
              key={mission.id} 
              variant="interactive" 
              className="group cursor-pointer" 
              onClick={() => setSelectedMission(mission)}
            >
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
                
                <EcoCardTitle className="text-lg line-clamp-2 mb-2 hover:text-primary transition-colors">
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
                    <span className="font-medium">{mission.estimated_time}</span>
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

        {/* Submission Form Modal */}
        {showSubmissionForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <EcoCard className="w-full max-w-2xl">
              <EcoCardHeader>
                <EcoCardTitle>Submit Mission Proof</EcoCardTitle>
                <EcoCardDescription>
                  Upload photos/videos and describe how you completed this mission
                </EcoCardDescription>
              </EcoCardHeader>
              <EcoCardContent className="space-y-6">
                <FileUpload
                  onFilesChange={setSubmissionFiles}
                  acceptedTypes={["image/*", "video/*"]}
                  maxFiles={5}
                  maxSizePerFile={50}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe how you completed this mission..."
                    value={submissionDescription}
                    onChange={(e) => setSubmissionDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3">
                  <EcoButton
                    variant="eco"
                    onClick={() => handleSubmissionSubmit(showSubmissionForm)}
                    disabled={submissionFiles.length === 0 || !submissionDescription.trim()}
                  >
                    Submit Mission
                  </EcoButton>
                  <EcoButton
                    variant="outline"
                    onClick={() => {
                      setShowSubmissionForm(null)
                      setSubmissionFiles([])
                      setSubmissionDescription("")
                    }}
                  >
                    Cancel
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
              <Leaderboard />
              <div className="mt-4 text-center">
                <EcoButton variant="outline" onClick={() => setShowLeaderboard(false)}>
                  Close
                </EcoButton>
              </div>
            </div>
          </div>
        )}

        {/* Mission Details Modal */}
        {selectedMission && (
          <MissionDetailsModal
            mission={selectedMission}
            onClose={() => setSelectedMission(null)}
            onStart={(missionId) => {
              startMission(missionId)
              setSelectedMission(null)
            }}
          />
        )}

        {/* Badges Modal */}
        {showBadges && <BadgesList onClose={() => setShowBadges(false)} />}
      </div>
    </div>
  )
}