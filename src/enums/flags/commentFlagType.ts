/**
 * Flags for inappropriate or unnecessary comments.
 */
export enum CommentFlagType {
  /**
   * The comment contains harassment, hate speech, or abuse.
   */
  HarassmentOrAbuse = "HarassmentOrAbuse",

  /**
   * The comment is rude, sarcastic, or condescending in tone.
   */
  UnfriendlyOrRude = "UnfriendlyOrRude",

  /**
   * The comment does not add value or is unnecessary (e.g., "thanks").
   */
  NotNeeded = "NotNeeded",

  /**
   * The comment is spam or contains promotional content.
   */
  Spam = "Spam",

  /**
   * The comment doesn't fit other categories but should be flagged.
   */
  Other = "Other",
}
