import React from 'react';

export interface AchievementBadgeProps {
  /** Total amount accumulated across all tasks */
  totalAmount: number;
  /** Number of consecutive days with at least one task */
  streak: number;
}

/**
 * Determine which badge label to show based on the total money earned.
 * Returns null if no badge threshold has been reached.
 */
function getBadgeLabel(amount: number): string | null {
  if (amount >= 500) return 'Gold';
  if (amount >= 200) return 'Silver';
  if (amount >= 100) return 'Bronze';
  return null;
}

/**
 * AchievementBadge shows a small visual indicator of a user's progress
 * in the form of a badge for earning milestones and a streak counter.
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({ totalAmount, streak }) => {
  const badge = getBadgeLabel(totalAmount);
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
