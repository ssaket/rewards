import React, { useState } from 'react';
import { Task } from '../types';
import AchievementBadge from './AchievementBadge';

export interface TaskListProps {
  /** List of tasks to display. */
  tasks: Task[];
}

/**
 * TaskList renders a summary of completed tasks, including the count of
 * tasks completed today and the total points earned. Each
 * task entry shows the name, completion time and points awarded.
*/
const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  // Get today's date boundaries to compute tasks completed today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const tasksToday = tasks.filter(
    (task: Task) => task.timestamp >= startOfDay && task.timestamp <= endOfDay,
  );
  const totalPointsToday = tasksToday.reduce((sum: number, task: Task) => sum + (task.points || 0), 0);

  // Tasks from previous days
  const previousTasks = tasks.filter((task: Task) => task.timestamp < startOfDay);
  const [showPrevious, setShowPrevious] = useState(false);

  // Total points across all tasks for badge milestones
  const totalPoints = tasks.reduce((sum: number, task: Task) => sum + (task.points || 0), 0);

  // Calculate the current daily streak
  const calculateStreak = (): number => {
    if (tasks.length === 0) return 0;
    const daySet = new Set(tasks.map((t) => t.timestamp.toDateString()));
    const day = new Date();
    let streak = 0;
    while (daySet.has(day.toDateString())) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
    return streak;
  };
  const streak = calculateStreak();

  return (
    <div className="w-full max-w-md mt-6 mx-auto space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-gray-700">Tasks Today</p>
          <p className="text-2xl font-bold text-green-700">{tasksToday.length}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Coins Earned</p>
          <p className="text-2xl font-bold text-green-700">{totalPointsToday}</p>
        </div>
      </div>
      <AchievementBadge totalPoints={totalPoints} streak={streak} />
      <ul className="space-y-2">
        {tasksToday
          .slice()
          .sort((a: Task, b: Task) => b.timestamp.getTime() - a.timestamp.getTime())
          .map((task: Task) => (
            <li
              key={task.id}
              className="bg-white/80 backdrop-blur-sm rounded-md p-3 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-800">{task.name}</p>
                <p className="text-xs text-gray-500">
                  {task.timestamp.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {task.points !== undefined && (
                <span className="bg-green-200 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                  ⭐ {task.points} coins
                </span>
              )}
            </li>
          ))}
      </ul>

      {previousTasks.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowPrevious((prev) => !prev)}
            className="w-full flex justify-between items-center bg-white/70 backdrop-blur-sm rounded-md px-4 py-2 shadow hover:shadow-md transition"
          >
            <span className="font-medium text-gray-700">Previous Tasks</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${showPrevious ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul
            className={`space-y-2 overflow-hidden transition-all duration-300 ${showPrevious ? 'max-h-screen mt-2' : 'max-h-0'}`}
          >
            {previousTasks
              .slice()
              .sort((a: Task, b: Task) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((task: Task) => (
                <li
                  key={task.id}
                  className="bg-white/80 backdrop-blur-sm rounded-md p-3 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-medium text-gray-800">{task.name}</p>
                    <p className="text-xs text-gray-500">
                      {task.timestamp.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      {task.timestamp.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {task.points !== undefined && (
                    <span className="bg-green-200 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                      ⭐ {task.points} coins
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskList;
