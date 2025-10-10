import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EcoButton } from "@/components/ui/eco-button"
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, TrendingUp, FileText, CheckCircle, XCircle, Clock, Award, BookOpen, Target, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { SubmissionDetailsDisplay } from "./SubmissionDetailsDisplay"

interface Student {
  id: string
  user_id: string
  display_name: string
  level: number
  eco_points: number
  completed_lessons: number
  completed_missions: number
  region_district: string
  region_state: string
  region_country: string
}

interface MissionSubmission {
  id: string
  mission_id: string
  status: string
  submission_data: any
  submission_files: string[]
  video_url: string | null
  submitted_at: string
  reviewer_notes: string | null
  points_awarded: number
  missions: {
    title: string
    points: number
  }
}

interface StudentDetailsModalProps {
  student: Student
  organizationName: string
  onClose: () => void
}

export function StudentDetailsModal({ student, organizationName, onClose }: StudentDetailsModalProps) {
  const queryClient = useQueryClient()
  const [reviewNotes, setReviewNotes] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<MissionSubmission | null>(null)
  const [viewingVideo, setViewingVideo] = useState<string | null>(null)
  const [resolvedVideoUrls, setResolvedVideoUrls] = useState<Record<string, string>>({})


  // Fetch student's mission submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['student-submissions', student.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          missions (
            title,
            points
          )
        `)
        .eq('user_id', student.user_id)
        .order('submitted_at', { ascending: false })
      
      if (error) throw error
      return data as MissionSubmission[]
    },
  })

  useEffect(() => {
    if (!submissions || submissions.length === 0) {
      setResolvedVideoUrls({})
      return
    }
    let isCancelled = false
    const resolveUrls = async () => {
      const map: Record<string, string> = {}
      for (const s of submissions) {
        if (!s.video_url) continue
        if (s.video_url.startsWith('http')) {
          const m = s.video_url.match(/\/object\/(public|sign)\/mission-videos\/(.+)$/)
          if (m && m[1] === 'public') {
            const key = m[2]
            const { data, error } = await supabase.storage
              .from('mission-videos')
              .createSignedUrl(key, 60 * 60)
            if (!error && data?.signedUrl) {
              map[s.id] = data.signedUrl
            } else {
              map[s.id] = s.video_url
            }
          } else {
            map[s.id] = s.video_url
          }
        } else {
          const { data, error } = await supabase.storage
            .from('mission-videos')
            .createSignedUrl(s.video_url, 60 * 60)
          if (!error && data?.signedUrl) {
            map[s.id] = data.signedUrl
          }
        }
      }
      if (!isCancelled) setResolvedVideoUrls(map)
    }
    resolveUrls()
    return () => { isCancelled = true }
  }, [submissions])

  // Get student's leaderboard position
  const { data: leaderboardPosition } = useQuery({
    queryKey: ['student-position', student.region_district, student.region_state, student.region_country],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, eco_points')
        .eq('role', 'student')
        .eq('region_district', student.region_district)
        .eq('region_state', student.region_state)
        .eq('region_country', student.region_country)
        .order('eco_points', { ascending: false })
      
      if (error) throw error
      
      const position = data.findIndex(p => p.user_id === student.user_id) + 1
      return { position, totalStudents: data.length }
    },
  })

  // Mutation for approving/rejecting submissions
  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, status, notes, pointsAwarded }: {
      submissionId: string
      status: 'approved' | 'rejected'
      notes: string
      pointsAwarded: number
    }) => {
      const { error } = await supabase
        .from('mission_submissions')
        .update({
          status,
          reviewer_notes: notes,
          points_awarded: pointsAwarded,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId)
      
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions', student.user_id] })
      toast.success(`Submission ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`)
      setSelectedSubmission(null)
      setReviewNotes("")
    },
  })

  const handleReviewSubmission = (submission: MissionSubmission, status: 'approved' | 'rejected') => {
    const pointsAwarded = status === 'approved' ? submission.missions.points : 0
    reviewSubmissionMutation.mutate({
      submissionId: submission.id,
      status,
      notes: reviewNotes,
      pointsAwarded
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle
      case 'rejected': return XCircle
      case 'submitted': return Clock
      default: return FileText
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {student.display_name} - Student Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({submissions.filter(s => s.status === 'submitted').length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Info */}
              <EcoCard>
                <EcoCardHeader>
                  <EcoCardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student Info
                  </EcoCardTitle>
                </EcoCardHeader>
                <EcoCardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{student.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium">Level {student.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{student.region_district}, {student.region_state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leaderboard Position</p>
                    <p className="font-medium">
                      #{leaderboardPosition?.position || 'N/A'} of {leaderboardPosition?.totalStudents || 'N/A'}
                    </p>
                  </div>
                </EcoCardContent>
              </EcoCard>

              {/* Performance Stats */}
              <EcoCard>
                <EcoCardHeader>
                  <EcoCardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance
                  </EcoCardTitle>
                </EcoCardHeader>
                <EcoCardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">Eco Points</span>
                    </div>
                    <span className="font-medium">{student.eco_points}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Lessons</span>
                    </div>
                    <span className="font-medium">{student.completed_lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Missions</span>
                    </div>
                    <span className="font-medium">{student.completed_missions}</span>
                  </div>
                </EcoCardContent>
              </EcoCard>

              {/* Recent Activity */}
              <EcoCard>
                <EcoCardHeader>
                  <EcoCardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Activity
                  </EcoCardTitle>
                </EcoCardHeader>
                <EcoCardContent>
                  <div className="space-y-2 text-sm">
                    {submissions.slice(0, 3).map((submission) => {
                      const StatusIcon = getStatusIcon(submission.status)
                      return (
                        <div key={submission.id} className="flex items-center gap-2">
                          <StatusIcon className="h-3 w-3" />
                          <span className="truncate">{submission.missions.title}</span>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                      )
                    })}
                    {submissions.length === 0 && (
                      <p className="text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </EcoCardContent>
              </EcoCard>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {submissions.filter(s => s.status === 'submitted').map((submission) => (
                  <EcoCard key={submission.id}>
                    <EcoCardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-3">{submission.missions.title}</h4>
                          
                          <SubmissionDetailsDisplay
                            submissionData={submission.submission_data}
                            submittedAt={submission.submitted_at}
                          />

                          {/* Video Preview */}
                          {submission.video_url && (
                            <div className="mt-4">
                              <EcoButton
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingVideo(resolvedVideoUrls[submission.id] || submission.video_url)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Submitted Video
                              </EcoButton>
                            </div>
                          )}

                          {!submission.video_url && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertCircle className="h-4 w-4" />
                              <span>No video submitted - approval not possible</span>
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <EcoButton
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                          disabled={!submission.video_url}
                        >
                          {submission.video_url ? 'Review' : 'No Video - Cannot Approve'}
                        </EcoButton>
                        <EcoButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setReviewNotes("")
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </EcoButton>
                      </div>
                    </EcoCardContent>
                  </EcoCard>
                ))}
                {submissions.filter(s => s.status === 'submitted').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending submissions to review.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const StatusIcon = getStatusIcon(submission.status)
                  return (
                    <EcoCard key={submission.id}>
                      <EcoCardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <StatusIcon className="h-5 w-5 mt-0.5" />
                            <div>
                              <h4 className="font-medium">{submission.missions.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {submission.submitted_at && `Submitted: ${new Date(submission.submitted_at).toLocaleDateString()}`}
                              </p>
                              {submission.reviewer_notes && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">
                                  <strong>Review Notes:</strong> {submission.reviewer_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                            {submission.points_awarded > 0 && (
                              <p className="text-sm text-primary mt-1">
                                +{submission.points_awarded} points
                              </p>
                            )}
                          </div>
                        </div>
                      </EcoCardContent>
                    </EcoCard>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Review Submission Modal */}
        {selectedSubmission && (
          <Dialog open={true} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Submission: {selectedSubmission.missions.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <SubmissionDetailsDisplay
                  submissionData={selectedSubmission.submission_data}
                  submittedAt={selectedSubmission.submitted_at}
                />

                {/* Video Preview */}
                {selectedSubmission.video_url && (
                  <div>
                    <h4 className="font-medium mb-2">Submission Video</h4>
                    <video 
                      controls 
                      className="w-full rounded-lg max-h-[500px]"
                      preload="metadata"
                      crossOrigin="anonymous"
                    >
                      <source src={resolvedVideoUrls[selectedSubmission.id] || selectedSubmission.video_url} type="video/mp4" />
                      <source src={resolvedVideoUrls[selectedSubmission.id] || selectedSubmission.video_url} type="video/webm" />
                      <source src={resolvedVideoUrls[selectedSubmission.id] || selectedSubmission.video_url} type="video/ogg" />
                      <source src={resolvedVideoUrls[selectedSubmission.id] || selectedSubmission.video_url} type="video/quicktime" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {!selectedSubmission.video_url && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                          No Video Submitted
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          This mission requires video proof for approval. The student has not uploaded a video yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <EcoButton
                    onClick={() => handleReviewSubmission(selectedSubmission, 'approved')}
                    disabled={reviewSubmissionMutation.isPending || !selectedSubmission.video_url}
                    className="flex-1"
                    title={!selectedSubmission.video_url ? "Video proof is required for approval" : ""}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {selectedSubmission.video_url ? `Approve (+${selectedSubmission.missions.points} points)` : 'No Video - Cannot Approve'}
                  </EcoButton>
                  <EcoButton
                    variant="outline"
                    onClick={() => handleReviewSubmission(selectedSubmission, 'rejected')}
                    disabled={reviewSubmissionMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </EcoButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Video Viewer Modal */}
        {viewingVideo && (
          <Dialog open={true} onOpenChange={() => setViewingVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Submission Video</DialogTitle>
              </DialogHeader>
              <div>
                <video 
                  controls 
                  className="w-full rounded-lg max-h-[600px]"
                  autoPlay
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  <source src={viewingVideo} type="video/mp4" />
                  <source src={viewingVideo} type="video/webm" />
                  <source src={viewingVideo} type="video/ogg" />
                  <source src={viewingVideo} type="video/quicktime" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}