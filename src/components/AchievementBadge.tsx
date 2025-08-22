import React from 'react';

export interface AchievementBadgeProps {
  /** Total points accumulated across all tasks */
  totalPoints: number;
  /** Points earned today */
  todayPoints: number;
  /** Number of consecutive days with at least one task */
  streak: number;
}

/**
 * Determine which daily badge label to show based on points earned today.
 * Returns null if no badge threshold has been reached.
 */
function getDailyBadgeLabel(points: number): string | null {
  if (points >= 30) return 'Amazing Day';
  if (points >= 20) return 'Great Day';
  if (points >= 10) return 'Good Day';
  return null;
}

/**
 * AchievementBadge shows daily progress badges and streak tracking.
 * Daily badges reset each day based on today's points, while streaks
 * track consecutive days with completed tasks.
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({ todayPoints, streak }) => {
  const dailyBadge = getDailyBadgeLabel(todayPoints);
  return (
    <div className="flex space-x-2 mt-2">
      {dailyBadge && (
        <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
          🌟 {dailyBadge}
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
