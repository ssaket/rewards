import React from 'react';

export interface AchievementBadgeProps {
  /** Total points accumulated across all tasks */
  totalPoints: number;
  /** Number of consecutive days with at least one task */
  streak: number;
}

/**
 * Determine which badge label to show based on the total points earned.
 * Returns null if no badge threshold has been reached.
 */
function getBadgeLabel(points: number): string | null {
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  if (points >= 100) return 'Bronze';
  return null;
}

/**
 * AchievementBadge shows a small visual indicator of a user's progress
 * in the form of a badge for point milestones and a streak counter.
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({ totalPoints, streak }) => {
  const badge = getBadgeLabel(totalPoints);
  return (
    <div className="flex space-x-2 mt-2">
      {badge && (
        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
          {badge} Badge
        </span>
      )}
      {streak > 1 && (
        <span className="bg-orange-200 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
          🔥 {streak}d Streak
        </span>
      )}
    </div>
  );
};

export default AchievementBadge;
