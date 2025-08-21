/**
 * Defines the structure of a task item within the task reward application.
 *
 * Each task contains a unique identifier, a name describing the task,
 * a timestamp marking when it was completed, and an optional amount
 * of points awarded for finishing the task. The id property is useful
 * for efficiently rendering and updating list items in React.
 */
export interface Task {
  /** Unique identifier for the task. Could be generated using nanoid() or similar. */
  id: string;
  /** The descriptive name of the completed task (e.g., "Solved coding problem"). */
  name: string;
  /** When the task was completed. Stored as a Date object for easy formatting. */
  timestamp: Date;
  /** Optional points earned from completing the task. Defaults to 0 if omitted. */
  points?: number;
}

/**
 * Defines the priority levels for planning tasks.
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Reminder options for planning tasks.
 */
export type ReminderOption = '1hr' | '2hr' | 'custom';

/**
 * Reminder configuration for a planning task.
 */
export interface TaskReminder {
  /** Whether reminder is enabled. */
  enabled: boolean;
  /** Type of reminder (1hr, 2hr, custom). */
  option: ReminderOption;
  /** Custom time in minutes (only used when option is 'custom'). */
  customMinutes?: number;
  /** Timeout ID for scheduled notification (used internally). */
  timeoutId?: number;
}

/**
 * Defines the structure of a planning task item for the planning tab.
 *
 * Planning tasks are different from completed tasks - they represent
 * future work that needs to be organized and prioritized.
 */
export interface PlanningTask {
  /** Unique identifier for the planning task. */
  id: string;
  /** The descriptive name of the task to be completed. */
  name: string;
  /** Priority level of the task. */
  priority: Priority;
  /** When the planning task was created. */
  createdAt: Date;
  /** Optional reminder configuration for the task. */
  reminder?: TaskReminder;
}
