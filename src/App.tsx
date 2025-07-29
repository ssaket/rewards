import React, { useState, useEffect } from 'react';
import { Task } from './types';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import BackgroundAnimation from './components/BackgroundAnimation';
import ProgressChart from './components/ProgressChart';

/**
 * Generates a pseudo-unique identifier string. We avoid importing heavy
 * dependencies like nanoid for such a simple example. Combining the
 * current timestamp with a random suffix is sufficiently unique for
 * client-side usage.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * The main App component orchestrates the state of the task list,
 * renders the background animation and composes the child components
 * responsible for adding tasks and displaying them. It uses React
 * hooks to manage the list of tasks and passes down callbacks to
 * children for modifying that state.
 */
const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load any persisted tasks on initial mount
  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      try {
        const parsed: Task[] = JSON.parse(stored).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        setTasks(parsed);
      } catch (err) {
        console.error('Failed to parse tasks from localStorage', err);
      }
    }
  }, []);

  // Persist tasks whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  /**
   * Handle the addition of a new task by creating a Task object and
   * updating state. Note that the timestamp is always set to the
   * current date to reflect the time of completion.
   */
  const handleAddTask = (name: string, amount?: number) => {
    const newTask: Task = {
      id: generateId(),
      name,
      timestamp: new Date(),
      amount,
    };
    setTasks((prev: Task[]) => [...prev, newTask]);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-10 px-4 bg-gradient-to-b from-green-100 via-blue-100 to-purple-200 overflow-hidden">
      {/* D3-powered animated background */}
      <BackgroundAnimation />
      {/* Main content wrapper to ensure proper stacking context */}
      <div className="relative z-10 w-full max-w-xl">
        <h1 className="text-3xl font-extrabold text-center text-green-800 mb-6 drop-shadow">
          Personal Task Reward System
        </h1>
        <AddTask onAdd={handleAddTask} />
        <TaskList tasks={tasks} />
        <ProgressChart tasks={tasks} />
      </div>
    </div>
  );
};

export default App;
