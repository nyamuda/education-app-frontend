/**
 * Represents the moderation status of a flag.
 */
export enum FlagStatus {
  /**
   * The flag is pending review by a moderator.
   */
  Pending,

  /**
   * The flag has been reviewed and accepted; action was taken.
   */
  Resolved,

  /**
   * The flag was reviewed and dismissed as invalid or not actionable.
   */
  Rejected,
}
