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
