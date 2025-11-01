import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Reward {
  id: string
  type: 'lesson' | 'mission' | 'level_up'
  points: number
  title: string
  newLevel?: number
  claimed: boolean
}

interface RewardsContextType {
  rewards: Reward[]
  addReward: (reward: Omit<Reward, 'id' | 'claimed'>) => void
  claimReward: (id: string) => void
  removeReward: (id: string) => void
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined)

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [rewards, setRewards] = useState<Reward[]>([])

  const addReward = (reward: Omit<Reward, 'id' | 'claimed'>) => {
    const newReward: Reward = {
      ...reward,
      id: `${Date.now()}-${Math.random()}`,
      claimed: false
    }
    setRewards(prev => [...prev, newReward])
  }

  const claimReward = (id: string) => {
    setRewards(prev => prev.map(r => 
      r.id === id ? { ...r, claimed: true } : r
    ))
    
    // Remove after animation
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== id))
    }, 2000)
  }

  const removeReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id))
  }

  return (
    <RewardsContext.Provider value={{ rewards, addReward, claimReward, removeReward }}>
      {children}
    </RewardsContext.Provider>
  )
}

export function useRewards() {
  const context = useContext(RewardsContext)
  if (!context) {
    throw new Error('useRewards must be used within RewardsProvider')
  }
  return context
}
