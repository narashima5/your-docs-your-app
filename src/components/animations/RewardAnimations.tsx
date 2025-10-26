import { useRewards } from '@/contexts/RewardsContext'
import { LessonCompletionAnimation } from './LessonCompletionAnimation'
import { MissionCompletionAnimation } from './MissionCompletionAnimation'
import { EcoPointsClaimAnimation } from './EcoPointsClaimAnimation'
import { LevelUpAnimation } from './LevelUpAnimation'

export function RewardAnimations() {
  const { rewards, claimReward, removeReward } = useRewards()

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
