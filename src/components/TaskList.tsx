import React from 'react';
import { Task } from '../types';

export interface TaskListProps {
  /** List of tasks to display. */
  tasks: Task[];
}

/**
 * TaskList renders a summary of completed tasks, including the count of
 * tasks completed today and the total number of points earned. Each
 * task entry shows the name, completion time and points earned.
 */
const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  // Get today's date boundaries to compute tasks completed today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const tasksToday = tasks.filter((task: Task) => task.timestamp >= startOfDay && task.timestamp <= endOfDay);
  const totalPointsToday = tasksToday.reduce((sum: number, task: Task) => sum + (task.points || 0), 0);

  return (
    <div className="w-full max-w-md mt-6 mx-auto space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-gray-700">Tasks Today</p>
          <p className="text-2xl font-bold text-green-700">{tasksToday.length}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Points</p>
          <p className="text-2xl font-bold text-green-700">{totalPointsToday}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {tasks
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
                  +{task.points}
                </span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TaskList;
