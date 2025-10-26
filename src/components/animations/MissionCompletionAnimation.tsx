import { motion, AnimatePresence } from 'framer-motion'
import { Target, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MissionCompletionAnimationProps {
  title: string
  onComplete: () => void
}

export function MissionCompletionAnimation({ title, onComplete }: MissionCompletionAnimationProps) {
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
            {/* Concentric circles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-success"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2 + i, 3 + i], opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {/* Main content */}
            <motion.div
              className="relative bg-card border-2 border-success rounded-2xl p-12 shadow-2xl max-w-md"
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
                    className="absolute inset-0 bg-success/20 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative bg-success rounded-full p-6">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Check className="h-6 w-6 text-success" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold text-center mb-2 text-success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Mission Submitted!
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
                <div className="text-5xl font-bold mb-2">🌱</div>
                <p className="text-sm text-muted-foreground">
                  Your submission is being reviewed!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
