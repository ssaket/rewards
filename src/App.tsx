import React, { useState, useEffect } from 'react';
import { Task, PlanningTask, Priority, TaskReminder } from './types';
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
 * Request notification permission if not already granted.
 */
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Show a desktop notification for a task reminder.
 */
function showTaskNotification(taskName: string): void {
  if (Notification.permission === 'granted') {
    new Notification('Task Reminder', {
      body: `Don't forget to work on: ${taskName}`,
      icon: '/favicon.ico', // You can customize this
      tag: 'task-reminder',
    });
  }
}

/**
 * Schedule a reminder notification for a task.
 */
function scheduleReminder(task: PlanningTask): number | undefined {
  if (!task.reminder?.enabled) return undefined;

  let delayMs: number;
  
  switch (task.reminder.option) {
    case '1hr':
      delayMs = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case '2hr':
      delayMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      break;
    case 'custom':
      delayMs = (task.reminder.customMinutes || 30) * 60 * 1000; // custom minutes in milliseconds
      break;
    default:
      return undefined;
  }

  const timeoutId = window.setTimeout(() => {
    showTaskNotification(task.name);
  }, delayMs);

  return timeoutId;
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

  // Restore reminders when the app loads
  useEffect(() => {
    planningTasks.forEach(task => {
      if (task.reminder?.enabled && !task.reminder.timeoutId) {
        // Calculate remaining time since task was created
        const timeElapsed = Date.now() - task.createdAt.getTime();
        let totalDelayMs: number;
        
        switch (task.reminder.option) {
          case '1hr':
            totalDelayMs = 60 * 60 * 1000;
            break;
          case '2hr':
            totalDelayMs = 2 * 60 * 60 * 1000;
            break;
          case 'custom':
            totalDelayMs = (task.reminder.customMinutes || 30) * 60 * 1000;
            break;
          default:
            return;
        }
        
        const remainingDelayMs = totalDelayMs - timeElapsed;
        
        // Only schedule if reminder hasn't already passed
        if (remainingDelayMs > 0) {
          const timeoutId = window.setTimeout(() => {
            showTaskNotification(task.name);
          }, remainingDelayMs);
          
          // Update the task with the timeout ID
          setPlanningTasks(prev => prev.map(t => 
            t.id === task.id && t.reminder ? 
              { ...t, reminder: { ...t.reminder, timeoutId } } : 
              t
          ));
        }
      }
    });
  }, [planningTasks.length]); // Only run when tasks are added/removed

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
  const handleAddPlanningTask = async (name: string, reminder?: TaskReminder) => {
    const newPlanningTask: PlanningTask = {
      id: generateId(),
      name,
      priority: 'low', // Default to low priority
      createdAt: new Date(),
      reminder,
    };

    // If reminder is enabled, request permission and schedule it
    if (reminder?.enabled) {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        const timeoutId = scheduleReminder(newPlanningTask);
        if (timeoutId && newPlanningTask.reminder) {
          newPlanningTask.reminder.timeoutId = timeoutId;
        }
      } else {
        // If permission denied, disable the reminder
        if (newPlanningTask.reminder) {
          newPlanningTask.reminder.enabled = false;
        }
        alert('Notification permission denied. Reminder has been disabled for this task.');
      }
    }

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
    setPlanningTasks((prev: PlanningTask[]) => {
      const taskToDelete = prev.find(task => task.id === taskId);
      
      // Clear any active reminder timeout
      if (taskToDelete?.reminder?.timeoutId) {
        clearTimeout(taskToDelete.reminder.timeoutId);
      }
      
      return prev.filter((task) => task.id !== taskId);
    });
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
