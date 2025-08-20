import React, { useState, useEffect } from 'react';
import { Task, PlanningTask, Priority } from './types';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import BackgroundAnimation from './components/BackgroundAnimation';
import ProgressChart from './components/ProgressChart';
import PlanningTab from './components/PlanningTab';

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
  const [planningTasks, setPlanningTasks] = useState<PlanningTask[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'planning'>('tasks');

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

    const storedPlanning = localStorage.getItem('planningTasks');
    if (storedPlanning) {
      try {
        const parsed: PlanningTask[] = JSON.parse(storedPlanning).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));
        setPlanningTasks(parsed);
      } catch (err) {
        console.error('Failed to parse planning tasks from localStorage', err);
      }
    }
  }, []);

  // Persist tasks whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist planning tasks whenever they change
  useEffect(() => {
    localStorage.setItem('planningTasks', JSON.stringify(planningTasks));
  }, [planningTasks]);

  /**
   * Handle the addition of a new task by creating a Task object and
   * updating state. Note that the timestamp is always set to the
   * current date to reflect the time of completion.
   */
  const handleAddTask = (name: string, points?: number) => {
    const newTask: Task = {
      id: generateId(),
      name,
      timestamp: new Date(),
      points,
    };
    setTasks((prev: Task[]) => [...prev, newTask]);
  };

  /**
   * Handle the addition of a new planning task.
   */
  const handleAddPlanningTask = (name: string) => {
    const newPlanningTask: PlanningTask = {
      id: generateId(),
      name,
      priority: 'low', // Default to low priority
      createdAt: new Date(),
    };
    setPlanningTasks((prev: PlanningTask[]) => [...prev, newPlanningTask]);
  };

  /**
   * Handle updating a planning task's priority (for drag and drop).
   */
  const handleUpdatePlanningTaskPriority = (taskId: string, newPriority: Priority) => {
    setPlanningTasks((prev: PlanningTask[]) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task
      )
    );
  };

  /**
   * Handle deleting a planning task.
   */
  const handleDeletePlanningTask = (taskId: string) => {
    setPlanningTasks((prev: PlanningTask[]) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-10 px-4 bg-gradient-to-b from-green-100 via-blue-100 to-purple-200 overflow-hidden">
      {/* D3-powered animated background */}
      <BackgroundAnimation />
      {/* Main content wrapper to ensure proper stacking context */}
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold text-center text-green-800 mb-6 drop-shadow">
          Personal Task Reward System
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-green-700 hover:bg-green-100'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'planning'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Planning
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' ? (
          <div className="w-full max-w-xl mx-auto">
            <AddTask onAdd={handleAddTask} planningTasks={planningTasks} />
            <TaskList tasks={tasks} />
            <ProgressChart tasks={tasks} />
          </div>
        ) : (
          <PlanningTab
            planningTasks={planningTasks}
            onAddTask={handleAddPlanningTask}
            onUpdatePriority={handleUpdatePlanningTaskPriority}
            onDeleteTask={handleDeletePlanningTask}
          />
        )}
      </div>
    </div>
  );
};

export default App;
