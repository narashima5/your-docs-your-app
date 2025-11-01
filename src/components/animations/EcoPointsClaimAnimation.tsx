import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Sparkles } from 'lucide-react'
import { EcoButton } from '@/components/ui/eco-button'

interface EcoPointsClaimAnimationProps {
  points: number
  title: string
  claimed: boolean
  onClaim: () => void
}

export function EcoPointsClaimAnimation({ 
  points, 
  title, 
  claimed, 
  onClaim 
}: EcoPointsClaimAnimationProps) {
  return (
    <AnimatePresence>
      {!claimed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.2, y: -50, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative"
          >
            {/* Floating coins */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: Math.cos(i * 30 * Math.PI / 180) * 150,
                  y: Math.sin(i * 30 * Math.PI / 180) * 150,
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <Coins className="h-6 w-6 text-accent" />
              </motion.div>
            ))}

            {/* Main card */}
            <motion.div
              className="relative bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent rounded-3xl p-12 shadow-2xl max-w-md backdrop-blur-sm"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(var(--accent), 0.3)",
                  "0 0 60px rgba(var(--accent), 0.6)",
                  "0 0 20px rgba(var(--accent), 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Sparkle effect */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8 text-accent" />
              </motion.div>

              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <motion.div
                  className="relative"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-accent rounded-full p-8 shadow-xl">
                    <Coins className="h-16 w-16 text-accent-foreground" />
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-accent/30 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>

              <motion.h2
                className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                You Earned Points!
              </motion.h2>

              <motion.p
                className="text-center text-muted-foreground mb-6 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {title}
              </motion.p>

              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <motion.div
                  className="text-7xl font-bold text-accent mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  +{points}
                </motion.div>
                <p className="text-lg text-muted-foreground">Eco Points</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <EcoButton
                  onClick={onClaim}
                  size="lg"
                  className="relative overflow-hidden group"
                >
                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Claim Points! 🎁
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </EcoButton>
              </motion.div>

              <motion.p
                className="text-center text-xs text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Click the button to claim your points!
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
