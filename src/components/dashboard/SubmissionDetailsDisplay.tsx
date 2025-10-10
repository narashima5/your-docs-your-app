import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Image as ImageIcon, Video } from "lucide-react"

interface SubmissionDetailsDisplayProps {
  submissionData: any
  submittedAt: string
}

export function SubmissionDetailsDisplay({ submissionData, submittedAt }: SubmissionDetailsDisplayProps) {
  // Parse submission data
  const description = submissionData?.description || "No description provided"
  const timestamp = submissionData?.timestamp || submittedAt
  const files = submissionData?.files || []

  return (
    <div className="space-y-4">
      {/* Submission Date */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Submitted:</span>
        <span className="font-medium">
          {new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Description</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </div>

      {/* Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Attached Files</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file: string, index: number) => {
              const isVideo = file.match(/\.(mp4|webm|ogg|mov)$/i)
              const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              
              return (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="flex items-center gap-1"
                >
                  {isVideo ? (
                    <Video className="h-3 w-3" />
                  ) : isImage ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  File {index + 1}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
