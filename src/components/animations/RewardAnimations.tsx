import { useEffect } from 'react'
import { useRewards } from '@/contexts/RewardsContext'
import { LessonCompletionAnimation } from './LessonCompletionAnimation'
import { MissionCompletionAnimation } from './MissionCompletionAnimation'
import { EcoPointsClaimAnimation } from './EcoPointsClaimAnimation'
import { LevelUpAnimation } from './LevelUpAnimation'
import { useProfile } from '@/hooks/useProfile'

export function RewardAnimations() {
  const { rewards, claimReward, removeReward, addReward } = useRewards()

  // Auto-trigger celebrations for activity that happened while user was away
  // We compare last seen profile snapshot with current one and enqueue animations
  // This runs when profile loads in the session
  try {
    // dynamic import to avoid cyclic deps at module init
  } catch {}

  const { profile } = useProfile()

  useEffect(() => {
    if (!profile?.user_id) return
    const key = `rewards:last:${profile.user_id}`
    const lastRaw = localStorage.getItem(key)
    const last = lastRaw ? JSON.parse(lastRaw) as { eco_points: number; level: number; completed_lessons: number; completed_missions: number } : null

    if (last) {
      const deltaPoints = (profile.eco_points ?? 0) - (last.eco_points ?? 0)
      const deltaLessons = (profile.completed_lessons ?? 0) - (last.completed_lessons ?? 0)
      const deltaMissions = (profile.completed_missions ?? 0) - (last.completed_missions ?? 0)
      const levelUp = (profile.level ?? 1) > (last.level ?? 1)

      if (deltaMissions > 0) {
        addReward({ type: 'mission', title: `${deltaMissions} mission${deltaMissions>1?'s':''} approved while you were away`, points: Math.max(0, deltaPoints) })
      }
      if (deltaLessons > 0) {
        // lessons grant eco points too; if deltaPoints already consumed by missions, still ok to show claim once
        addReward({ type: 'lesson', title: `${deltaLessons} lesson${deltaLessons>1?'s':''} completed while you were away`, points: 0 })
      }
      if (levelUp) {
        addReward({ type: 'level_up', title: 'Level Up!', points: 0, newLevel: profile.level })
      }
      // If points increased but no missions detected, still show claim
      if (deltaPoints > 0 && deltaMissions === 0) {
        addReward({ type: 'mission', title: `You earned ${deltaPoints} eco points while you were away`, points: deltaPoints })
      }
    }

    localStorage.setItem(key, JSON.stringify({
      eco_points: profile.eco_points,
      level: profile.level,
      completed_lessons: profile.completed_lessons,
      completed_missions: profile.completed_missions,
    }))
  }, [profile?.user_id, profile?.eco_points, profile?.level, profile?.completed_lessons, profile?.completed_missions])

  return (
    <>
      {rewards.map(reward => {
        if (reward.type === 'lesson') {
          return (
            <LessonCompletionAnimation
              key={reward.id}
              title={reward.title}
              onComplete={() => {
                removeReward(reward.id)
                // Trigger eco-points animation after lesson animation
                setTimeout(() => {
                  // This will be handled by the lesson completion flow
                }, 500)
              }}
            />
          )
        }

        if (reward.type === 'mission') {
          return (
            <MissionCompletionAnimation
              key={reward.id}
              title={reward.title}
              onComplete={() => removeReward(reward.id)}
            />
          )
        }

        if (reward.type === 'level_up' && reward.newLevel) {
          return (
            <LevelUpAnimation
              key={reward.id}
              oldLevel={reward.newLevel - 1}
              newLevel={reward.newLevel}
              onComplete={() => removeReward(reward.id)}
            />
          )
        }

        return null
      })}

      {/* Show eco-points claim for all rewards with points */}
      {rewards
        .filter(r => r.points > 0 && (r.type === 'lesson' || r.type === 'mission'))
        .map(reward => (
          <EcoPointsClaimAnimation
            key={`claim-${reward.id}`}
            points={reward.points}
            title={reward.title}
            claimed={reward.claimed}
            onClaim={() => claimReward(reward.id)}
          />
        ))}
    </>
  )
}
