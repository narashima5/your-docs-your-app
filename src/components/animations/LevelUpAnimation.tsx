import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LevelUpAnimationProps {
  oldLevel: number
  newLevel: number
  onComplete: () => void
}

export function LevelUpAnimation({ oldLevel, newLevel, onComplete }: LevelUpAnimationProps) {
  const [show, setShow] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(oldLevel)

  useEffect(() => {
    // Animate level progression
    const interval = setInterval(() => {
      setCurrentLevel(prev => {
        if (prev >= newLevel) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 300)

    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 500)
    }, 4000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [newLevel, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative"
          >
            {/* Rays of light */}
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 bg-gradient-to-r from-transparent via-warning to-transparent"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '300px',
                  transformOrigin: 'left center',
                  transform: `rotate(${i * 22.5}deg)`
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
              />
            ))}

            {/* Stars */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -50]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              >
                <Star className="h-4 w-4 text-warning fill-warning" />
              </motion.div>
            ))}

            {/* Main content */}
            <motion.div
              className="relative bg-gradient-to-br from-warning/20 to-primary/20 border-4 border-warning rounded-3xl p-16 shadow-2xl max-w-lg backdrop-blur-sm"
              animate={{ 
                boxShadow: [
                  "0 0 40px rgba(var(--warning), 0.4)",
                  "0 0 80px rgba(var(--warning), 0.8)",
                  "0 0 40px rgba(var(--warning), 0.4)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="flex justify-center mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
              >
                <motion.div
                  className="relative"
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-warning rounded-full p-10 shadow-2xl">
                    <Trophy className="h-20 w-20 text-warning-foreground" />
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-warning/40 rounded-full"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>

              <motion.h2
                className="text-5xl font-bold text-center mb-4 text-warning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                LEVEL UP!
              </motion.h2>

              <motion.div
                className="flex items-center justify-center gap-6 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="text-6xl font-bold text-muted-foreground"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ delay: 0.5 }}
                >
                  {oldLevel}
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <TrendingUp className="h-10 w-10 text-warning" />
                </motion.div>

                <motion.div
                  className="text-8xl font-bold text-warning"
                  animate={{ 
                    scale: currentLevel === newLevel ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {currentLevel}
                </motion.div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xl text-muted-foreground mb-2">
                  Congratulations!
                </p>
                <p className="text-md text-muted-foreground">
                  You've reached level {newLevel}
                </p>
              </motion.div>

              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-6xl mb-2">🎊</div>
                <p className="text-sm text-muted-foreground">
                  Keep up the amazing work!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
