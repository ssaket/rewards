import React, { useState } from 'react';

export interface AddTaskProps {
  /**
   * Callback invoked when the user submits a new task.
   *
   * @param name The name of the completed task.
   * @param amount Optional money awarded for the task.
   */
  onAdd: (name: string, amount?: number) => void;
}

/**
 * AddTask renders a button that opens a modal dialog for entering the
 * description of a completed task. The modal collects the task name
 * and optional amount, then passes that data back to the parent via
 * the onAdd callback.
*/
const AddTask: React.FC<AddTaskProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (taskName.trim().length === 0) return;
    onAdd(taskName.trim(), amount === '' ? undefined : Number(amount));
    setTaskName('');
    setAmount('');
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
                <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">
                  Amount Earned (optional)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    setAmount(val === '' ? '' : Number(val));
                  }}
                  placeholder="10.00"
                />
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
