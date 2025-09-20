import { useState, useRef, useEffect } from "react"
import { EcoButton } from "@/components/ui/eco-button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react"

interface VideoPlayerProps {
  lesson: {
    id: string
    title: string
    content: any
  }
  onProgressUpdate: (progress: number) => void
  onComplete: () => void
  onClose: () => void
}

export function VideoPlayer({ lesson, onProgressUpdate, onComplete, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Sample video URL - in real app, this would come from lesson.content
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)
      const progressPercent = (video.currentTime / video.duration) * 100
      setProgress(progressPercent)
      onProgressUpdate(progressPercent)

      // Complete lesson when 90% watched
      if (progressPercent >= 90) {
        onComplete()
      }
    }

    const updateDuration = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [onProgressUpdate, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
        <EcoButton variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </EcoButton>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="relative w-full max-w-4xl aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="space-y-2">
              {/* Progress Bar */}
              <Progress value={progress} className="h-1 bg-white/20" />
              
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <EcoButton
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </EcoButton>
                  
                  <EcoButton
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </EcoButton>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="text-sm">
                  Progress: {Math.round(progress)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}