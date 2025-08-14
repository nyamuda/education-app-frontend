/**
 * Tracks the state of an item deletion process.
 * This class can be used for any type of entity (e.g., curriculum, subject, exam board)
 */
export class DeletionState {
  /**
   * @param id The ID of the item being deleted.
   * @param inProgress Whether the deletion is currently in progress.
   * @param type Optional type of the item (e.g., "curriculum", "subject").
   */
  constructor(
    public id: string | number | null = null,
    public inProgress: boolean = false,
    public error: string | null = null,
    public type?: string,
  ) {}
}
