import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LessonCompletionAnimationProps {
  title: string
  onComplete: () => void
}

export function LessonCompletionAnimation({ title, onComplete }: LessonCompletionAnimationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 500)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative"
          >
            {/* Sparkles background */}
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-120px)`
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              ))}
            </motion.div>

            {/* Main content */}
            <motion.div
              className="relative bg-card border-2 border-primary rounded-2xl p-12 shadow-2xl max-w-md"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="relative bg-primary rounded-full p-6">
                    <BookOpen className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Lesson Complete!
              </motion.h2>

              <motion.p
                className="text-center text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {title}
              </motion.p>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-5xl font-bold text-primary mb-2">🎉</div>
                <p className="text-sm text-muted-foreground">
                  Great job! Keep learning!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
