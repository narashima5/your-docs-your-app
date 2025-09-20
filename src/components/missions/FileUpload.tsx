import { useState, useRef } from "react"
import { EcoButton } from "@/components/ui/eco-button"
import { EcoCard, EcoCardContent } from "@/components/ui/eco-card"
import { Upload, X, File, Image, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSizePerFile?: number // in MB
}

export function FileUpload({ 
  onFilesChange, 
  acceptedTypes = ["image/*", "video/*"], 
  maxFiles = 5,
  maxSizePerFile = 50 
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const fileArray = Array.from(selectedFiles)
    const validFiles: File[] = []

    for (const file of fileArray) {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        continue
      }

      // Check file size
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSizePerFile}MB limit.`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push(file)
    }

    // Check total file count
    const totalFiles = files.length + validFiles.length
    if (totalFiles > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive",
      })
      return
    }

    const newFiles = [...files, ...validFiles]
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <EcoCard 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <EcoCardContent className="p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload proof files</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop images or videos, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports images and videos up to {maxSizePerFile}MB each (max {maxFiles} files)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </EcoCardContent>
      </EcoCard>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({files.length})</h4>
          {files.map((file, index) => (
            <EcoCard key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <EcoButton
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </EcoButton>
              </div>
            </EcoCard>
          ))}
        </div>
      )}
    </div>
  )
}