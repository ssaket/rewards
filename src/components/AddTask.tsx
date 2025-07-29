import React, { useState } from 'react';

export interface AddTaskProps {
  /**
   * Callback invoked when the user submits a new task.
   *
   * @param name The name of the completed task.
   * @param points Points awarded for the task based on difficulty.
   */
  onAdd: (name: string, points?: number) => void;
}

/**
 * AddTask renders a button that opens a modal dialog for entering the
 * description of a completed task. The modal collects the task name
 * and difficulty level, then passes the appropriate point value back
 * to the parent via the onAdd callback.
*/
const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (taskName.trim().length === 0) return;
    const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
    onAdd(taskName.trim(), points);
    setTaskName('');
    setDifficulty('easy');
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-lg transition-colors"
        onClick={() => setIsOpen(true)}
      >
        Add Completed Task
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 max-w-xs animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Add a Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-600 mb-1">
                  Task Name
                </label>
                <input
                  id="taskName"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Solved coding problem"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-600 mb-1">Difficulty</span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { level: 'easy', label: 'Easy', points: 5 },
                      { level: 'medium', label: 'Medium', points: 10 },
                      { level: 'hard', label: 'Hard', points: 20 },
                    ] as const
                  ).map((opt) => (
                    <label key={opt.level} className="cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={opt.level}
                        className="sr-only peer"
                        checked={difficulty === opt.level}
                        onChange={() => setDifficulty(opt.level)}
                      />
                      <div
                        className="rounded-md border border-gray-300 p-2 text-center text-sm peer-checked:bg-green-600 peer-checked:text-white peer-checked:ring-2 peer-checked:ring-green-400"
                      >
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs">({opt.points} pts)</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md shadow"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;
