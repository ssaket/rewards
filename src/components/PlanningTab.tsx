import React, { useState, useRef } from 'react';
import { PlanningTask, Priority, ReminderOption, TaskReminder } from '../types';

export interface PlanningTabProps {
  /** List of planning tasks to display and organize. */
  planningTasks: PlanningTask[];
  /** Callback to add a new planning task. */
  onAddTask: (name: string, reminder?: TaskReminder) => void;
  /** Callback to update a task's priority (for drag and drop). */
  onUpdatePriority: (taskId: string, newPriority: Priority) => void;
  /** Callback to delete a planning task. */
  onDeleteTask: (taskId: string) => void;
}

/**
 * PlanningTab provides a drag-and-drop interface for organizing tasks
 * into priority buckets. Users can add new planning tasks and drag
 * them between High, Medium, and Low priority columns.
 */
const PlanningTab: React.FC<PlanningTabProps> = ({
  planningTasks,
  onAddTask,
  onUpdatePriority,
  onDeleteTask,
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [draggedTask, setDraggedTask] = useState<PlanningTask | null>(null);
  const [dragOverPriority, setDragOverPriority] = useState<Priority | null>(null);
  
  // Reminder form state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderOption, setReminderOption] = useState<ReminderOption>('1hr');
  const [customMinutes, setCustomMinutes] = useState(30);

  const priorities: { level: Priority; label: string; color: string }[] = [
    { level: 'high', label: 'High Priority', color: 'bg-red-100 border-red-300' },
    { level: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 border-yellow-300' },
    { level: 'low', label: 'Low Priority', color: 'bg-green-100 border-green-300' },
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      const reminder: TaskReminder | undefined = reminderEnabled ? {
        enabled: true,
        option: reminderOption,
        customMinutes: reminderOption === 'custom' ? customMinutes : undefined,
      } : undefined;
      
      onAddTask(newTaskName.trim(), reminder);
      setNewTaskName('');
      setReminderEnabled(false);
      setReminderOption('1hr');
      setCustomMinutes(30);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: PlanningTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDragOverPriority(null);
  };

  const handleDragOver = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPriority(priority);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverPriority(null);
    }
  };

  const handleDrop = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    if (draggedTask && draggedTask.priority !== priority) {
      onUpdatePriority(draggedTask.id, priority);
    }
    setDragOverPriority(null);
  };

  const getTasksByPriority = (priority: Priority) => {
    return planningTasks.filter(task => task.priority === priority);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Add Task Form */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Add Planning Task</h2>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter task to plan..."
              className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
            >
              Add Task
            </button>
          </div>
          
          {/* Reminder Options */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="reminder-enabled"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="reminder-enabled" className="text-sm font-medium text-gray-700">
                🔔 Set reminder for this task
              </label>
            </div>
            
            {reminderEnabled && (
              <div className="ml-7 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reminderOption"
                      value="1hr"
                      checked={reminderOption === '1hr'}
                      onChange={(e) => setReminderOption(e.target.value as ReminderOption)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">1 hour</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reminderOption"
                      value="2hr"
                      checked={reminderOption === '2hr'}
                      onChange={(e) => setReminderOption(e.target.value as ReminderOption)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">2 hours</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reminderOption"
                      value="custom"
                      checked={reminderOption === 'custom'}
                      onChange={(e) => setReminderOption(e.target.value as ReminderOption)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Custom</span>
                  </label>
                </div>
                
                {reminderOption === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 30)}
                      className="w-20 border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Priority Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priorities.map((priority) => {
          const tasks = getTasksByPriority(priority.level);
          const isDragOver = dragOverPriority === priority.level;
          
          return (
            <div
              key={priority.level}
              className={`
                ${priority.color} 
                ${isDragOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                min-h-96 rounded-lg border-2 border-dashed p-4 transition-all duration-200
              `}
              onDragOver={(e) => handleDragOver(e, priority.level)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, priority.level)}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {priority.label} ({tasks.length})
              </h3>
              
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className="bg-white/80 backdrop-blur-sm rounded-md p-3 shadow-sm cursor-move hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-2">
                        <p className="font-medium text-gray-800 flex items-center gap-1">
                          {task.reminder?.enabled && (
                            <span className="text-blue-500" title="Reminder set">🔔</span>
                          )}
                          {task.name}
                        </p>
                        {task.reminder?.enabled && (
                          <p className="text-xs text-blue-600 mt-1">
                            Reminder: {task.reminder.option === 'custom' 
                              ? `${task.reminder.customMinutes}min` 
                              : task.reminder.option}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 ml-2"
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {task.createdAt.toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                      <span className="text-xs text-gray-600">Drag to reorganize</span>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No tasks yet</p>
                    <p className="text-xs mt-1">Drag tasks here or add new ones above</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 How to use:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Add tasks using the form above - they'll start in Low Priority</li>
          <li>Drag tasks between columns to organize by priority</li>
          <li>Hover over tasks to see the delete button</li>
          <li>Use this to plan your work before moving tasks to the main task list</li>
        </ul>
      </div>
    </div>
  );
};

export default PlanningTab;